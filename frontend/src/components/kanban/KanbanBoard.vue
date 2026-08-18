<template>

<section class="kanban-wrapper">


    <!-- =========================================
         Board Header
    ========================================== -->

    <header class="kanban-header">

        <div>

            <h3 class="kanban-subtitle">

                {{ filterOwner === "ALL"
                    ? "ALL"
                    : filterOwner
                }}

                : {{ totalVisibleTasks }} tasks

            </h3>

        </div>

    </header>


    <!-- =========================================
         Board
    ========================================== -->

    <div
        class="kanban-board"
        aria-label="Kanban board"
    >

        <KanbanColumn
            v-for="column in columns"
            :key="column.key"

            :title="column.label"

            :status="column.key"

            :tasks="tasksByStatus[column.key]"

            :count="
                tasksByStatus[column.key].length
            "

            :is-dragging="
                !!draggedTask
            "

            :is-drag-over="
                dragOverStatus === column.key
            "

            @detail="
                emit('detail', $event)
            "

            @edit="
                emit('edit', $event)
            "

            @delete="
                emit('delete', $event)
            "

            @drag-start="
                handleDragStart
            "

            @drag-end="
                handleDragEnd
            "

            @drag-over="
                handleDragOver
            "

            @drag-leave="
                handleDragLeave
            "

            @drop="
                handleDrop
            "
@checklist-update="
    emit('checklist-update', $event)
"

        />

    </div>

</section>

</template>


<script setup>

import {
    computed,
    ref
} from "vue"


import KanbanColumn
    from "./KanbanColumn.vue"


/* ==============================================
   Props
============================================== */

const props = defineProps({

    project: {

        type: Object,

        required: true

    },


    filterOwner: {

        type: String,

        default: "ALL"

    }

})


/* ==============================================
   Events
============================================== */

const emit = defineEmits([

    "detail",

    "edit",

    "delete",

    "checklist-update",

    "move-task"

])


/* ==============================================
   Columns
============================================== */

const columns = [

    {
        key: "todo",

        label: "TO DO"

    },

    {
        key: "running",

        label: "RUNNING"

    },

    {
        key: "waiting",

        label: "WAITING"

    },

    {
        key: "completed",

        label: "COMPLETED"

    }

]


/* ==============================================
   Drag State
============================================== */

/*
 * IMPORTANT
 *
 * Drag state belongs to the Board.
 *
 * KanbanColumn should NOT independently decide
 * which task is currently being dragged.
 *
 * This allows a task from TO DO to be dropped
 * into RUNNING / WAITING / COMPLETED correctly.
 */

const draggedTask = ref(null)


const dragOverStatus = ref(null)


/* ==============================================
   Drag Start
============================================== */

function handleDragStart(task) {

    if (!task) {

        return

    }


    draggedTask.value = task


    /*
     * Initially there is no target column.
     *
     * The target will be determined when the
     * pointer enters / moves over a column.
     */

    dragOverStatus.value = null

}


/* ==============================================
   Drag Over
============================================== */

function handleDragOver(status) {

    if (!draggedTask.value) {

        return

    }


    const targetStatus =
        normalizeStatus(status)


    /*
     * Do not allow an invalid column to become
     * the active drop target.
     */

    if (
        !columns.some(
            column =>
                column.key === targetStatus
        )
    ) {

        return

    }


    dragOverStatus.value =
        targetStatus

}


/* ==============================================
   Drag Leave
============================================== */

function handleDragLeave(status) {

    /*
     * Only clear the target when it matches
     * the currently active column.
     *
     * This prevents flickering when the pointer
     * moves between elements inside a column.
     */

    const targetStatus =
        normalizeStatus(status)


    if (
        dragOverStatus.value ===
        targetStatus
    ) {

        dragOverStatus.value = null

    }

}


/* ==============================================
   Drag End
============================================== */

function handleDragEnd() {

    draggedTask.value = null

    dragOverStatus.value = null

}


/* ==============================================
   Drop
============================================== */

function handleDrop(status) {

    if (!draggedTask.value) {

        return

    }


    const task =
        draggedTask.value


    const targetStatus =
        normalizeStatus(status)


    /*
     * Clear drag UI state first.
     */

    draggedTask.value = null

    dragOverStatus.value = null


    /*
     * Invalid target.
     */

    if (
        !columns.some(
            column =>
                column.key === targetStatus
        )
    ) {

        return

    }


    /*
     * Dropping into the same column.
     *
     * We are not implementing same-column
     * sorting yet, so simply do nothing.
     */

    if (
        normalizeStatus(task.status) ===
        targetStatus
    ) {

        return

    }


    /*
     * Move the task.
     */

    moveTask({

        task,

        status: targetStatus

    })

}


/* ==============================================
   All Tasks
============================================== */

const allTasks = computed(() => {

    if (
        !props.project ||
        !Array.isArray(
            props.project.tasks
        )
    ) {

        return []

    }


    return props.project.tasks

})


/* ==============================================
   Owner Filter
============================================== */

const filteredTasks = computed(() => {

    if (
        props.filterOwner === "ALL"
    ) {

        return allTasks.value

    }


    return allTasks.value.filter(

        task =>
            task.owner ===
            props.filterOwner

    )

})


/* ==============================================
   Tasks by Status
============================================== */

const tasksByStatus = computed(() => {

    const result = {

        todo: [],

        running: [],

        waiting: [],

        completed: []

    }


    filteredTasks.value.forEach(task => {

        const status =
            normalizeStatus(
                task.status
            )


        if (
            result[status]
        ) {

            result[status].push(task)

        }

    })


    return result

})


/* ==============================================
   Total
============================================== */

const totalVisibleTasks = computed(() => {

    return filteredTasks.value.length

})


/* ==============================================
   Status Normalization
============================================== */

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


    return (
        map[value] ||
        "todo"
    )

}


/* ==============================================
   Move Task
============================================== */

function moveTask({

    task,

    status

}) {

    if (!task) {

        return

    }


    if (!props.project) {

        return

    }


    const targetStatus =
        normalizeStatus(status)


    /*
     * Do not modify the task when the target
     * status is the same as the current status.
     */

    const currentStatus =
        normalizeStatus(
            task.status
        )


    if (
        currentStatus ===
        targetStatus
    ) {

        return

    }
task.status =
        targetStatus

    /*
     * Ask the parent to persist the status change.
     */

    emit(
        "move-task",
        {
            task,
            status: targetStatus
        }
    )

}


/* ==============================================
   No Scrollbar Here
============================================== */

/*
 * IMPORTANT:
 *
 * KanbanBoard intentionally does NOT define:
 *
 * height: 100vh;
 * overflow-y: auto;
 * overflow: hidden;
 *
 * The entire Projects page must grow naturally
 * when more tasks are added.
 */

</script>