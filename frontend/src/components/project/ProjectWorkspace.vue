<template>

<section
    v-if="project"
    class="workspace"
>

    <!-- =========================================
         Project Header
    ========================================== -->

    <header class="project-top">

        <div>

            <h2>

                {{ project.name }}

            </h2>

            <p>

                Lab Task Management

            </p>

        </div>

    </header>


    <!-- =========================================
         Workspace Toolbar
    ========================================== -->

    <section class="project-action-bar">

        <!-- =====================================
             Owner Filter
        ====================================== -->

        <div
            class="owner-filter"
            aria-label="Filter tasks by owner"
        >

            <button
                type="button"
                class="owner-chip"
                :class="{
                    active:
                        selectedOwner === 'ALL'
                }"
                @click="selectedOwner = 'ALL'"
            >

                ALL

            </button>


            <button
                v-for="owner in owners"
                :key="owner"
                type="button"
                class="owner-chip"
                :class="{
                    active:
                        selectedOwner === owner
                }"
                @click="selectedOwner = owner"
            >

                {{ owner }}

            </button>

        </div>


        <!-- =====================================
             Workspace Actions
        ====================================== -->

        <div class="project-actions">

            <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('open-owner')"
            >

                Members

            </button>


            <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('open-template')"
            >

                Templates

            </button>


            <button
                type="button"
                class="btn btn-primary"
                @click="$emit('create-task')"
            >

                ＋ New Task

            </button>

        </div>

    </section>


    <!-- =========================================
         Kanban
    ========================================== -->

    <main class="kanban-wrapper">

        <KanbanBoard
    :project="project"
    :filter-owner="selectedOwner"

    @detail="handleDetailTask"

    @edit="handleEditTask"

    @delete="$emit('delete-task', $event)"

    @checklist-update="handleChecklistUpdate"
        />

    </main>


<Transition name="task-sidebar">

    <TaskEditSidebar
        v-if="editingTask"
        :task="editingTask"
        :owners="owners"
        @save="handleTaskSave"
        @close="closeTaskSidebar"
    />

</Transition>
</section>
<!-- =============================================
     No Project
============================================= -->

<section
    v-else
    class="workspace workspace-empty"
>

    <div class="workspace-empty-content">

        <h2>

            No Project Selected

        </h2>

        <p>

            Create or select a Project to start
            managing tasks.

        </p>

    </div>

</section>

</template>


<script setup>

import {
    ref,
    watch
} from "vue"


import KanbanBoard
    from "../kanban/KanbanBoard.vue"

import TaskEditSidebar
    from "../task/TaskEditSidebar.vue"
/* ==============================================
   Props
============================================== */

const props = defineProps({

    project: {

        type: Object,

        default: null

    },


    owners: {

        type: Array,

        default: () => []

    }

})


/* ==============================================
   Events
============================================== */

const emit = defineEmits([

    "create-task",

    "detail-task",

    "delete-task",

    "open-template",

    "open-owner",

    "update-task"

])


/* ==============================================
   Owner Filter
============================================== */

const selectedOwner = ref("ALL")


watch(

    () => props.owners,

    owners => {

        if (

            selectedOwner.value !== "ALL" &&

            !owners.includes(
                selectedOwner.value
            )

        ) {

            selectedOwner.value = "ALL"

        }

    },

    {
        deep: true
    }

)

const editingTask = ref(null)

/* ==============================================
   Open Sidebar
============================================== */

function handleEditTask(task) {

    if (!task) {
        return
    }

    editingTask.value = task

}

/* ==============================================
   Detail
============================================== */

function handleDetailTask(task) {

    emit(

        "detail-task",

        task

    )

}


/* ==============================================
   Close Sidebar
============================================== */

function closeTaskSidebar() {

    editingTask.value = null

}

function handleTaskSave(task) {

    if (!task) {

        return

    }


    emit(
        "update-task",
        task
    )


    closeTaskSidebar()

}

/* ==============================================
   Checklist Update
============================================== */

function handleChecklistUpdate(payload) {

    if (!payload) {

        return

    }


    const task = payload.task

    const checklist = Array.isArray(
        payload.checklist
    )
        ? payload.checklist
        : []


    if (!task) {

        return

    }


    const updatedTask = {

        ...task,

        checklist: checklist.map(

            item => ({

                id:
                    item.id,

                text:
                    item.text ?? "",

                completed:
                    Boolean(
                        item.completed
                    )

            })

        )

    }


    emit(

        "update-task",

        updatedTask

    )

}
</script>