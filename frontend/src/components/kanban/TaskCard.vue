<template>

<article
    class="task-card"

    draggable="true"

    @dragstart="handleDragStart"

    @dragend="handleDragEnd"
>


    <!-- =========================================
         Header
    ========================================== -->

    <div class="task-card-header">

        <h4 class="task-card-title">

            {{ task.name || "Untitled Task" }}

        </h4>


        <!-- =====================================
             Quick Actions
        ====================================== -->

        <div class="task-card-actions">


            <!-- Edit -->

            <button
                type="button"

                class="
                    task-card-icon-button
                    task-card-edit-button
                "

                aria-label="Edit task"

                title="編輯任務"

                @click.stop="
                    emit('edit', task)
                "
            >

                ✎

            </button>


            <!-- Delete -->

            <button
                type="button"

                class="
                    task-card-icon-button
                    task-card-delete-button
                "

                aria-label="Delete task"

                title="刪除任務"

                @click.stop="
                    emit('delete', task)
                "
            >

                🗑

            </button>

        </div>

    </div>


    <!-- =========================================
         Owner
    ========================================== -->

    <div
        v-if="task.owner"

        class="task-card-owner"
    >

        {{ task.owner }}

    </div>


    <!-- =========================================
         Priority
    ========================================== -->

    <div
        v-if="task.priority"

        class="task-priority"

        :class="priorityClass"
    >

        {{ task.priority }}

    </div>


    <!-- =========================================
         Description
    ========================================== -->

    <p
        v-if="task.description"

        class="task-card-description"
    >

        {{ task.description }}

    </p>


    <!-- =========================================
         Date
    ========================================== -->

    <div
        v-if="task.start || task.end"

        class="task-card-dates"
    >

        <span v-if="task.start">

            {{ formatDate(task.start) }}

        </span>


        <span
            v-if="
                task.start &&
                task.end
            "

            class="date-arrow"
        >

            →

        </span>


        <span v-if="task.end">

            {{ formatDate(task.end) }}

        </span>

    </div>


    <!-- =========================================
         Checklist
    ========================================== -->

    <div
        v-if="checklist.length"

        class="task-card-checklist"
    >

        <div
            class="checklist-summary"
        >

            <span>

                Checklist

            </span>


            <strong>

                {{ completedChecklistCount }}/{{ checklistCount }}

            </strong>

        </div>


        <div
            v-for="(item, index) in checklist"

            :key="
                item.id ||
                index
            "

            class="
                task-card-checklist-item
            "

            :class="{
                completed:
                    item.completed
            }"
        >

            <button
                type="button"

                class="
                    task-card-checklist-checkbox
                "

                :class="{
                    checked:
                        item.completed
                }"

                :aria-label="
                    item.completed
                        ? '取消完成'
                        : '完成子任務'
                "

                @click.stop="
                    toggleChecklist(index)
                "
            >

                <span
                    v-if="item.completed"
                    aria-hidden="true"
                >

                    ✓

                </span>

            </button>


            <span
                class="
                    task-card-checklist-text
                "
            >

                {{ item.text }}

            </span>

        </div>

    </div>


</article>

</template>


<script setup>

import {
    computed
} from "vue"


/* ==============================================
   Props
============================================== */

const props = defineProps({

    task: {

        type: Object,

        required: true

    }

})


/* ==============================================
   Events
============================================== */

const emit = defineEmits([

    "dragstart",

    "dragend",

    "edit",

    "delete",

    "checklist-update"

])


/* ==============================================
   Drag
============================================== */

function handleDragStart(event) {

    event.dataTransfer.effectAllowed =
        "move"


    try {

        event.dataTransfer.setData(

            "text/plain",

            String(
                props.task.id
            )

        )

    }

    catch {

        /*
         * Some browsers may reject setData.
         */

    }


    event.currentTarget.classList.add(

        "is-dragging"

    )


    emit(

        "dragstart",

        props.task

    )

}


function handleDragEnd(event) {

    event.currentTarget.classList.remove(

        "is-dragging"

    )


    emit(

        "dragend",

        props.task

    )

}


/* ==============================================
   Checklist
============================================== */

const checklist = computed(() => {

    return Array.isArray(

        props.task.checklist

    )

        ? props.task.checklist

        : []

})


const checklistCount = computed(() => {

    return checklist.value.length

})


const completedChecklistCount =
    computed(() => {

        return checklist.value.filter(

            item =>
                item.completed === true

        ).length

    })


/* ==============================================
   Checklist Toggle
============================================== */

function toggleChecklist(index) {

    const currentChecklist =

        checklist.value.map(

            (item, itemIndex) => {

                if (
                    itemIndex !== index
                ) {

                    return {
                        ...item
                    }

                }


                return {

                    ...item,

                    completed:
                        !item.completed

                }

            }

        )


    emit(

        "checklist-update",

        {

            task: props.task,

            checklist:
                currentChecklist

        }

    )

}


/* ==============================================
   Priority
============================================== */

const priorityClass = computed(() => {

    switch (

        props.task.priority

    ) {

        case "緊急且重要":

            return "priority-critical"


        case "緊急但不重要":

            return "priority-urgent"


        case "不緊急但重要":

            return "priority-important"


        case "不緊急也不重要":

            return "priority-low"


        default:

            return ""

    }

})


/* ==============================================
   Date
============================================== */

function formatDate(value) {

    if (!value) {

        return ""

    }


    /*
     * Keep YYYY-MM-DD strings unchanged.
     *
     * This avoids timezone conversion problems.
     */

    if (

        typeof value === "string" &&

        /^\d{4}-\d{2}-\d{2}$/.test(value)

    ) {

        return value

    }


    const date = new Date(value)


    if (

        Number.isNaN(

            date.getTime()

        )

    ) {

        return value

    }


    return date.toLocaleDateString(

        "zh-TW",

        {

            year: "numeric",

            month: "2-digit",

            day: "2-digit"

        }

    )

}

</script>