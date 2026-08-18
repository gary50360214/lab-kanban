import {
    ref
} from "vue"


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const API_BASE =
    "/api/templates"


/*
|--------------------------------------------------------------------------
| WebSocket
|--------------------------------------------------------------------------
*/

function getWebSocketUrl() {

    const protocol =
        window.location.protocol === "https:"
            ? "wss:"
            : "ws:"


    return `${protocol}//${window.location.host}/ws`

}


/*
|--------------------------------------------------------------------------
| Deep Clone
|--------------------------------------------------------------------------
*/

function clone(value) {

    return JSON.parse(
        JSON.stringify(value)
    )

}


/*
|--------------------------------------------------------------------------
| Normalize Status
|--------------------------------------------------------------------------
*/

function normalizeStatus(status) {

    if (!status) {

        return "todo"

    }


    const value =
        String(status)
            .trim()
            .toLowerCase()


    const map = {

        "todo":
            "todo",

        "to do":
            "todo",

        "to_do":
            "todo",


        "running":
            "running",

        "run":
            "running",

        "in progress":
            "running",

        "in_progress":
            "running",


        "waiting":
            "waiting",

        "wait":
            "waiting",


        "completed":
            "completed",

        "complete":
            "completed",

        "done":
            "completed"

    }


    return map[value] || "todo"

}


/*
|--------------------------------------------------------------------------
| Normalize Checklist Item
|--------------------------------------------------------------------------
|
| Template Checklist 只保存：
|
|     id
|     text
|
| 不保存 completed。
|
| completed 是「實際 Task」的狀態，
| 不屬於 Template。
|
|--------------------------------------------------------------------------
*/

function normalizeChecklistItem(
    item = {},
    index = 0
) {

    return {

        id:
            item.id ??
            `check-${Date.now()}-${index}`,

        text:
            item.text ??
            ""

    }

}


/*
|--------------------------------------------------------------------------
| Normalize Template
|--------------------------------------------------------------------------
*/

function normalizeTemplate(
    template = {}
) {

    return {

        id:
            template.id ??
            null,

        name:
            template.name ??
            "",

        owner:
            template.owner ??
            "",

        status:
            normalizeStatus(
                template.status
            ),

        priority:
            template.priority ??
            "不緊急也不重要",

        start:
            template.start ??
            "",

        end:
            template.end ??
            "",

        description:
            template.description ??
            "",

        /*
         * Template Checklist
         *
         * 只有文字，
         * 沒有 completed。
         */

        checklist:
            Array.isArray(
                template.checklist
            )

                ? template.checklist.map(
                    normalizeChecklistItem
                )

                : []

    }

}


/*
|--------------------------------------------------------------------------
| useTemplates
|--------------------------------------------------------------------------
*/

export function useTemplates() {

    const templates =
        ref([])


    /*
    |--------------------------------------------------------------------------
    | WebSocket State
    |--------------------------------------------------------------------------
    */

    const websocket =
        ref(null)


    let reconnectTimer =
        null


    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */

    const loading =
        ref(false)


    /*
    |--------------------------------------------------------------------------
    | WebSocket Message
    |--------------------------------------------------------------------------
    */

    function handleWebSocketMessage(
        message
    ) {

        if (!message) {

            return

        }


        /*
        |--------------------------------------------------------------------------
        | Template Created
        |--------------------------------------------------------------------------
        */

        if (
            message.type ===
            "template.created"
        ) {

            const template =
                message.data


            if (!template?.id) {

                return

            }


            const normalized =
                normalizeTemplate(
                    template
                )


            const exists =
                templates.value.some(

                    item =>
                        Number(item.id) ===
                        Number(normalized.id)

                )


            /*
             * POST 已經在目前 client
             * 加入過的話，不要重複加入。
             */

            if (exists) {

                return

            }


            templates.value.push(
                normalized
            )


            templates.value.sort(

                (a, b) =>
                    Number(a.id) -
                    Number(b.id)

            )


            return

        }


        /*
        |--------------------------------------------------------------------------
        | Template Updated
        |--------------------------------------------------------------------------
        */

        if (
            message.type ===
            "template.updated"
        ) {

            const template =
                message.data


            if (!template?.id) {

                return

            }


            const normalized =
                normalizeTemplate(
                    template
                )


            const index =
                templates.value.findIndex(

                    item =>
                        Number(item.id) ===
                        Number(normalized.id)

                )


            if (index === -1) {

                templates.value.push(
                    normalized
                )

            }
            else {

                templates.value[index] =
                    normalized

            }


            templates.value.sort(

                (a, b) =>
                    Number(a.id) -
                    Number(b.id)

            )


            return

        }


        /*
        |--------------------------------------------------------------------------
        | Template Deleted
        |--------------------------------------------------------------------------
        */

        if (
            message.type ===
            "template.deleted"
        ) {

            const templateId =
                Number(
                    message.data?.id
                )


            if (!templateId) {

                return

            }


            templates.value =
                templates.value.filter(

                    template =>
                        Number(template.id) !==
                        templateId

                )


            return

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Connect WebSocket
    |--------------------------------------------------------------------------
    */

    function connectWebSocket() {

        disconnectWebSocket()


        const url =
            getWebSocketUrl()


        console.log(
            "[Template WebSocket] Connecting:",
            url
        )


        const socket =
            new WebSocket(url)


        websocket.value =
            socket


        socket.onopen = () => {

            console.log(
                "[Template WebSocket] Connected"
            )

        }


        socket.onmessage =
            event => {

                try {

                    const message =
                        JSON.parse(
                            event.data
                        )


                    console.log(
                        "[Template WebSocket] Message:",
                        message
                    )


                    handleWebSocketMessage(
                        message
                    )

                }
                catch (error) {

                    console.error(
                        "[Template WebSocket] Invalid message:",
                        error
                    )

                }

            }


        socket.onerror =
            error => {

                console.error(
                    "[Template WebSocket] Error:",
                    error
                )

            }


        socket.onclose =
            () => {

                websocket.value =
                    null


                console.log(
                    "[Template WebSocket] Disconnected"
                )


                clearTimeout(
                    reconnectTimer
                )


                reconnectTimer =
                    setTimeout(

                        () => {

                            connectWebSocket()

                        },

                        3000

                    )

            }

    }


    /*
    |--------------------------------------------------------------------------
    | Disconnect WebSocket
    |--------------------------------------------------------------------------
    */

    function disconnectWebSocket() {

        clearTimeout(
            reconnectTimer
        )


        reconnectTimer =
            null


        if (
            websocket.value
        ) {

            try {

                websocket.value.onclose =
                    null


                websocket.value.close()

            }
            catch (error) {

                console.error(
                    "[Template WebSocket] Close error:",
                    error
                )

            }

        }


        websocket.value =
            null

    }


    /*
    |--------------------------------------------------------------------------
    | Load Templates
    |--------------------------------------------------------------------------
    */

    async function loadTemplates() {

        loading.value =
            true


        try {

            const response =
                await fetch(
                    API_BASE
                )


            if (!response.ok) {

                throw new Error(

                    `Failed to load templates: ${response.status}`

                )

            }


            const data =
                await response.json()


            templates.value =
                Array.isArray(data)

                    ? data.map(
                        normalizeTemplate
                    )

                    : []


            templates.value.sort(

                (a, b) =>
                    Number(a.id) -
                    Number(b.id)

            )


            return templates.value

        }
        catch (error) {

            console.error(
                "Failed to load templates:",
                error
            )


            throw error

        }
        finally {

            loading.value =
                false

        }

    }


/*
|--------------------------------------------------------------------------
| Create Template
|--------------------------------------------------------------------------
*/

async function createTemplate(
    template
) {

    const data =
        normalizeTemplate(
            template
        )


    /*
     * 不把 local id 傳給後端。
     */

    delete data.id


    /*
     * 空日期不能傳 ""
     *
     * FastAPI:
     *
     *     date | None
     *
     * 接受：
     *
     *     "2026-08-18"
     *     null
     *
     * 不接受：
     *
     *     ""
     */

    data.start =
        data.start || null

    data.end =
        data.end || null


    /*
     * Template Checklist
     *
     * Template 只保存：
     *
     *     text
     *
     * 不保存 completed。
     */

    data.checklist =
        data.checklist.map(

            item => ({

                text:
                    item.text

            })

        )


    /*
     * POST
     */

    const response =
        await fetch(

            API_BASE,

            {
                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(data)

            }

        )


    if (!response.ok) {

        const errorText =
            await response.text()


        throw new Error(

            `Failed to create template: ${response.status} ${errorText}`

        )

    }


    /*
     * Backend 回傳真正建立完成的 Template。
     */

    const createdTemplate =
        normalizeTemplate(

            await response.json()

        )


    /*
     * 立即更新目前 client。
     *
     * WebSocket 也會收到 template.created。
     *
     * 所以這裡必須避免重複。
     */

    const exists =
        templates.value.some(

            item =>
                Number(item.id) ===
                Number(createdTemplate.id)

        )


    if (!exists) {

        templates.value.push(
            createdTemplate
        )

    }
    else {

        const index =
            templates.value.findIndex(

                item =>
                    Number(item.id) ===
                    Number(createdTemplate.id)

            )


        if (index !== -1) {

            templates.value[index] =
                createdTemplate

        }

    }


    /*
     * 保持 ID 排序。
     */

    templates.value.sort(

        (a, b) =>
            Number(a.id) -
            Number(b.id)

    )


    return clone(
        createdTemplate
    )

}

    
    /*
    |--------------------------------------------------------------------------
    | Update Template
    |--------------------------------------------------------------------------
    */

    async function updateTemplate(
        template
    ) {

        if (!template?.id) {

            return false

        }


        const data =
            normalizeTemplate(
                template
            )


        const templateId =
            data.id


        /*
         * Template Checklist
         *
         * 不傳 completed。
         */

        const checklist =
            data.checklist.map(

                item => ({

                    text:
                        item.text

                })

            )


        const response =
            await fetch(

                `${API_BASE}/${templateId}`,

                {
                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            name:
                                data.name,

                            owner:
                                data.owner,

                            status:
                                data.status,

                            priority:
                                data.priority,

                            start:
                                data.start ||
                                null,

                            end:
                                data.end ||
                                null,

                            description:
                                data.description,

                            checklist:
                                checklist

                        })

                }

            )


        if (!response.ok) {

            const errorText =
                await response.text()


            throw new Error(

                `Failed to update template: ${response.status} ${errorText}`

            )

        }


        const updatedTemplate =
            normalizeTemplate(

                await response.json()

            )


        const index =
            templates.value.findIndex(

                item =>
                    Number(item.id) ===
                    Number(updatedTemplate.id)

            )


        if (index !== -1) {

            templates.value[index] =
                updatedTemplate

        }
        else {

            templates.value.push(
                updatedTemplate
            )

        }


        templates.value.sort(

            (a, b) =>
                Number(a.id) -
                Number(b.id)

        )


        return clone(
            updatedTemplate
        )

    }


    /*
    |--------------------------------------------------------------------------
    | Delete Template
    |--------------------------------------------------------------------------
    */

    async function deleteTemplate(
        template
    ) {

        const id =
            typeof template === "object"

                ? template?.id

                : template


        if (!id) {

            return false

        }


        const templateId =
            Number(id)


        const response =
            await fetch(

                `${API_BASE}/${templateId}`,

                {
                    method:
                        "DELETE"

                }

            )


        if (!response.ok) {

            const errorText =
                await response.text()


            throw new Error(

                `Failed to delete template: ${response.status} ${errorText}`

            )

        }


        templates.value =
            templates.value.filter(

                item =>
                    Number(item.id) !==
                    templateId

            )


        return true

    }


    /*
    |--------------------------------------------------------------------------
    | Get Template
    |--------------------------------------------------------------------------
    */

    function getTemplate(
        id
    ) {

        const template =
            templates.value.find(

                item =>
                    Number(item.id) ===
                    Number(id)

            )


        if (!template) {

            return null

        }


        return clone(
            template
        )

    }


    /*
    |--------------------------------------------------------------------------
    | Create Task From Template
    |--------------------------------------------------------------------------
    |
    | Template：
    |
    |     Checklist = 定義
    |
    | Task：
    |
    |     Checklist = 實際執行狀態
    |
    | 因此從 Template 建立 Task 時，
    | 所有 Checklist 一律從 false 開始。
    |
    */

    function createTaskFromTemplate(
        template
    ) {

        if (!template) {

            return null

        }


        const data =
            normalizeTemplate(
                template
            )


        return {

            id:
                null,

            name:
                data.name,

            owner:
                data.owner,

            status:
                data.status,

            priority:
                data.priority,

            start:
                data.start,

            end:
                data.end,

            description:
                data.description,

            progress:
                0,

            /*
             * 建立真正 Task 時，
             * Checklist 全部重新建立。
             *
             * 不使用 Template 的完成狀態。
             */

            checklist:
                data.checklist.map(

                    item => ({

                        id:
                            `task-check-${Date.now()}-${Math.random()
                                .toString(36)
                                .slice(2, 8)}`,

                        text:
                            item.text,

                        completed:
                            false

                    })

                )

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Create Empty Template
    |--------------------------------------------------------------------------
    */

    function createEmptyTemplate() {

        return {

            id:
                null,

            name:
                "",

            owner:
                "",

            status:
                "todo",

            priority:
                "不緊急也不重要",

            start:
                "",

            end:
                "",

            description:
                "",

            checklist:
                []

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Public API
    |--------------------------------------------------------------------------
    */

    return {

        templates,

        loading,

        loadTemplates,

        createTemplate,

        updateTemplate,

        deleteTemplate,

        getTemplate,

        createTaskFromTemplate,

        createEmptyTemplate,

        connectWebSocket,

        disconnectWebSocket,

        handleWebSocketMessage

    }

}