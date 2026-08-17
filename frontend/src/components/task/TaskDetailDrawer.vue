<template>

<div
    v-if="task"
    class="task-drawer-overlay"
    @click.self="close"
>


    <!-- =========================================
         Drawer
    ========================================== -->

    <aside
        class="task-drawer"
        aria-label="Task editor"
    >


        <!-- =====================================
             Header
        ====================================== -->

        <header class="task-drawer-header">

            <div class="task-drawer-heading">

                <span class="task-drawer-eyebrow">

                    TASK

                </span>


                <h2>

                    {{ task.name || "Untitled Task" }}

                </h2>

            </div>


            <button
                type="button"
                class="task-drawer-close"
                aria-label="Close"
                @click="close"
            >

                ×

            </button>

        </header>


        <!-- =====================================
             Body
        ====================================== -->

        <div class="task-drawer-body">


            <!-- Task Name -->

            <div class="drawer-form-group">

                <label for="drawer-task-name">

                    任務名稱

                </label>

                <input
                    id="drawer-task-name"
                    v-model="form.name"
                    type="text"
                    autocomplete="off"
                />

            </div>


            <!-- Owner / Status -->

            <div class="drawer-form-grid">


                <div class="drawer-form-group">

                    <label for="drawer-task-owner">

                        負責人

                    </label>

                    <select
                        id="drawer-task-owner"
                        v-model="form.owner"
                    >

                        <option value="">

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


                <div class="drawer-form-group">

                    <label for="drawer-task-status">

                        狀態

                    </label>

                    <select
                        id="drawer-task-status"
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


            <!-- Priority -->

            <div class="drawer-form-group">

                <label for="drawer-task-priority">

                    優先度

                </label>

                <select
                    id="drawer-task-priority"
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


            <!-- Dates -->

            <div class="drawer-form-grid">


                <div class="drawer-form-group">

                    <label for="drawer-task-start">

                        開始日期

                    </label>

                    <input
                        id="drawer-task-start"
                        v-model="form.start"
                        type="date"
                    />

                </div>


                <div class="drawer-form-group">

                    <label for="drawer-task-end">

                        結束日期

                    </label>

                    <input
                        id="drawer-task-end"
                        v-model="form.end"
                        type="date"
                    />

                </div>

            </div>


            <!-- Description -->

            <div class="drawer-form-group">

                <label for="drawer-task-description">

                    說明

                </label>

                <textarea
                    id="drawer-task-description"
                    v-model="form.description"
                    rows="6"
                    placeholder="輸入任務說明、注意事項或相關資訊"
                ></textarea>

            </div>

            <!-- Checklist -->

            <div class="drawer-form-group">

                <div class="drawer-field-header">

                    <label>

                        子任務 Checklist

                    </label>


                    <button
                        type="button"
                        class="drawer-add-button"
                        @click="addChecklistItem"
                    >

                        ＋ 新增

                    </button>

                </div>


                <div class="drawer-checklist">


                    <div
                        v-for="(item, index) in form.checklist"
                        :key="item.id || index"
                        class="drawer-checklist-item"
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
                            class="drawer-delete-checklist"
                            aria-label="Delete checklist item"
                            @click="removeChecklistItem(index)"
                        >

                            ×

                        </button>

                    </div>


                    <div
                        v-if="form.checklist.length === 0"
                        class="drawer-checklist-empty"
                    >

                        尚未建立子任務

                    </div>

                </div>

            </div>


        </div>


        <!-- =====================================
             Footer
        ====================================== -->

        <footer class="task-drawer-footer">

            <button
                type="button"
                class="drawer-cancel-button"
                @click="close"
            >

                取消

            </button>


            <button
                type="button"
                class="drawer-save-button"
                @click="save"
            >

                儲存變更

            </button>

        </footer>


    </aside>

</div>

</template>


<script setup>

import {
    reactive,
    watch
} from "vue"


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
   Clone Checklist
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
   Normalize Status
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
   Create Form
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
            "不緊急也不重要",

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
   Sync When Another Task Is Selected
============================================== */

watch(

    () => props.task,

    task => {

        Object.assign(

            form,

            createForm(task)

        )

    },

    {
        deep: true
    }

)


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

    if (!form.name.trim()) {

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


    const updatedTask = {

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

        updatedTask

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
