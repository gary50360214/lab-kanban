<template>

<section class="project-selector">

    <!-- =========================================
         Header
    ========================================== -->

    <div class="project-selector-header">

        <div>

            <h1 class="project-selector-title">

                Projects

            </h1>

            <p class="project-selector-subtitle">

                Select a workspace to manage team tasks

            </p>

        </div>


        <button
            type="button"
            class="btn btn-primary"
            @click="$emit('create')"
        >

            ＋ New Project

        </button>

    </div>


    <!-- =========================================
         Project Navigation
    ========================================== -->

    <nav
        class="project-list"
        aria-label="Projects"
    >

        <button
            v-for="project in projects"
            :key="project.id"
            type="button"
            class="project-item"
            :class="{
                active:
                    selectedProject?.id === project.id
            }"
            @click="$emit('select', project)"
        >

            <span class="project-item-name">

                {{ project.name }}

            </span>


            <!-- Delete -->

            <span
                v-if="projects.length > 1"
                class="project-delete"
                role="button"
                tabindex="0"
                aria-label="Delete project"
                @click.stop="deleteProject(project)"
                @keydown.enter.stop="deleteProject(project)"
                @keydown.space.prevent.stop="deleteProject(project)"
            >

                ×

            </span>

        </button>

    </nav>

</section>

</template>


<script setup>

defineProps({

    projects: {

        type: Array,

        default: () => []

    },


    selectedProject: {

        type: Object,

        default: null

    }

})


const emit = defineEmits([

    "select",

    "create",

    "edit",

    "delete"

])


function deleteProject(project) {

    if (!project) {

        return

    }


    /*
     * Do not delete silently.
     *
     * Project deletion is destructive because
     * its tasks belong to the project.
     */

    const confirmed = window.confirm(

        `確定要刪除 Project「${project.name}」嗎？\n\n` +
        `這個 Project 裡的任務也會一起移除。`

    )


    if (!confirmed) {

        return

    }


    emit(

        "delete",

        project

    )

}

</script>