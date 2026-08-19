import {
    createRouter,
    createWebHistory
} from "vue-router"

import Home from "../views/HomeView.vue"
import Projects from "../views/Projects.vue"
import Login from "../views/LoginView.vue"


const routes = [

    {
        path: "/",
        component: Home
    },

    {
        path: "/login",
        component: Login,
        meta: {
            public: true
        }
    },

    {
        path: "/projects",
        component: Projects,
        meta: {
            requiresAuth: true
        }
    },

    {
        path: "/labs",
        component: () =>
            import("../views/ProtectedPlaceholderView.vue"),
        meta: {
            requiresAuth: true
        }
    },

    {
        path: "/tools",
        component: () =>
            import("../views/ProtectedPlaceholderView.vue"),
        meta: {
            requiresAuth: true
        }
    }

]


const router = createRouter({

    history: createWebHistory(),

    routes

})


let authModule = null


router.beforeEach(
    async (to) => {

        if (!to.meta.requiresAuth) {
            return true
        }


        if (!authModule) {

            authModule =
                await import(
                    "../composables/useAuth.js"
                )

        }


        const {
            useAuth
        } = authModule


        const {
            checkAuth
        } = useAuth()


        const isAuthenticated =
            await checkAuth()


        if (isAuthenticated) {
            return true
        }


        return {

            path: "/login",

            query: {
                redirect: to.fullPath
            }

        }

    }
)


export default router