# Lab-Kanban WebSocket 即時同步開發文件

最後更新：2026-08-18

---

# 1. 專案目標

Lab-Kanban 需要支援多個瀏覽器同時操作同一份資料。

例如：

Browser A：

新增 Task

↓

Browser B：

立即看到新 Task


目標是讓以下資料都可以即時同步：

- Task
- Checklist
- Project
- Owner
- Template

---

# 2. 目前系統架構

目前 Docker：

    lab_nginx
    lab_backend
    lab_frontend
    lab_postgres

架構：

    Browser
       |
       | HTTP / WebSocket
       v
    Nginx :8080
       |
       +---- /api/ ----> FastAPI :8000
       |
       +---- /ws  -----> FastAPI WebSocket
                              |
                              v
                          PostgreSQL


Nginx WebSocket：

    location = /ws {

        proxy_pass http://lab_backend:8000/ws;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }


---

# 3. WebSocket 基礎連線目前已經正常

以下已經確認：

- Browser → Nginx WebSocket OK
- Nginx → FastAPI WebSocket OK
- FastAPI WebSocket accept OK
- websockets package OK
- 多個 browser connection OK
- broadcast OK

Backend 已經安裝：

    websockets 17.0.1


---

# 4. 目前已經成功的事件

Task：

    task.created
    task.updated
    task.deleted

已經確認兩個 browser connection 可以收到：

    [WebSocket] Active connections: 2
    [WebSocket] Message sent successfully
    [WebSocket] Message sent successfully


---

# 5. 目前尚未完成

Task：

    [x] 新增
    [x] 修改
    [x] 刪除
    [ ] 拖移完全同步


Checklist：

    [ ] 新增
    [ ] 修改文字
    [ ] 勾選
    [ ] 取消勾選
    [ ] 刪除


Project：

    [ ] 新增
    [ ] 修改
    [ ] 刪除


Owner：

    [ ] 新增
    [ ] 修改
    [ ] 刪除


Template：

    [ ] 使用
    [ ] 新增
    [ ] 修改
    [ ] 刪除


---

# 6. 新的 WebSocket 架構

不要為每一種資料建立不同的 WebSocket server。

統一使用：

    backend/app/websocket/

目前：

    websocket/
    ├── __init__.py
    ├── manager.py
    └── events.py


---

# 7. manager.py

manager.py 只負責 WebSocket connection lifecycle。

負責：

    connect()
    disconnect()
    broadcast()


不要把：

    Task business logic
    Checklist business logic
    Project business logic
    Template business logic

放進 manager.py。


---

# 8. events.py

events.py 負責：

1. 統一事件格式
2. JSON serialization
3. 呼叫 ConnectionManager broadcast


使用：

    publish_event()


例如：

    await publish_event(
        "task.created",
        task_data,
        project_id=1,
        task_id=16,
    )


---

# 9. Event 格式

統一使用：

    <entity>.<action>


例如：

    task.created
    task.updated
    task.deleted

    checklist.created
    checklist.updated
    checklist.deleted

    project.created
    project.updated
    project.deleted

    owner.created
    owner.updated
    owner.deleted

    template.created
    template.updated
    template.deleted
    template.used


Event payload：

    {
        "type": "task.updated",
        "entity": "task",
        "action": "updated",
        "project_id": 1,
        "task_id": 17,
        "data": {}
    }


---

# 10. JSON serialization

非常重要。

SQLAlchemy / Python object 不可以直接假設可以 JSON serialize。

例如：

    datetime.date(2026, 8, 18)

不能直接交給某些 JSON serializer。

events.py 使用：

    from fastapi.encoders import jsonable_encoder


並且：

    jsonable_encoder(data)


之後再：

    manager.broadcast()


這樣可以避免：

    Object of type date is not JSON serializable


---

# 11. 資料來源原則

PostgreSQL 是 Source of Truth。

REST API：

    取得目前正確資料


WebSocket：

    通知資料發生變化


不要把 WebSocket 當成資料庫。


---

# 12. 前端同步原則

理想流程：

    REST API
        |
        v
    Initial State


    WebSocket event
        |
        v
    Update local state


不要每收到一個 WebSocket event 就大量：

    GET /api/projects
    GET /api/projects/1/tasks
    GET /api/tasks/17
    GET /api/tasks/17/checklist


除非：

- WebSocket reconnect
- event payload 不完整
- local state 無法 reconcile
- 需要重新確認 server state


---

# 13. WebSocket reconnect

前端需要支援：

    connect
       |
       v
    onopen
       |
       v
    connected
       |
       v
    connection lost
       |
       v
    reconnect
       |
       v
    connected


建議 backoff：

    1 sec
    2 sec
    4 sec
    8 sec
    16 sec
    30 sec maximum


不要使用：

    setInterval(connect, 1000)


避免 WebSocket 掛掉時大量建立連線。


---

# 14. Reconnect 後重新同步

WebSocket 不是可靠 message queue。

例如：

    Browser
       |
       X connection lost
       |
       |
    Server:
       task.updated
       task.deleted
       task.created
       |
       |
    Browser reconnect


Browser 可能漏掉事件。

因此：

    WebSocket reconnect
           |
           v
    GET current server state
           |
           v
    reconcile / replace local state


這是必要的。


---

# 15. Event 實作順序

不要一次改全部。

Phase 1：

    WebSocket Event Layer

目前已建立：

    websocket/manager.py
    websocket/events.py
    websocket/__init__.py


Phase 2：

    Task

確認：

    task.created
    task.updated
    task.deleted

然後處理：

    task moved


Phase 3：

    Checklist

完成：

    checklist.created
    checklist.updated
    checklist.deleted


包含：

    新增
    修改文字
    勾選
    取消勾選
    刪除


Phase 4：

    Project

完成：

    project.created
    project.updated
    project.deleted


Phase 5：

    Owner

完成：

    owner.created
    owner.updated
    owner.deleted


Phase 6：

    Template

完成：

    template.created
    template.updated
    template.deleted
    template.used


Phase 7：

    Frontend WebSocket abstraction


---

# 16. Frontend 最終目標

目前 Projects.vue 可能包含很多 WebSocket logic。

最終希望抽成：

    frontend/src/composables/useWebSocket.js


使用方式類似：

    const {
        connected,
        connect,
        disconnect
    } = useWebSocket({
        onEvent: handleRealtimeEvent
    })


但不要現在為了這個目標一次重構整個 Projects.vue。

先完成 Backend event contract。


---

# 17. 測試方法

使用兩個瀏覽器：

    Browser A
    Browser B


兩個 browser 都開：

    同一個 Project


測試：

    A 新增 Task
    -> B 出現


    A 修改 Task
    -> B 更新


    A 拖移 Task
    -> B 更新


    A 新增 Checklist
    -> B 出現


    A 勾選 Checklist
    -> B 勾選


    A 取消 Checklist
    -> B 取消


    A 刪除 Checklist
    -> B 消失


    A 新增 Owner
    -> B 出現


    A 刪除 Owner
    -> B 消失


    A 新增 Project
    -> B 出現


    A 刪除 Project
    -> B 消失


    A 新增 Template
    -> B 出現


    A 修改 Template
    -> B 更新


    A 刪除 Template
    -> B 消失


---

# 18. Backend log

測試時：

    docker logs -f lab_backend


正常：

    [WebSocket] Broadcasting:
    [WebSocket] Active connections: 2
    [WebSocket] Message sent successfully
    [WebSocket] Message sent successfully


不能出現：

    Object of type date is not JSON serializable


不能持續出現：

    Unsupported upgrade request


---

# 19. Docker rebuild

修改 backend：

    cd ~/lab-kanban

    docker compose down

    docker compose up -d --build


確認：

    docker ps


確認：

    docker logs lab_backend --tail 50


---

# 20. 重要檔案

目前已知：

    backend/app/models.py
    backend/app/schemas.py
    backend/app/main.py

    backend/app/routers/tasks.py
    backend/app/routers/checklists.py

    backend/app/routers/projects.py
    backend/app/routers/owners.py
    backend/app/routers/templates.py


WebSocket：

    backend/app/websocket/manager.py
    backend/app/websocket/events.py
    backend/app/websocket/__init__.py


---

# 21. 開發原則

1. 不要因為一個同步問題重構整個專案。

2. 每次先確認目前檔案內容，再修改。

3. 每次只修改必要檔案。

4. Backend event payload 必須 JSON-safe。

5. PostgreSQL 是 Source of Truth。

6. REST API 負責取得正確資料。

7. WebSocket 負責通知資料變化。

8. ConnectionManager 只處理 WebSocket connection。

9. Event Layer 負責 event format 與 serialization。

10. Router 負責 business logic。

11. 不要為不同 entity 建立不同 WebSocket server。

12. 不要讓 Projects.vue 永久承擔所有 WebSocket business logic。

13. 但不要現在一次重構整個 frontend。

14. 每完成一個 entity，使用兩個 browser 測試。

15. 先確保正確性，再進行架構優化。


---

# 22. 下一次 ChatGPT 開場

下一次對話可以直接貼：

    我要繼續開發 lab-kanban。

    請先閱讀：
    WEBSOCKET_SYNC_IMPLEMENTATION.md

    目前 WebSocket 基礎架構已經正常。

    已完成：
    - Nginx /ws proxy
    - FastAPI WebSocket
    - websockets 17.0.1
    - ConnectionManager
    - task.created
    - task.updated
    - task.deleted

    已建立：
    - backend/app/websocket/manager.py
    - backend/app/websocket/events.py
    - backend/app/websocket/__init__.py

    尚未完成：
    - task drag
    - checklist realtime sync
    - project realtime sync
    - owner realtime sync
    - template realtime sync
    - frontend reconnect / resync

    請不要大規模重構。
    請按照 MD 的 Phase 順序，一次完成一個 entity。
    在修改 Router 前先要求我提供該 Router 的目前完整內容。
    修改後直接給我可以複製貼上的完整檔案。
