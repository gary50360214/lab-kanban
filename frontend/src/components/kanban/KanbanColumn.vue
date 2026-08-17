<template>

<section
    class="kanban-column"

    :class="{
        'is-drag-over': isDragOver,
        'has-dragging-task': isDragging
    }"

    @dragover.prevent="handleDragOver"

    @dragenter.prevent="handleDragEnter"

    @dragleave="handleDragLeave"

    @drop.prevent="handleDrop"
>


    <!-- =========================================
         Column Header
    ========================================== -->

    <header class="kanban-column-header">

        <div class="kanban-column-heading">

            <h3 class="kanban-column-title">

                {{ title }}

            </h3>

        </div>


        <span class="kanban-column-count">

            {{ count }}

        </span>

    </header>


    <!-- =========================================
         Column Body
    ========================================== -->

    <div class="kanban-column-body">


        <!-- =====================================
             Tasks
        ====================================== -->

        <TaskCard
            v-for="task in tasks"
            :key="task.id"

            :task="task"

            draggable="true"

            @dragstart="
                handleTaskDragStart(task)
            "

            @dragend="
                handleTaskDragEnd
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
@checklist-update="
    emit('checklist-update', $event)
"
        />


        <!-- =====================================
             Empty State
        ====================================== -->

        <div
            v-if="tasks.length === 0"
            class="kanban-empty"
            :class="{
                'is-drop-target':
                    isDragOver
            }"
        >

            <span v-if="isDragOver">

                Drop task here

            </span>

            <span v-else>

                No tasks

            </span>

        </div>


    </div>

</section>

</template>


<script setup>

import {
    ref
} from "vue"


import TaskCard
    from "./TaskCard.vue"
/* ==============================================
   Props
============================================== */

const props = defineProps({

    title: {

        type: String,

        required: true

    },


    status: {

        type: String,

        required: true

    },


    tasks: {

        type: Array,

        default: () => []

    },


    count: {

        type: Number,

        default: 0

    },


    /*
     * Controlled by KanbanBoard.
     *
     * The column itself does NOT own the drag
     * state anymore.
     */

    isDragging: {

        type: Boolean,

        default: false

    },


    isDragOver: {

        type: Boolean,

        default: false

    }

})


/* ==============================================
   Events
============================================== */

const emit = defineEmits([

    "detail",

    "edit",

    "delete",

    "drag-start",

    "drag-end",

    "drag-over",

    "drag-leave",

    "drop",
    "checklist-update"

])


/* ==============================================
   Task Drag Start
============================================== */

function handleTaskDragStart(task) {

    if (!task) {

        return

    }


    emit(

        "drag-start",

        task

    )

}


/* ==============================================
   Task Drag End
============================================== */

function handleTaskDragEnd() {

    emit(

        "drag-end"

    )

}


/* ==============================================
   Column Drag Enter
============================================== */

function handleDragEnter() {

    emit(

        "drag-over",

        props.status

    )

}


/* ==============================================
   Column Drag Over
============================================== */

function handleDragOver() {

    emit(

        "drag-over",

        props.status

    )

}


/* ==============================================
   Column Drag Leave
============================================== */

function handleDragLeave(event) {

    /*
     * dragleave can fire when moving between
     * elements inside the column.
     *
     * Only notify the board when the pointer
     * actually leaves the column.
     */

    if (
        event.currentTarget ===
        event.target
    ) {

        emit(

            "drag-leave",

            props.status

        )

    }

}


/* ==============================================
   Drop
============================================== */

function handleDrop() {

    emit(

        "drop",

        props.status

    )

}

</script>