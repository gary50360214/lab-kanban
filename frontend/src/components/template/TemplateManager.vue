<template>

<div
    class="modal-overlay"
    @click.self="close"
>

    <section class="template-manager-modal">


        <!-- =========================================
             Header
        ========================================== -->

        <header class="modal-header">

            <div>

                <h2>

                    任務範本

                </h2>

                <p class="modal-subtitle">

                    建立重複性工作的標準任務

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
             Body
        ========================================== -->

        <div class="modal-body">


            <!-- =====================================
                 Toolbar
            ====================================== -->

            <div class="template-toolbar">

                <div>

                    <strong>

                        {{ templates.length }}

                    </strong>

                    <span>

                        個範本

                    </span>

                </div>


                <button
                    type="button"
                    class="btn btn-primary"
                    @click="createTemplate"
                >

                    ＋ 新增範本

                </button>

            </div>


            <!-- =====================================
                 Template List
            ====================================== -->

            <div
                v-if="templates.length > 0"
                class="template-list"
            >

                <article
                    v-for="template in templates"
                    :key="template.id"
                    class="template-item"
                >


                    <!-- Info -->

                    <div class="template-info">

                        <h3>

                            {{ template.name }}

                        </h3>


                        <div class="template-meta">

                            <span>

                                {{ template.owner || "未指定負責人" }}

                            </span>


                            <span>

                                {{ statusLabel(template.status) }}

                            </span>


                            <span>

                                {{ checklistCount(template) }} 個子任務

                            </span>

                        </div>


                        <p
                            v-if="template.description"
                        >

                            {{ template.description }}

                        </p>

                    </div>


                    <!-- Actions -->

                    <div class="template-actions">
    <button
        type="button"
        class="btn btn-primary btn-small"
        @click="useTemplate(template)"
    >

        使用該範本

    </button>
                        <button
                            type="button"
                            class="btn btn-secondary btn-small"
                            @click="editTemplate(template)"
                        >

                            編輯

                        </button>


                        <button
                            type="button"
                            class="delete-button"
                            @click="deleteTemplate(template)"
                        >

                            刪除

                        </button>

                    </div>

                </article>

            </div>


            <!-- =====================================
                 Empty State
            ====================================== -->

            <div
                v-else
                class="template-empty"
            >

                <div class="template-empty-icon">

                    ＋

                </div>


                <h3>

                    尚無任務範本

                </h3>


                <p>

                    建立一個範本，之後就能快速建立重複性的工作。

                </p>


                <button
                    type="button"
                    class="btn btn-primary"
                    @click="createTemplate"
                >

                    建立第一個範本

                </button>

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

                關閉

            </button>

        </footer>


        <!-- =========================================
             Template Editor
        ========================================== -->

        <TemplateEditor
            v-if="showEditor"
            :template="editingTemplate"
            :owners="owners"
            @save="saveTemplate"
            @close="closeEditor"
        />

    </section>

</div>

</template>


<script setup>

import {
    ref
} from "vue"


import TemplateEditor
    from "./TemplateEditor.vue"


/* ==============================================
   Props
============================================== */

const props = defineProps({

    templates: {

        type: Array,

        default: () => []

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

    "create",

    "update",

    "delete",

    "use",

"close"

])


/* ==============================================
   State
============================================== */

const showEditor =
    ref(false)


const editingTemplate =
    ref(null)


/* ==============================================
   Create
============================================== */

function createTemplate() {

    editingTemplate.value = {

        id: null,

        name: "",

        owner: "",

        status: "todo",

        priority: "緊急且重要",

        start: "",

        end: "",

        description: "",

        progress: 0,

        checklist: []

    }


    showEditor.value = true

}


/* ==============================================
   Edit
============================================== */

function editTemplate(template) {

    editingTemplate.value =
        cloneTemplate(template)


    showEditor.value = true

}
/* ==============================================
   Use Template
============================================== */

function useTemplate(template) {

    if (!template) {

        return

    }


    emit(

        "use",

        cloneTemplate(template)

    )

}

/* ==============================================
   Save
============================================== */

function saveTemplate(template) {

    if (
        !template.name?.trim()
    ) {

        window.alert(
            "請輸入範本名稱"
        )

        return

    }


    const data =
        cloneTemplate(template)


    if (
        data.id
    ) {

        emit(
            "update",
            data
        )

    }
    else {

        emit(
            "create",
            data
        )

    }


    closeEditor()

}


/* ==============================================
   Delete
============================================== */

function deleteTemplate(template) {

    const confirmed =
        window.confirm(

            `確定要刪除「${template.name}」嗎？`

        )


    if (!confirmed) {

        return

    }


    emit(
        "delete",
        template
    )

}


/* ==============================================
   Close Editor
============================================== */

function closeEditor() {

    showEditor.value = false

    editingTemplate.value = null

}


/* ==============================================
   Close Manager
============================================== */

function close() {

    emit(
        "close"
    )

}


/* ==============================================
   Clone
============================================== */

function cloneTemplate(template) {

    return {

        id:
            template?.id ?? null,

        name:
            template?.name ?? "",

        owner:
            template?.owner ?? "",

        status:
            normalizeStatus(
                template?.status
            ),

        priority:
            template?.priority ??
            "不緊急也不重要",

        start:
            template?.start ?? "",

        end:
            template?.end ?? "",

        description:
            template?.description ?? "",

        progress:
            Number(
                template?.progress ?? 0
            ),

        checklist:
            Array.isArray(
                template?.checklist
            )

                ? template.checklist.map(

                    item => ({

                        id:
                            item.id ??
                            null,

                        text:
                            item.text ?? "",

                        completed:
                            Boolean(
                                item.completed
                            )

                    })

                )

                : []

    }

}


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
   Status Label
============================================== */

function statusLabel(status) {

    const map = {

        todo:
            "TO DO",

        running:
            "RUNNING",

        waiting:
            "WAITING",

        completed:
            "COMPLETED"

    }


    return map[
        normalizeStatus(status)
    ] || "TO DO"

}


/* ==============================================
   Checklist Count
============================================== */

function checklistCount(template) {

    return Array.isArray(
        template?.checklist
    )

        ? template.checklist.length

        : 0

}

</script>