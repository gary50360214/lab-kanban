```vue
<template>

    <div class="projects-page">

        <!-- =========================================
             Project Selector
        ========================================== -->

        <ProjectSelector
            :projects="projects"
            :selectedProject="selectedProject"

            @select="selectProject"
            @create="openCreateProject"
            @edit="openEditProject"
            @delete="deleteProjectHandler"
        />


        <!-- =========================================
             Project Workspace
        ========================================== -->

        <ProjectWorkspace
            :project="selectedProject"
            :owners="ownersWithoutAll"

            @create-task="openCreateTask"
            @detail-task="openTaskDetail"
            @edit-task="openEditTask"
            @delete-task="deleteTaskHandler"

            @open-template="showTemplateModal = true"
            @open-owner="showOwnerModal = true"

            @update-project="updateProject"
            @update-task="saveTaskHandler"
            @move-task="handleMoveTask"
        />


        <!-- =========================================
             Project Modal
        ========================================== -->

        <ProjectModal
            v-if="showProjectModal"

            :project="editingProject"

            @save="saveProject"
            @close="showProjectModal = false"
        />


        <!-- =========================================
             New Task Modal
        ========================================== -->

        <TaskModal
            v-if="showTaskModal"

            :task="null"
            :owners="ownersWithoutAll"

            @save="saveTaskHandler"
            @close="showTaskModal = false"
        />


        <!-- =========================================
             Task Edit Sidebar
        ========================================== -->

        <TaskEditSidebar
            v-if="showTaskSidebar && editingTask"

            :task="editingTask"
            :owners="ownersWithoutAll"

            @save="saveTaskHandler"
            @close="closeTaskSidebar"
        />


        <!-- =========================================
             Task Detail
        ========================================== -->

        <TaskDetailModal
            v-if="showTaskDetail"

            :task="detailTask"

            @close="showTaskDetail = false"
            @toggle-checklist="toggleChecklist"
        />


        <!-- =========================================
             Owner Modal
        ========================================== -->

        <div
            v-if="showOwnerModal"
            class="modal-overlay"
        >

            <div class="project-modal">

                <OwnerManager
                    :owners="owners"

                    @update="handleOwnersUpdated"
                    @close="showOwnerModal = false"
                />

            </div>

        </div>


        <!-- =========================================
             Template Modal
        ========================================== -->

        <div
            v-if="showTemplateModal"
            class="modal-overlay"
        >

            <div class="project-modal">

                <TemplateManager
                    :templates="templates"
                    :owners="ownersWithoutAll"

                    @create="createTemplateHandler"
                    @update="updateTemplateHandler"
                    @delete="deleteTemplateHandler"
                    @use="useTemplateHandler"

                    @close="showTemplateModal = false"
                />

            </div>

        </div>

    </div>

</template>


<script setup>

import {
    computed,
    onMounted,
    onUnmounted,
    ref,
    watch
} from "vue"

/* ==============================================
   Components
============================================== */

import ProjectSelector
    from "../components/project/ProjectSelector.vue"

import ProjectWorkspace
    from "../components/project/ProjectWorkspace.vue"

import ProjectModal
    from "../components/ProjectModal.vue"

import TaskModal
    from "../components/TaskModal.vue"

import TaskEditSidebar
    from "../components/task/TaskEditSidebar.vue"

import TaskDetailModal
    from "../components/task/TaskDetailModal.vue"

import OwnerManager
    from "../components/OwnerManager.vue"

import TemplateManager
    from "../components/template/TemplateManager.vue"


/* ==============================================
   Composables
============================================== */

import {
    useProjects
} from "../composables/useProjects.js"

import {
    useTasks
} from "../composables/useTasks.js"

import {
    useTemplates
} from "../composables/useTemplates.js"


/* ==============================================
   Projects
============================================== */

const {
    projects,
    selectedProject,

    selectProject,

    createProject,
    updateProject,
    deleteProject,

    loadProjects,

    connectWebSocket:
        connectProjectWebSocket,

    disconnectWebSocket:
        disconnectProjectWebSocket

} = useProjects()

/* ==============================================
   Tasks
============================================== */

const {
    editingTask,

    loadTasks,
    saveTask,
    deleteTask,
    moveTask,
    toggleChecklist,

    connectWebSocket,
    disconnectWebSocket

} = useTasks()

/* ==============================================
   Templates
============================================== */

const {
    templates,
    loadTemplates,

    createTemplate,
    updateTemplate,
    deleteTemplate,

    createTaskFromTemplate,

    connectWebSocket:
        connectTemplateWebSocket,

    disconnectWebSocket:
        disconnectTemplateWebSocket,
    handleWebSocketMessage:
        handleTemplateWebSocketMessage
} = useTemplates()

/* ==============================================
   Owners
============================================== */

const owners = ref([])


/*
 * Task / Workspace / Template currently use
 * owner name strings.
 *
 * Keep this conversion here so the API can
 * continue using { id, name } objects.
 */
 /* ==============================================
   Owner WebSocket
============================================== */

let ownerWebSocket = null

let ownerReconnectTimer = null


const ownersWithoutAll = computed(() => {

    return owners.value.map(
        owner => owner.name
    )

})


/* ==============================================
   Owner WebSocket Message
============================================== */

function handleOwnerWebSocketMessage(message) {

    if (!message) {

        return

    }


    /* ==========================================
       Owner Created
    ========================================== */

    if (
        message.type ===
        "owner.created"
    ) {

        const owner =
            message.data


        if (!owner?.id) {

            return

        }


        const ownerId =
            Number(owner.id)


        const exists =
            owners.value.some(
                item =>
                    Number(item.id) ===
                    ownerId
            )


        if (!exists) {

            owners.value.push({

                id:
                    ownerId,

                name:
                    owner.name ?? ""

            })

        }


        return

    }


    /* ==========================================
       Owner Updated
    ========================================== */

    if (
        message.type ===
        "owner.updated"
    ) {

        const owner =
            message.data


        if (!owner?.id) {

            return

        }


        const ownerId =
            Number(owner.id)


        const index =
            owners.value.findIndex(
                item =>
                    Number(item.id) ===
                    ownerId
            )


        const normalizedOwner = {

            id:
                ownerId,

            name:
                owner.name ?? ""

        }


        if (index === -1) {

            /*
             * This client did not have
             * the owner yet.
             *
             * Add it.
             */

            owners.value.push(
                normalizedOwner
            )

        }
        else {

            /*
             * Replace the existing owner.
             */

            owners.value[index] =
                normalizedOwner

        }


        return

    }


    /* ==========================================
       Owner Deleted
    ========================================== */

    if (
        message.type ===
        "owner.deleted"
    ) {

        const ownerId =
            Number(
                message.data?.id
            )


        if (!ownerId) {

            return

        }


        owners.value =
            owners.value.filter(
                owner =>
                    Number(owner.id) !==
                    ownerId
            )


        return

    }

}


/* ==============================================
   Connect Owner WebSocket
============================================== */

function connectOwnerWebSocket() {

    /*
     * Clear pending reconnect.
     */

    clearTimeout(
        ownerReconnectTimer
    )

    ownerReconnectTimer =
        null


    /*
     * Prevent duplicate connections.
     */

    if (
        ownerWebSocket
    ) {

        return

    }


    const protocol =
        window.location.protocol === "https:"
            ? "wss:"
            : "ws:"


    const url =
        `${protocol}//${window.location.host}/ws`


    console.log(
        "[Owner WebSocket] Connecting:",
        url
    )


    const socket =
        new WebSocket(url)


    ownerWebSocket =
        socket


    socket.onopen = () => {

        console.log(
            "[Owner WebSocket] Connected"
        )

    }


    socket.onmessage = event => {

        try {

            const message =
                JSON.parse(
                    event.data
                )


            console.log(
                "[Owner WebSocket] Message:",
                message
            )


            handleOwnerWebSocketMessage(
                message
            )

        }
        catch (error) {

            console.error(
                "[Owner WebSocket] Failed to process message:",
                error
            )

        }

    }


    socket.onerror = error => {

        console.error(
            "[Owner WebSocket] Error:",
            error
        )

    }


    socket.onclose = () => {

        /*
         * Only clear the current socket
         * if this is still the active socket.
         */

        if (
            ownerWebSocket === socket
        ) {

            ownerWebSocket =
                null

        }


        console.log(
            "[Owner WebSocket] Disconnected"
        )


        /*
         * Reconnect automatically.
         */

        clearTimeout(
            ownerReconnectTimer
        )


        ownerReconnectTimer =
            setTimeout(

                () => {

                    connectOwnerWebSocket()

                },

                3000

            )

    }

}


/* ==============================================
   Disconnect Owner WebSocket
============================================== */

function disconnectOwnerWebSocket() {

    clearTimeout(
        ownerReconnectTimer
    )


    ownerReconnectTimer =
        null


    if (
        !ownerWebSocket
    ) {

        return

    }


    const socket =
        ownerWebSocket


    ownerWebSocket =
        null


    /*
     * Prevent intentional disconnect
     * from triggering reconnect.
     */

    socket.onclose =
        null


    try {

        socket.close()

    }
    catch (error) {

        console.error(
            "[Owner WebSocket] Close error:",
            error
        )

    }

}
/* ==============================================
   Load Owners
============================================== */

async function loadOwners() {

    try {

        const response =
            await fetch("/api/owners")


        if (!response.ok) {

            throw new Error(
                `Failed to load owners: ${response.status}`
            )

        }


        const data =
            await response.json()


        owners.value =
            Array.isArray(data)
                ? data
                : []


    } catch (error) {

        console.error(
            "Failed to load owners:",
            error
        )

    }

}


/*
 * OwnerManager tells us that the owner list
 * has changed.
 *
 * Do NOT trust the emitted old list as the
 * source of truth.
 *
 * Reload directly from the API instead.
 */
async function handleOwnersUpdated() {

    await loadOwners()

}


/* ==============================================
   Initialization
============================================== */

onMounted(async () => {

    await loadOwners()

    await loadProjects()

    await loadTemplates()


    /*
     * Owner realtime sync
     */

    connectOwnerWebSocket()


    /*
     * Project realtime sync
     */

    connectProjectWebSocket()


    /*
     * Template realtime sync
     */

    connectTemplateWebSocket()


    /*
     * Task realtime sync
     */

    if (
        selectedProject.value
    ) {

        connectWebSocket(
            selectedProject.value
        )

    }

})/* ==============================================
   Load Tasks When Project Changes
============================================== */

watch(
    selectedProject,

    async (project) => {

        if (!project?.id) {

            disconnectWebSocket()

            return

        }


        /*
         * Reload tasks for the selected project.
         */

        try {

            const tasks =
                await loadTasks(
                    project.id
                )


            if (
                selectedProject.value?.id ===
                project.id
            ) {

                selectedProject.value.tasks =
                    Array.isArray(tasks)
                        ? tasks
                        : []

            }

        }
        catch (error) {

            console.error(
                "Failed to load project tasks:",
                error
            )

        }


        /*
         * Reconnect WebSocket for
         * the newly selected project.
         */

        connectWebSocket(
            project
        )

    },

    {
        immediate: true
    }
)
/* ==============================================
   Project Modal
============================================== */

const showProjectModal =
    ref(false)

const editingProject =
    ref(null)


function openCreateProject() {

    editingProject.value = null

    showProjectModal.value = true

}


function openEditProject(project) {

    editingProject.value = project

    showProjectModal.value = true

}


async function saveProject(project) {

    if (!project) {

        return

    }


    try {

        if (project.id) {

            await updateProject(project)

        } else {

            await createProject(project)

        }


        showProjectModal.value = false
        editingProject.value = null

    } catch (error) {

        console.error(
            "Failed to save project:",
            error
        )

    }

}


/* ==============================================
   Project Delete
============================================== */

async function deleteProjectHandler(project) {

    if (!project) {

        return

    }


    try {

        await deleteProject(project)

    } catch (error) {

        console.error(
            "Failed to delete project:",
            error
        )

    }

}


/* ==============================================
   Task Create
============================================== */

const showTaskModal =
    ref(false)


function openCreateTask() {

    editingTask.value = null

    showTaskModal.value = true

}


/* ==============================================
   Task Edit Sidebar
============================================== */

const showTaskSidebar =
    ref(false)


function openEditTask(task) {

    if (!task) {

        return

    }


    editingTask.value = task

    showTaskSidebar.value = true

}


function closeTaskSidebar() {

    showTaskSidebar.value = false

    editingTask.value = null

}


/* ==============================================
   Task Save
============================================== */

async function saveTaskHandler(task) {

    if (
        !task ||
        !selectedProject.value
    ) {

        return

    }


    try {

        const success =
            await saveTask(
                task,
                selectedProject.value
            )


        if (!success) {

            return

        }


        /*
         * Reload from backend.
         */
        const tasks =
            await loadTasks(
                selectedProject.value.id
            )


        selectedProject.value.tasks =
            Array.isArray(tasks)
                ? tasks
                : []


        showTaskModal.value = false
        showTaskSidebar.value = false

        editingTask.value = null

    } catch (error) {

        console.error(
            "Failed to save task:",
            error
        )

    }

}


/* ==============================================
   Task Move
============================================== */

async function handleMoveTask(payload) {

    if (
        !payload ||
        !selectedProject.value
    ) {

        return

    }


    const task =
        payload.task

    const status =
        payload.status


    if (!task || !status) {

        return

    }


    try {

        const success =
            await moveTask(
                task,
                status,
                selectedProject.value
            )


        if (!success) {

            return

        }


        const tasks =
            await loadTasks(
                selectedProject.value.id
            )


        selectedProject.value.tasks =
            Array.isArray(tasks)
                ? tasks
                : []

    } catch (error) {

        console.error(
            "Failed to move task:",
            error
        )

    }

}


/* ==============================================
   Task Delete
============================================== */

async function deleteTaskHandler(task) {

    if (
        !task ||
        !selectedProject.value
    ) {

        return

    }


    try {

        const success =
            await deleteTask(
                task,
                selectedProject.value
            )


        if (!success) {

            return

        }


        const tasks =
            await loadTasks(
                selectedProject.value.id
            )


        selectedProject.value.tasks =
            Array.isArray(tasks)
                ? tasks
                : []


        if (
            editingTask.value?.id === task.id
        ) {

            closeTaskSidebar()

        }


        if (
            detailTask.value?.id === task.id
        ) {

            closeTaskDetail()

        }

    } catch (error) {

        console.error(
            "Failed to delete task:",
            error
        )

    }

}


/* ==============================================
   Task Detail
============================================== */

const showTaskDetail =
    ref(false)

const detailTask =
    ref(null)


function openTaskDetail(task) {

    if (!task) {

        return

    }


    detailTask.value = task

    showTaskDetail.value = true

}


function closeTaskDetail() {

    showTaskDetail.value = false

    detailTask.value = null

}


/* ==============================================
   Owner Modal
============================================== */

const showOwnerModal =
    ref(false)


/* ==============================================
   Template
============================================== */

const showTemplateModal =
    ref(false)


async function createTemplateHandler(template) {

    if (!template) {

        return

    }


    try {

        await createTemplate(template)

    } catch (error) {

        console.error(
            "Failed to create template:",
            error
        )

    }

}


async function updateTemplateHandler(template) {

    if (!template) {

        return

    }


    try {

        await updateTemplate(template)

    } catch (error) {

        console.error(
            "Failed to update template:",
            error
        )

    }

}


async function deleteTemplateHandler(template) {

    if (!template) {

        return

    }


    try {

        await deleteTemplate(template)

    } catch (error) {

        console.error(
            "Failed to delete template:",
            error
        )

    }

}


/* ==============================================
   Use Template
============================================== */

async function useTemplateHandler(template) {

    if (
        !template ||
        !selectedProject.value
    ) {

        return

    }


    try {

        const task =
            createTaskFromTemplate(
                template
            )


        if (!task) {

            return

        }


        const success =
            await saveTask(
                task,
                selectedProject.value
            )


        if (!success) {

            return

        }


        const tasks =
            await loadTasks(
                selectedProject.value.id
            )


        selectedProject.value.tasks =
            Array.isArray(tasks)
                ? tasks
                : []


        showTemplateModal.value = false

    } catch (error) {

        console.error(
            "Failed to use template:",
            error
        )

    }

}
onUnmounted(() => {

    disconnectWebSocket()
    disconnectProjectWebSocket()
    disconnectOwnerWebSocket()
         disconnectTemplateWebSocket()

})
</script>
```
