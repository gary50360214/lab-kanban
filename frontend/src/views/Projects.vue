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

        @delete="deleteProject"

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
         
         Only used when creating a new task.
         Existing tasks are edited through
         TaskEditSidebar.
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
         
         Used for editing an existing task.
         The main Kanban page remains interactive.
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

                :owners="ownersWithoutAll"

                @update="updateOwners"

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
    ref
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

    deleteProject

} = useProjects()


/* ==============================================
   Tasks
============================================== */

const {

    editingTask,

    saveTask,

    deleteTask,

    toggleChecklist

} = useTasks()


/* ==============================================
   Templates
============================================== */

const {

    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createTaskFromTemplate
} = useTemplates()


/* ==============================================
   Owners
============================================== */

const owners = ref([

    "全部",

    "Kevin",

    "Dongsheng",

    "Gary",

    "Sung",

    "Knox"

])


const ownersWithoutAll = computed(() => {

    return owners.value.filter(

        item =>
            item !== "全部"

    )

})


function updateOwners(list) {

    owners.value = [

        "全部",

        ...list

    ]

}


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


function saveProject(project) {

    if (project.id) {

        updateProject(project)

    }
    else {

        createProject(project)

    }


    showProjectModal.value = false

}


/* ==============================================
   Task Create Modal
============================================== */

const showTaskModal =
    ref(false)


function openCreateTask() {

    /*
     * Creating a task always uses the
     * original TaskModal.
     */

    editingTask.value = null

    showTaskModal.value = true

}


/* ==============================================
   Task Edit Sidebar
============================================== */

const showTaskSidebar =
    ref(false)


function openEditTask(task) {

    /*
     * Keep the original task reference.
     *
     * TaskEditSidebar is responsible for
     * displaying and editing the task fields.
     */

    editingTask.value = task

    showTaskSidebar.value = true

}


function closeTaskSidebar() {

    showTaskSidebar.value = false

}


/* ==============================================
   Task Save
============================================== */

function saveTaskHandler(task) {

    const success = saveTask(

        task,

        selectedProject.value

    )


    if (!success) {

        return

    }


    /*
     * Refresh project state so the Kanban
     * immediately reflects the changes.
     */

    updateProject(

        selectedProject.value

    )


    /*
     * Close whichever editor is currently open.
     */

    showTaskModal.value = false

    showTaskSidebar.value = false

}


/* ==============================================
   Task Delete
============================================== */

function deleteTaskHandler(task) {

    deleteTask(

        task,

        selectedProject.value

    )


    updateProject(

        selectedProject.value

    )


    /*
     * If the deleted task happened to be
     * opened in the sidebar, close it.
     */

    if (

        editingTask.value?.id ===
        task?.id

    ) {

        editingTask.value = null

        showTaskSidebar.value = false

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

    detailTask.value = task

    showTaskDetail.value = true

}


/* ==============================================
   Template
============================================== */

const showTemplateModal =
    ref(false)


function useTemplateHandler(template) {

    if (
        !template ||
        !selectedProject.value
    ) {
        return
    }


    /*
     * 1. Create a new Task object
     *    from the selected template.
     */
    const task =
        createTaskFromTemplate(
            template
        )


    if (!task) {
        return
    }


    /*
     * 2. Save the generated Task
     *    into the current Project.
     */
    const success =
        saveTask(
            task,
            selectedProject.value
        )


    if (!success) {
        return
    }


    /*
     * 3. Refresh Project state
     *    and persist the change.
     */
    updateProject(
        selectedProject.value
    )


    /*
     * 4. Close Template Manager.
     */
    showTemplateModal.value = false

}function createTemplateHandler(template) {
    createTemplate(template)
}
function updateTemplateHandler(template) {

    updateTemplate(template)

}
function deleteTemplateHandler(template) {

    deleteTemplate(template)

}

/* ==============================================
   Owner
============================================== */

const showOwnerModal =
    ref(false)

</script>