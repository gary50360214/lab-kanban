<template>

<aside
    class="task-edit-sidebar"
    aria-label="Edit task"
>

    <!-- =========================================
         Header
    ========================================== -->

    <header class="task-sidebar-header">

        <div class="task-sidebar-heading">

            <span class="task-sidebar-eyebrow">
                TASK
            </span>

            <h2>
                編輯任務
            </h2>

            <p>
                Update task information
            </p>

        </div>


        <button
            type="button"
            class="task-sidebar-close"
            aria-label="Close"
            @click="close"
        >

            ×

        </button>

    </header>


    <!-- =========================================
         Form
    ========================================== -->

    <form
        class="task-sidebar-form"
        @submit.prevent="save"
    >

        <!-- =====================================
             Scrollable Body
        ====================================== -->

        <div class="task-sidebar-body">


            <!-- =================================
                 Task Name
            ================================== -->

            <section class="sidebar-section">

                <div class="form-group">

                    <label for="sidebar-task-name">

                        任務名稱

                    </label>

                    <input
                        id="sidebar-task-name"
                        v-model="form.name"
                        type="text"
                        placeholder="例如：Update GPU firmware"
                        autocomplete="off"
                        required
                    />

                </div>

            </section>


            <!-- =================================
                 Task Information
            ================================== -->

            <section class="sidebar-section">

                <div class="sidebar-section-header">

                    <h3>
                        任務資訊
                    </h3>

                    <span>
                        TASK INFO
                    </span>

                </div>


                <div class="sidebar-form-grid">


                    <!-- Owner -->

                    <div class="form-group">

                        <label for="sidebar-task-owner">

                            負責人

                        </label>

                        <select
                            id="sidebar-task-owner"
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


                    <!-- Status -->

                    <div class="form-group">

                        <label for="sidebar-task-status">

                            狀態

                        </label>

                        <select
                            id="sidebar-task-status"
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


                    <!-- Priority -->

                    <div class="form-group">

                        <label for="sidebar-task-priority">

                            優先度

                        </label>

                        <select
                            id="sidebar-task-priority"
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

                </div>

            </section>


            <!-- =================================
                 Dates
            ================================== -->

            <section class="sidebar-section">

    <div class="sidebar-section-header">

        <h3>
            日期
        </h3>

        <span>
            SCHEDULE
        </span>

    </div>


    <div class="sidebar-form-grid">

        <div class="form-group">

            <label for="sidebar-task-start">
                開始日期
            </label>

            <DateInput
                id="sidebar-task-start"
                v-model="form.start"
            />

        </div>


        <div class="form-group">

            <label for="sidebar-task-end">
                結束日期
            </label>

            <DateInput
                id="sidebar-task-end"
                v-model="form.end"
            />

        </div>

    </div>

</section>


            <!-- =================================
                 Description
            ================================== -->

            <section class="sidebar-section">

                <div class="sidebar-section-header">

                    <h3>
                        說明
                    </h3>

                    <span>
                        DESCRIPTION
                    </span>

                </div>


                <div class="form-group">

                    <textarea
                        id="sidebar-task-description"
                        v-model="form.description"
                        rows="6"
                        placeholder="輸入任務說明、注意事項或相關資訊"
                    ></textarea>

                </div>

            </section>

            <!-- =================================
                 Checklist
            ================================== -->

            <section class="sidebar-section">

                <div class="sidebar-section-header">

                    <div>

                        <h3>
                            子任務
                        </h3>

                        <span>
                            CHECKLIST
                        </span>

                    </div>


                    <button
                        type="button"
                        class="sidebar-add-button"
                        @click="addChecklistItem"
                    >

                        ＋ 新增

                    </button>

                </div>


                <div class="sidebar-checklist">


                    <div
                        v-for="(item, index) in form.checklist"
                        :key="item.id || index"
                        class="sidebar-checklist-item"
                    >

                        <input
                            v-model="item.completed"
                            type="checkbox"
                            :id="`sidebar-check-${index}`"
                        />


                        <label
                            :for="`sidebar-check-${index}`"
                            class="checklist-checkbox"
                        ></label>


                        <input
                            v-model="item.text"
                            type="text"
                            placeholder="輸入子任務"
                        />


                        <button
                            type="button"
                            class="checklist-delete-button"
                            aria-label="Delete checklist item"
                            @click="removeChecklistItem(index)"
                        >

                            ×

                        </button>

                    </div>


                    <div
                        v-if="form.checklist.length === 0"
                        class="sidebar-checklist-empty"
                    >

                        <span class="empty-icon">
                            ✓
                        </span>

                        <p>
                            尚未建立子任務
                        </p>

                        <button
                            type="button"
                            class="sidebar-empty-add"
                            @click="addChecklistItem"
                        >

                            新增第一個子任務

                        </button>

                    </div>

                </div>

            </section>

        </div>


        <!-- =====================================
             Footer
        ====================================== -->

        <footer class="task-sidebar-footer">

            <button
                type="button"
                class="sidebar-button sidebar-button-secondary"
                @click="close"
            >

                取消

            </button>


            <button
                type="submit"
                class="sidebar-button sidebar-button-primary"
            >

                儲存變更

            </button>

        </footer>

    </form>

</aside>

</template>


<script setup>

import {
    reactive
} from "vue"
import DateInput
    from "../common/DateInput.vue"

/* ==============================================
   Props
============================================== */

const props = defineProps({

    task: {

        type: Object,

        required: true

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
                Boolean(
                    item.completed
                )

        })

    )

}


/* ==============================================
   Status Normalize
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