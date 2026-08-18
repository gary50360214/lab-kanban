import {
    ref
} from "vue"


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const API_BASE = "/api"


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
| Status
|--------------------------------------------------------------------------
*/

export const TASK_STATUSES = [

    {
        value: "todo",
        label: "TO DO"
    },

    {
        value: "running",
        label: "RUNNING"
    },

    {
        value: "waiting",
        label: "WAITING"
    },

    {
        value: "completed",
        label: "COMPLETED"
    }

]


/*
|--------------------------------------------------------------------------
| Priorities
|--------------------------------------------------------------------------
*/

export const TASK_PRIORITIES = [

    "緊急且重要",

    "緊急但不重要",

    "不緊急但重要",

    "不緊急也不重要"

]


/*
|--------------------------------------------------------------------------
| Status Normalization
|--------------------------------------------------------------------------
*/

export function normalizeTaskStatus(status) {

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
| Clone
|--------------------------------------------------------------------------
*/

function clone(value) {

    return JSON.parse(
        JSON.stringify(value)
    )

}


/*
|--------------------------------------------------------------------------
| Normalize Checklist
|--------------------------------------------------------------------------
*/

function normalizeChecklist(
    checklist = []
) {

    if (!Array.isArray(checklist)) {

        return []

    }


    return checklist.map(

        (item, index) => ({

            id:
                item.id ??
                `check-${Date.now()}-${index}`,

            text:
                String(
                    item.text ?? ""
                ).trim(),

            completed:
                Boolean(
                    item.completed
                )

        })

    )

}


/*
|--------------------------------------------------------------------------
| Normalize Task
|--------------------------------------------------------------------------
*/

function normalizeTask(task = {}) {

    return {

        id:
            task.id ?? null,

        name:
            String(
                task.name ?? ""
            ).trim(),

        owner:
            task.owner ?? "",

        status:
            normalizeTaskStatus(
                task.status
            ),

        priority:
            task.priority ??
            "不緊急也不重要",

        start:
            task.start ?? "",

        end:
            task.end ?? "",

        description:
            String(
                task.description ?? ""
            ).trim(),

        progress:
            Math.min(

                100,

                Math.max(

                    0,

                    Number(
                        task.progress ?? 0
                    ) || 0

                )

            ),

        checklist:
            normalizeChecklist(
                task.checklist
            )

    }

}


/*
|--------------------------------------------------------------------------
| useTasks
|--------------------------------------------------------------------------
*/

export function useTasks() {


    const editingTask =
        ref(null)


    /*
    |--------------------------------------------------------------------------
    | WebSocket State
    |--------------------------------------------------------------------------
    */

    const websocket =
        ref(null)


    const websocketConnected =
        ref(false)


    let reconnectTimer =
        null


    let currentProjectId =
        null

/*
|--------------------------------------------------------------------------
| WebSocket Message Handler
|--------------------------------------------------------------------------
*/

function handleWebSocketMessage(
    message,
    project
) {

    if (
        !message ||
        !project
    ) {

        return

    }


    /*
     * Only process events belonging
     * to the currently opened project.
     */

    if (
        Number(message.project_id) !==
        Number(project.id)
    ) {

        return

    }


    if (
        !Array.isArray(project.tasks)
    ) {

        project.tasks = []

    }


    /*
     * ----------------------------------------------------------
     * Task Created
     * ----------------------------------------------------------
     */

    if (
        message.type ===
        "task.created"
    ) {

        const incoming =
            normalizeTask(
                message.data
            )


        const exists =
            project.tasks.some(
                task =>
                    Number(task.id) ===
                    Number(incoming.id)
            )


        if (!exists) {

            project.tasks.push(
                incoming
            )

        }


        return

    }


    /*
     * ----------------------------------------------------------
     * Task Updated
     * ----------------------------------------------------------
     */

    if (
        message.type ===
        "task.updated"
    ) {

        const incoming =
            normalizeTask(
                message.data
            )


        const index =
            project.tasks.findIndex(

                task =>
                    Number(task.id) ===
                    Number(incoming.id)

            )


        if (index === -1) {

            project.tasks.push(
                incoming
            )

        }
        else {

            /*
             * Replace the whole task.
             *
             * Backend task.updated contains the
             * latest checklist snapshot.
             */

            project.tasks[index] =
                incoming

        }


        return

    }


    /*
     * ----------------------------------------------------------
     * Task Deleted
     * ----------------------------------------------------------
     */

    if (
        message.type ===
        "task.deleted"
    ) {

        const taskId =
            Number(
                message.data?.id
            )


        project.tasks =
            project.tasks.filter(

                task =>
                    Number(task.id) !==
                    taskId

            )


        return

    }


    /*
     * ----------------------------------------------------------
     * Checklist Created
     * ----------------------------------------------------------
     */

    if (
        message.type ===
        "checklist.created"
    ) {

        const taskId =
            Number(
                message.task_id
            )


        const incoming =
            message.data


        if (!incoming) {

            return

        }


        const task =
            project.tasks.find(

                item =>
                    Number(item.id) ===
                    taskId

            )


        if (!task) {

            return

        }


        if (
            !Array.isArray(
                task.checklist
            )
        ) {

            task.checklist = []

        }


        const exists =
            task.checklist.some(

                item =>
                    Number(item.id) ===
                    Number(incoming.id)

            )


        if (!exists) {

            task.checklist.push({

                id:
                    incoming.id,

                text:
                    String(
                        incoming.text ?? ""
                    ).trim(),

                completed:
                    Boolean(
                        incoming.completed
                    )

            })

        }


        return

    }


    /*
     * ----------------------------------------------------------
     * Checklist Updated
     * ----------------------------------------------------------
     */

    if (
        message.type ===
        "checklist.updated"
    ) {

        const taskId =
            Number(
                message.task_id
            )


        const incoming =
            message.data


        if (!incoming) {

            return

        }


        const task =
            project.tasks.find(

                item =>
                    Number(item.id) ===
                    taskId

            )


        if (!task) {

            return

        }


        if (
            !Array.isArray(
                task.checklist
            )
        ) {

            task.checklist = []

        }


        const index =
            task.checklist.findIndex(

                item =>
                    Number(item.id) ===
                    Number(incoming.id)

            )


        const normalizedItem = {

            id:
                incoming.id,

            text:
                String(
                    incoming.text ?? ""
                ).trim(),

            completed:
                Boolean(
                    incoming.completed
                )

        }


        if (index === -1) {

            task.checklist.push(
                normalizedItem
            )

        }
        else {

            task.checklist[index] =
                normalizedItem

        }


        return

    }


    /*
     * ----------------------------------------------------------
     * Checklist Deleted
     * ----------------------------------------------------------
     */

    if (
        message.type ===
        "checklist.deleted"
    ) {

        const taskId =
            Number(
                message.task_id
            )


        const checklistId =
            Number(
                message.data?.id
            )


        const task =
            project.tasks.find(

                item =>
                    Number(item.id) ===
                    taskId

            )


        if (!task) {

            return

        }


        if (
            !Array.isArray(
                task.checklist
            )
        ) {

            return

        }


        task.checklist =
            task.checklist.filter(

                item =>
                    Number(item.id) !==
                    checklistId

            )


        return

    }

}

    /*
    |--------------------------------------------------------------------------
    | Connect WebSocket
    |--------------------------------------------------------------------------
    */

    function connectWebSocket(
        project
    ) {

        if (!project?.id) {

            return

        }


        currentProjectId =
            project.id


        /*
         * Close previous connection.
         */

        disconnectWebSocket()


        const url =
            getWebSocketUrl()


        console.log(
            "[WebSocket] Connecting:",
            url
        )


        const socket =
            new WebSocket(url)


        websocket.value =
            socket


        socket.onopen = () => {

            websocketConnected.value =
                true


            console.log(
                "[WebSocket] Connected"
            )

        }


        socket.onmessage = event => {

            try {

                const message =
                    JSON.parse(
                        event.data
                    )


                console.log(
                    "[WebSocket] Message:",
                    message
                )


                handleWebSocketMessage(
                    message,
                    project
                )

            }
            catch (error) {

                console.error(
                    "[WebSocket] Invalid message:",
                    error
                )

            }

        }


        socket.onerror = error => {

            console.error(
                "[WebSocket] Error:",
                error
            )

        }


        socket.onclose = () => {

            websocketConnected.value =
                false


            websocket.value =
                null


            console.log(
                "[WebSocket] Disconnected"
            )


            /*
             * Automatically reconnect.
             *
             * This is important because the backend
             * container can restart during development.
             */

            if (
                currentProjectId ===
                project.id
            ) {

                clearTimeout(
                    reconnectTimer
                )


                reconnectTimer =
                    setTimeout(

                        () => {

                            if (
                                currentProjectId ===
                                project.id
                            ) {

                                connectWebSocket(
                                    project
                                )

                            }

                        },

                        3000

                    )

            }

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Disconnect WebSocket
    |--------------------------------------------------------------------------
    */

    function disconnectWebSocket() {

        currentProjectId =
            null


        clearTimeout(
            reconnectTimer
        )


        reconnectTimer =
            null


        if (
            websocket.value
        ) {

            try {

                websocket.value.close()

            }
            catch (error) {

                console.error(
                    "[WebSocket] Close error:",
                    error
                )

            }

        }


        websocket.value =
            null


        websocketConnected.value =
            false

    }


    /*
    |--------------------------------------------------------------------------
    | Load Tasks
    |--------------------------------------------------------------------------
    */

    async function loadTasks(
        projectId
    ) {

        if (!projectId) {

            return []

        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/projects/${projectId}/tasks`
                )


            if (!response.ok) {

                throw new Error(
                    `Failed to load tasks: ${response.status}`
                )

            }


            const tasks =
                await response.json()


            return tasks.map(
                normalizeTask
            )

        }
        catch (error) {

            console.error(
                "Failed to load tasks:",
                error
            )

            return []

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Start Creating
    |--------------------------------------------------------------------------
    */

    function createTask() {

        editingTask.value =
            createEmptyTask()

        return editingTask.value

    }


    /*
    |--------------------------------------------------------------------------
    | Start Editing
    |--------------------------------------------------------------------------
    */

    function editTask(task) {

        editingTask.value =
            clone(
                normalizeTask(task)
            )


        return editingTask.value

    }


    /*
    |--------------------------------------------------------------------------
    | Sync Checklist
    |--------------------------------------------------------------------------
    */

    async function syncChecklist(
        taskId,
        checklist = []
    ) {

        if (!taskId) {

            return false

        }


        const items =
            Array.isArray(checklist)
                ? checklist
                : []


        try {

            const response =
                await fetch(
                    `${API_BASE}/tasks/${taskId}/checklist`
                )


            if (!response.ok) {

                throw new Error(
                    `Failed to load checklist: ${response.status}`
                )

            }


            const existing =
                await response.json()


            const existingIds =
                new Set(

                    existing.map(
                        item =>
                            Number(item.id)
                    )

                )


            const submittedIds =
                new Set(

                    items

                        .filter(

                            item =>
                                Number.isInteger(
                                    Number(item.id)
                                ) &&
                                existingIds.has(
                                    Number(item.id)
                                )

                        )

                        .map(

                            item =>
                                Number(item.id)

                        )

                )


            for (
                const item of existing
            ) {

                if (
                    !submittedIds.has(
                        Number(item.id)
                    )
                ) {

                    const deleteResponse =
                        await fetch(
                            `${API_BASE}/tasks/${taskId}/checklist/${item.id}`,
                            {
                                method: "DELETE"
                            }
                        )


                    if (
                        !deleteResponse.ok
                    ) {

                        throw new Error(
                            `Failed to delete checklist item: ${deleteResponse.status}`
                        )

                    }

                }

            }


            for (
                const item of items
            ) {

                const text =
                    String(
                        item.text ?? ""
                    ).trim()


                if (!text) {

                    continue

                }


                const numericId =
                    Number(item.id)


                if (
                    Number.isInteger(
                        numericId
                    ) &&
                    existingIds.has(
                        numericId
                    )
                ) {

                    const updateResponse =
                        await fetch(
                            `${API_BASE}/tasks/${taskId}/checklist/${numericId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        text,

                                        completed:
                                            Boolean(
                                                item.completed
                                            )

                                    })

                            }
                        )


                    if (
                        !updateResponse.ok
                    ) {

                        throw new Error(
                            `Failed to update checklist item: ${updateResponse.status}`
                        )

                    }

                }
                else {

                    const createResponse =
                        await fetch(
                            `${API_BASE}/tasks/${taskId}/checklist`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        text,

                                        completed:
                                            Boolean(
                                                item.completed
                                            )

                                    })

                            }
                        )


                    if (
                        !createResponse.ok
                    ) {

                        throw new Error(
                            `Failed to create checklist item: ${createResponse.status}`
                        )

                    }

                }

            }


            return true

        }
        catch (error) {

            console.error(
                "Failed to sync checklist:",
                error
            )

            return false

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Save Task
    |--------------------------------------------------------------------------
    */

    async function saveTask(
        task,
        project
    ) {

        if (!project) {

            console.error(
                "Cannot save task: no project."
            )

            return false

        }


        if (
            !task?.name?.trim()
        ) {

            window.alert(
                "請輸入任務名稱"
            )

            return false

        }


        if (

            task.start &&

            task.end &&

            task.end < task.start

        ) {

            window.alert(
                "結束日期不能早於開始日期"
            )

            return false

        }


        const data =
            normalizeTask(task)


        /*
         * ----------------------------------------------------------
         * Update
         * ----------------------------------------------------------
         */

        if (data.id) {

            try {

                const response =
                    await fetch(
                        `${API_BASE}/tasks/${data.id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name:
                                        data.name,

                                    owner:
                                        data.owner || null,

                                    status:
                                        data.status,

                                    priority:
                                        data.priority,

                                    start:
                                        data.start || null,

                                    end:
                                        data.end || null,

                                    description:
                                        data.description || null,

                                    progress:
                                        data.progress

                                })

                        }
                    )


                if (!response.ok) {

                    throw new Error(
                        `Failed to update task: ${response.status}`
                    )

                }


                const updatedTask =
                    await response.json()


                const checklistSuccess =
                    await syncChecklist(
                        data.id,
                        data.checklist
                    )


                if (!checklistSuccess) {

                    window.alert(
                        "任務已更新，但子任務同步失敗"
                    )

                    return false

                }


                const refreshedResponse =
                    await fetch(
                        `${API_BASE}/tasks/${data.id}`
                    )


                if (!refreshedResponse.ok) {

                    throw new Error(
                        `Failed to reload task: ${refreshedResponse.status}`
                    )

                }


                const refreshedTask =
                    await refreshedResponse.json()


                const normalized =
                    normalizeTask(
                        refreshedTask
                    )


                if (
                    !Array.isArray(
                        project.tasks
                    )
                ) {

                    project.tasks = []

                }


                const index =
                    project.tasks.findIndex(

                        item =>
                            Number(item.id) ===
                            Number(normalized.id)

                    )


                if (index !== -1) {

                    project.tasks[index] =
                        normalized

                }
                else {

                    project.tasks.push(
                        normalized
                    )

                }


                editingTask.value =
                    null


                return normalized

            }
            catch (error) {

                console.error(
                    "Failed to update task:",
                    error
                )

                window.alert(
                    "更新任務失敗"
                )

                return false

            }

        }


        /*
         * ----------------------------------------------------------
         * Create
         * ----------------------------------------------------------
         */

        try {

            const response =
                await fetch(
                    `${API_BASE}/projects/${project.id}/tasks`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                name:
                                    data.name,

                                owner:
                                    data.owner || null,

                                status:
                                    data.status,

                                priority:
                                    data.priority,

                                start:
                                    data.start || null,

                                end:
                                    data.end || null,

                                description:
                                    data.description || null,

                                progress:
                                    data.progress

                            })

                    }
                )


            if (!response.ok) {

                throw new Error(
                    `Failed to create task: ${response.status}`
                )

            }


            const createdTask =
                await response.json()


            const checklistSuccess =
                await syncChecklist(
                    createdTask.id,
                    data.checklist
                )


            if (!checklistSuccess) {

                window.alert(
                    "任務已建立，但子任務同步失敗"
                )

                return false

            }


            const refreshedResponse =
                await fetch(
                    `${API_BASE}/tasks/${createdTask.id}`
                )


            if (!refreshedResponse.ok) {

                throw new Error(
                    `Failed to reload created task: ${refreshedResponse.status}`
                )

            }


            const refreshedTask =
                await refreshedResponse.json()


            const normalized =
                normalizeTask(
                    refreshedTask
                )


            if (
                !Array.isArray(
                    project.tasks
                )
            ) {

                project.tasks = []

            }


            const exists =
                project.tasks.some(

                    item =>
                        Number(item.id) ===
                        Number(normalized.id)

                )


            if (!exists) {

                project.tasks.push(
                    normalized
                )

            }


            editingTask.value =
                null


            return normalized

        }
        catch (error) {

            console.error(
                "Failed to create task:",
                error
            )

            window.alert(
                "建立任務失敗"
            )

            return false

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Delete Task
    |--------------------------------------------------------------------------
    */

    async function deleteTask(
        task,
        project
    ) {

        if (
            !task ||
            !project
        ) {

            return false

        }


        const confirmed =
            window.confirm(
                `確定要刪除「${task.name}」嗎？`
            )


        if (!confirmed) {

            return false

        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/tasks/${task.id}`,
                    {
                        method: "DELETE"
                    }
                )


            if (!response.ok) {

                throw new Error(
                    `Failed to delete task: ${response.status}`
                )

            }


            if (
                Array.isArray(
                    project.tasks
                )
            ) {

                project.tasks =
                    project.tasks.filter(

                        item =>
                            Number(item.id) !==
                            Number(task.id)

                    )

            }


            return true

        }
        catch (error) {

            console.error(
                "Failed to delete task:",
                error
            )

            window.alert(
                "刪除任務失敗"
            )

            return false

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Move Task
    |--------------------------------------------------------------------------
    */

    async function moveTask(
        task,
        status,
        project
    ) {

        if (
            !task ||
            !project
        ) {

            return false

        }


        if (
            !Array.isArray(
                project.tasks
            )
        ) {

            return false

        }


        const normalizedStatus =
            normalizeTaskStatus(
                status
            )


        const target =
            project.tasks.find(

                item =>
                    Number(item.id) ===
                    Number(task.id)

            )


        if (!target) {

            return false

        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/tasks/${task.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                status:
                                    normalizedStatus

                            })

                    }
                )


            if (!response.ok) {

                throw new Error(
                    `Failed to move task: ${response.status}`
                )

            }


            const updatedTask =
                await response.json()


            const normalized =
                normalizeTask(
                    updatedTask
                )


            Object.assign(
                target,
                normalized
            )


            return true

        }
        catch (error) {

            console.error(
                "Failed to move task:",
                error
            )

            return false

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Toggle Checklist
    |--------------------------------------------------------------------------
    */

    async function toggleChecklist(
        task,
        item
    ) {

        if (
            !task ||
            !item
        ) {

            return false

        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/tasks/${task.id}/checklist/${item.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                text:
                                    item.text,

                                completed:
                                    !item.completed

                            })

                    }
                )


            if (!response.ok) {

                throw new Error(
                    `Failed to update checklist: ${response.status}`
                )

            }


            const updatedItem =
                await response.json()


            item.completed =
                updatedItem.completed


            if (
                Array.isArray(
                    task.checklist
                ) &&
                task.checklist.length > 0
            ) {

                const completed =
                    task.checklist.filter(

                        checklistItem =>
                            checklistItem.completed

                    ).length


                const progress =
                    Math.round(

                        (
                            completed /
                            task.checklist.length
                        ) * 100

                    )


                task.progress =
                    progress


                await updateProgress(
                    task,
                    progress
                )

            }


            return true

        }
        catch (error) {

            console.error(
                "Failed to toggle checklist:",
                error
            )

            return false

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Add Checklist Item
    |--------------------------------------------------------------------------
    */

    async function addChecklistItem(
        task,
        text = ""
    ) {

        if (!task) {

            return false

        }


        const value =
            text.trim()


        if (!value) {

            return false

        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/tasks/${task.id}/checklist`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                text:
                                    value,

                                completed:
                                    false

                            })

                        }
                    )


            if (!response.ok) {

                throw new Error(
                    `Failed to add checklist: ${response.status}`
                )

            }


            const item =
                await response.json()


            if (
                !Array.isArray(
                    task.checklist
                )
            ) {

                task.checklist = []

            }


            task.checklist.push(
                item
            )


            return true

        }
        catch (error) {

            console.error(
                "Failed to add checklist:",
                error
            )

            return false

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Remove Checklist Item
    |--------------------------------------------------------------------------
    */

    async function removeChecklistItem(
        task,
        index
    ) {

        if (
            !task ||
            !Array.isArray(
                task.checklist
            )
        ) {

            return false

        }


        if (
            index < 0 ||
            index >= task.checklist.length
        ) {

            return false

        }


        const item =
            task.checklist[index]


        try {

            const response =
                await fetch(
                    `${API_BASE}/tasks/${task.id}/checklist/${item.id}`,
                    {
                        method: "DELETE"
                    }
                )


            if (!response.ok) {

                throw new Error(
                    `Failed to delete checklist: ${response.status}`
                )

            }


            task.checklist.splice(
                index,
                1
            )


            return true

        }
        catch (error) {

            console.error(
                "Failed to delete checklist:",
                error
            )

            return false

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Update Progress
    |--------------------------------------------------------------------------
    */

    async function updateProgress(
        task,
        progress
    ) {

        if (!task) {

            return false

        }


        const value =
            Math.min(

                100,

                Math.max(

                    0,

                    Number(progress) || 0

                )

            )


        try {

            const response =
                await fetch(
                    `${API_BASE}/tasks/${task.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                progress:
                                    value

                            })

                    }
                )


            if (!response.ok) {

                throw new Error(
                    `Failed to update progress: ${response.status}`
                )

            }


            task.progress =
                value


            return true

        }
        catch (error) {

            console.error(
                "Failed to update progress:",
                error
            )

            return false

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Create From Template
    |--------------------------------------------------------------------------
    */

    function createTaskFromTemplate(
        template
    ) {

        if (!template) {

            return createEmptyTask()

        }


        return normalizeTask({

            id: null,

            name:
                template.name ?? "",

            owner:
                template.owner ?? "",

            status:
                template.status ?? "todo",

            priority:
                template.priority ??
                "不緊急也不重要",

            start:
                template.start ?? "",

            end:
                template.end ?? "",

            description:
                template.description ?? "",

            progress:
                0,

            checklist:
                Array.isArray(
                    template.checklist
                )

                    ? template.checklist.map(

                        item => ({

                            id:
                                `task-check-${Date.now()}-${Math.random()
                                    .toString(36)
                                    .slice(2, 8)}`,

                            text:
                                item.text ?? "",

                            completed:
                                false

                        })

                    )

                    : []

        })

    }


    /*
    |--------------------------------------------------------------------------
    | Empty Task
    |--------------------------------------------------------------------------
    */

    function createEmptyTask() {

        return {

            id: null,

            name: "",

            owner: "",

            status: "todo",

            priority:
                "不緊急也不重要",

            start: "",

            end: "",

            description: "",

            progress: 0,

            checklist: []

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Public API
    |--------------------------------------------------------------------------
    */

    return {

        editingTask,

        websocketConnected,

        loadTasks,

        connectWebSocket,

        disconnectWebSocket,

        createTask,

        editTask,

        saveTask,

        deleteTask,

        moveTask,

        toggleChecklist,

        addChecklistItem,

        removeChecklistItem,

        updateProgress,

        createTaskFromTemplate,

        createEmptyTask

    }

}