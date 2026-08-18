import {
    ref
} from "vue"


const API_BASE =
    "/api/projects"


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
| useProjects
|--------------------------------------------------------------------------
*/

export function useProjects() {

    const projects =
        ref([])


    const selectedProject =
        ref(null)


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
    | Handle WebSocket Message
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
        | Project Created
        |--------------------------------------------------------------------------
        */

        if (
            message.type ===
            "project.created"
        ) {

            const project =
                message.data


            if (!project?.id) {

                return

            }


            const exists =
                projects.value.some(

                    item =>
                        Number(item.id) ===
                        Number(project.id)

                )


            if (!exists) {

                projects.value.push({

                    id:
                        project.id,

                    name:
                        project.name,

                    tasks:
                        []

                })

            }


            return

        }


        /*
        |--------------------------------------------------------------------------
        | Project Updated
        |--------------------------------------------------------------------------
        */

        if (
            message.type ===
            "project.updated"
        ) {

            const project =
                message.data


            if (!project?.id) {

                return

            }


            const index =
                projects.value.findIndex(

                    item =>
                        Number(item.id) ===
                        Number(project.id)

                )


            if (index !== -1) {

                const current =
                    projects.value[index]


                projects.value[index] = {

                    ...current,

                    id:
                        project.id,

                    name:
                        project.name

                }


                /*
                 * Keep selected project
                 * synchronized.
                 */

                if (
                    selectedProject.value?.id ===
                    project.id
                ) {

                    selectedProject.value =
                        projects.value[index]

                }

            }


            return

        }


        /*
        |--------------------------------------------------------------------------
        | Project Deleted
        |--------------------------------------------------------------------------
        */

        if (
            message.type ===
            "project.deleted"
        ) {

            const projectId =
                Number(
                    message.data?.id
                )


            if (!projectId) {

                return

            }


            const wasSelected =
                Number(
                    selectedProject.value?.id
                ) === projectId


            projects.value =
                projects.value.filter(

                    project =>
                        Number(project.id) !==
                        projectId

                )


            /*
             * If the deleted project was
             * currently selected, select
             * another project.
             */

            if (wasSelected) {

                selectedProject.value =
                    projects.value[0] ||
                    null

            }


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
            "[Project WebSocket] Connecting:",
            url
        )


        const socket =
            new WebSocket(url)


        websocket.value =
            socket


        socket.onopen = () => {

            console.log(
                "[Project WebSocket] Connected"
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
                        "[Project WebSocket] Message:",
                        message
                    )


                    handleWebSocketMessage(
                        message
                    )

                }
                catch (error) {

                    console.error(
                        "[Project WebSocket] Invalid message:",
                        error
                    )

                }

            }


        socket.onerror =
            error => {

                console.error(
                    "[Project WebSocket] Error:",
                    error
                )

            }


        socket.onclose =
            () => {

                websocket.value =
                    null


                console.log(
                    "[Project WebSocket] Disconnected"
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
                    "[Project WebSocket] Close error:",
                    error
                )

            }

        }


        websocket.value =
            null

    }


    /*
    |--------------------------------------------------------------------------
    | Load Projects
    |--------------------------------------------------------------------------
    */

    async function loadProjects() {

        try {

            const response =
                await fetch(
                    API_BASE
                )


            if (!response.ok) {

                throw new Error(
                    `Failed to load projects: ${response.status}`
                )

            }


            const data =
                await response.json()


            projects.value =
                Array.isArray(data)
                    ? data
                    : []


            /*
             * Preserve current selection.
             */

            if (
                selectedProject.value
            ) {

                const current =
                    projects.value.find(

                        project =>
                            Number(project.id) ===
                            Number(
                                selectedProject.value.id
                            )

                    )


                selectedProject.value =
                    current || null

            }


            /*
             * Select first project
             * if nothing is selected.
             */

            if (
                !selectedProject.value &&
                projects.value.length > 0
            ) {

                selectedProject.value =
                    projects.value[0]

            }

        }
        catch (error) {

            console.error(
                "Failed to load projects:",
                error
            )

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Select Project
    |--------------------------------------------------------------------------
    */

    function selectProject(
        project
    ) {

        selectedProject.value =
            project

    }


    /*
    |--------------------------------------------------------------------------
    | Create Project
    |--------------------------------------------------------------------------
    */

    async function createProject(
        project
    ) {

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
                        JSON.stringify({

                            name:
                                project.name

                        })

                }

            )


        if (!response.ok) {

            throw new Error(
                `Failed to create project: ${response.status}`
            )

        }


        const newProject =
            await response.json()


        /*
         * Local update.
         *
         * WebSocket will also broadcast
         * project.created.
         *
         * handleWebSocketMessage() has
         * duplicate protection.
         */

        const exists =
            projects.value.some(

                item =>
                    Number(item.id) ===
                    Number(newProject.id)

            )


        if (!exists) {

            projects.value.push(
                newProject
            )

        }


        selectedProject.value =
            projects.value.find(

                item =>
                    Number(item.id) ===
                    Number(newProject.id)

            ) || newProject


        return newProject

    }


    /*
    |--------------------------------------------------------------------------
    | Update Project
    |--------------------------------------------------------------------------
    */

    async function updateProject(
        project
    ) {

        const response =
            await fetch(

                `${API_BASE}/${project.id}`,

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
                                project.name

                        })

                }

            )


        if (!response.ok) {

            throw new Error(
                `Failed to update project: ${response.status}`
            )

        }


        const updatedProject =
            await response.json()


        const index =
            projects.value.findIndex(

                item =>
                    Number(item.id) ===
                    Number(updatedProject.id)

            )


        if (index !== -1) {

            const current =
                projects.value[index]


            projects.value[index] = {

                ...current,

                ...updatedProject

            }

        }


        if (
            selectedProject.value?.id ===
            updatedProject.id
        ) {

            selectedProject.value =
                projects.value[index] ||
                updatedProject

        }


        return updatedProject

    }


    /*
    |--------------------------------------------------------------------------
    | Delete Project
    |--------------------------------------------------------------------------
    */

    async function deleteProject(
        project
    ) {

        if (
            !confirm(
                `確定刪除 ${project.name}?`
            )
        ) {

            return false

        }


        const response =
            await fetch(

                `${API_BASE}/${project.id}`,

                {
                    method:
                        "DELETE"
                }

            )


        if (!response.ok) {

            throw new Error(
                `Failed to delete project: ${response.status}`
            )

        }


        const deletedId =
            Number(
                project.id
            )


        const wasSelected =
            Number(
                selectedProject.value?.id
            ) === deletedId


        /*
         * Local update.
         */

        projects.value =
            projects.value.filter(

                item =>
                    Number(item.id) !==
                    deletedId

            )


        if (wasSelected) {

            selectedProject.value =
                projects.value[0] ||
                null

        }


        return true

    }


    /*
    |--------------------------------------------------------------------------
    | Empty Project
    |--------------------------------------------------------------------------
    */

    function createEmptyProject() {

        return {

            id:
                null,

            name:
                "",

            tasks:
                []

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Public API
    |--------------------------------------------------------------------------
    */

    return {

        projects,

        selectedProject,

        loadProjects,

        selectProject,

        createProject,

        updateProject,

        deleteProject,

        createEmptyProject,

        connectWebSocket,

        disconnectWebSocket

    }

}