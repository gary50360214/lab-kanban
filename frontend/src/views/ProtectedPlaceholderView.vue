<template>

<main class="placeholder-page">

    <section class="placeholder-content">

        <p class="placeholder-eyebrow">
            ND2A33 Lab Center
        </p>

        <h1>
            {{ title }}
        </h1>

        <p>
            This section is currently under development.
        </p>

        <router-link
            class="placeholder-button"
            to="/"
        >
            Back to Lab Center
        </router-link>

    </section>

</main>

</template>


<script setup>

import {
    computed
} from "vue"

import {
    useRoute
} from "vue-router"


const route = useRoute()


const title = computed(
    () => {

        if (
            route.path === "/labs"
        ) {

            return "Labs"
        }

        return "Tools"

    }
)

</script>


<style scoped>

.placeholder-page {

    min-height: 100vh;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 32px;

}


.placeholder-content {

    text-align: center;

    max-width: 560px;

}


.placeholder-eyebrow {

    margin-bottom: 12px;

    color: #6e6e73;

    font-size: 14px;

}


.placeholder-content h1 {

    margin: 0;

    font-size: 42px;

    letter-spacing: -1px;

}


.placeholder-content > p:not(
    .placeholder-eyebrow
) {

    margin:
        16px 0 28px;

    color: #6e6e73;

}


.placeholder-button {

    display: inline-block;

    padding:
        12px 20px;

    border-radius: 10px;

    background: #0071e3;

    color: #ffffff;

    text-decoration: none;

}

</style>
