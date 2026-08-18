# Lab Kanban Realtime Synchronization

## Project

Lab Kanban

## Purpose

建立多人瀏覽器即時同步機制。

Database 是 Source of Truth。

WebSocket 負責即時傳遞事件。

REST API 負責：

- 初始載入
- 重新連線後重新同步
- 狀態校正
- WebSocket 斷線期間的資料恢復

---

# 1. Current Architecture

```text
PostgreSQL
    |
    v
FastAPI REST API
    |
    +--------------------+
    |                    |
    v                    v
REST Response       WebSocket Event
                         |
                         v
                 ConnectionManager
                         |
              +----------+----------+
              |          |          |
              v          v          v
          Browser A  Browser B  Browser C
              |
              v
       Frontend Event Handler
              |
              v
         Reactive State
