<template>

<div
    class="modal-overlay"
    @click.self="close"
>

    <section class="task-modal">

        <!-- =========================================
             Header
        ========================================== -->

        <header class="modal-header">

            <div>

                <h2>

                    {{ isEditing ? "編輯任務" : "新增任務" }}

                </h2>

                <p class="modal-subtitle">

                    {{ isEditing
                        ? "Update task information"
                        : "Create a new team task"
                    }}

                </p>

            </div>


            <button
                type="button"
                class="close-button"
                @click="close"
                aria-label="Close"
            >

                ×

            </button>

        </header>


        <!-- =========================================
             Form
        ========================================== -->

        <form
            class="task-modal-form"
            @submit.prevent="save"
        >

            <div class="modal-body">


                <!-- =====================================
                     Task Name
                ====================================== -->

                <div class="form-group">

                    <label for="task-name">

                        任務名稱

                    </label>

                    <input
                        id="task-name"
                        v-model="form.name"
                        type="text"
                        placeholder="例如：Update GPU firmware"
                        autocomplete="off"
                        required
                    />

                </div>


                <!-- =====================================
                     Owner / Status
                ====================================== -->

                <div class="form-grid">

                    <div class="form-group">

                        <label for="task-owner">

                            負責人

                        </label>

                        <select
                            id="task-owner"
                            v-model="form.owner"
                        >

                            <option
                                value=""
                            >

                                未指定

                            </option>

                            <option
                                v-for="owner in owners"
                                :key="owner"
                                :value="owner"
                            >

                                {{ owner }}

                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label for="task-status">

                            狀態

                        </label>

                        <select
                            id="task-status"
                            v-model="form.status"
                        >

                            <option value="todo">

                                TO DO

                            </option>

                            <option value="running">

                                RUNNING

                            </option>

                            <option value="waiting">

                                WAITING

                            </option>

                            <option value="completed">

                                COMPLETED

                            </option>

                        </select>

                    </div>

                </div>


                <!-- =====================================
                     Priority
                ====================================== -->

                <div class="form-group">

                    <label for="task-priority">

                        優先度

                    </label>

                    <select
                        id="task-priority"
                        v-model="form.priority"
                    >

                        <option value="緊急且重要">

                            緊急且重要

                        </option>

                        <option value="緊急但不重要">

                            緊急但不重要

                        </option>

                        <option value="不緊急但重要">

                            不緊急但重要

                        </option>

                        <option value="不緊急也不重要">

                            不緊急也不重要

                        </option>

                    </select>

                </div>


                <!-- =====================================
                     Dates
                ====================================== -->

                <div class="form-grid">

                    <div class="form-group">

                        <label for="task-start">

                            開始日期

                        </label>

<DateInput
    id="task-start"
    v-model="form.start"
/>
                    </div>


                    <div class="form-group">

                        <label for="task-end">

                            結束日期

                        </label>

<DateInput
    id="task-end"
    v-model="form.end"
/>
                    </div>

                </div>


                <!-- =====================================
                     Description
                ====================================== -->

                <div class="form-group">

                    <label for="task-description">

                        說明

                    </label>

                    <textarea
                        id="task-description"
                        v-model="form.description"
                        rows="5"
                        placeholder="輸入任務說明、注意事項或相關資訊"
                    ></textarea>

                </div>


                <!-- =====================================
                     Checklist
                ====================================== -->

                <div class="form-group">

                    <div class="field-header">

                        <label>

                            子任務 Checklist

                        </label>


                        <button
                            type="button"
                            class="btn btn-secondary btn-small"
                            @click="addChecklistItem"
                        >

                            ＋ 新增子任務

                        </button>

                    </div>


                    <div class="checklist-editor">


                        <div
                            v-for="(item, index) in form.checklist"
                            :key="item.id || index"
                            class="checklist-editor-item"
                        >

                            <input
                                v-model="item.completed"
                                type="checkbox"
                            />


                            <input
                                v-model="item.text"
                                type="text"
                                placeholder="輸入子任務"
                            />


                            <button
                                type="button"
                                class="delete-button btn-small"
                                @click="removeChecklistItem(index)"
                                aria-label="Delete checklist item"
                            >

                                ×

                            </button>

                        </div>


                        <div
                            v-if="form.checklist.length === 0"
                            class="checklist-empty"
                        >

                            尚未建立子任務

                        </div>

                    </div>

                </div>


            </div>


            <!-- =========================================
                 Footer
            ========================================== -->

            <footer class="modal-buttons">

                <button
                    type="button"
                    class="btn btn-secondary"
                    @click="close"
                >

                    取消

                </button>


                <button
                    type="submit"
                    class="btn btn-primary"
                >

                    {{ isEditing ? "儲存變更" : "新增任務" }}

                </button>

            </footer>

        </form>

    </section>

</div>

</template>


<script setup>

import {
    computed,
    reactive
} from "vue"

import DateInput
    from "./common/DateInput.vue"

/* ==============================================
   Props
============================================== */

const props = defineProps({

    task: {

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

    "save",

    "close"

])


/* ==============================================
   Editing
============================================== */

const isEditing = computed(() => {

    return Boolean(
        props.task?.id
    )

})


/* ==============================================
   Checklist Clone
============================================== */

function cloneChecklist(list) {

    if (!Array.isArray(list)) {

        return []

    }


    return list.map(

        (item, index) => ({

            id:
                item.id ??
                `check-${Date.now()}-${index}`,

            text:
                item.text ?? "",

            completed:
                Boolean(item.completed)

        })

    )

}


/* ==============================================
   Initial Form
============================================== */

function createForm(task) {

    return {

        id:
            task?.id ?? null,

        name:
            task?.name ?? "",

        owner:
            task?.owner ?? "",

        status:
            normalizeStatus(
                task?.status
            ),

        priority:
            task?.priority ??
            "緊急且重要",

        start:
            task?.start ?? "",

        end:
            task?.end ?? "",

        description:
            task?.description ?? "",

        checklist:
            cloneChecklist(
                task?.checklist
            )

    }

}


const form = reactive(

    createForm(
        props.task
    )

)


/* ==============================================
   Status
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


    return map[value] || "todo"

}


/* ==============================================
   Checklist
============================================== */

function addChecklistItem() {

    form.checklist.push({

        id:
            `check-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        text:
            "",

        completed:
            false

    })

}


function removeChecklistItem(index) {

    form.checklist.splice(

        index,

        1

    )

}


/* ==============================================
   Validation
============================================== */

function validate() {

    if (
        !form.name.trim()
    ) {

        window.alert(
            "請輸入任務名稱"
        )

        return false

    }


    if (
        form.start &&
        form.end &&
        form.end < form.start
    ) {

        window.alert(
            "結束日期不能早於開始日期"
        )

        return false

    }


    return true

}


/* ==============================================
   Save
============================================== */

function save() {

    if (!validate()) {

        return

    }


    const task = {

        id:
            form.id,

        name:
            form.name.trim(),

        owner:
            form.owner,

        status:
            form.status,

        priority:
            form.priority,

        start:
            form.start,

        end:
            form.end,

        description:
            form.description.trim(),

        checklist:
            form.checklist.map(

                item => ({

                    id:
                        item.id,

                    text:
                        item.text.trim(),

                    completed:
                        Boolean(
                            item.completed
                        )

                })

            )

    }


    emit(

        "save",

        task

    )

}


/* ==============================================
   Close
============================================== */

function close() {

    emit(
        "close"
    )

}

</script>