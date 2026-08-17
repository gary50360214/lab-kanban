import { createRouter, createWebHistory } from "vue-router"

import Home from "../views/HomeView.vue"
import Projects from "../views/Projects.vue"


const routes = [

    {
        path: "/",
        component: Home
    },

    {
        path: "/projects",
        component: Projects
    }

]


const router = createRouter({

    history:createWebHistory(),

    routes

})


export default router
