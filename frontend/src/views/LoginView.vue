<template>

<main class="login-page">

    <section class="login-card">

        <div class="login-brand">

            <h1>
                ND2A33 Lab Center
            </h1>

            <p>
                Sign in to continue
            </p>

        </div>


        <form
            class="login-form"
            @submit.prevent="handleLogin"
        >

            <div class="login-field">

                <label for="username">
                    Username
                </label>

                <input
                    id="username"
                    v-model="username"
                    type="text"
                    autocomplete="username"
                    required
                    maxlength="128"
                    :disabled="loading"
                />

            </div>


            <div class="login-field">

                <label for="password">
                    Password
                </label>

                <input
                    id="password"
                    v-model="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    maxlength="256"
                    :disabled="loading"
                />

            </div>


            <p
                v-if="errorMessage"
                class="login-error"
                role="alert"
            >
                {{ errorMessage }}
            </p>


            <button
                class="login-button"
                type="submit"
                :disabled="loading"
            >

                <span v-if="!loading">
                    Sign in
                </span>

                <span v-else>
                    Signing in...
                </span>

            </button>

        </form>


        <router-link
            class="login-back"
            to="/"
        >
            ← Back to Lab Center
        </router-link>

    </section>

</main>
</template>


<script setup>

import {
    ref
} from "vue"

import {
    useRoute,
    useRouter
} from "vue-router"

import {
    useAuth
} from "../composables/useAuth.js"


const router = useRouter()

const route = useRoute()

const {
    login
} = useAuth()


const username = ref("")

const password = ref("")

const loading = ref(false)

const errorMessage = ref("")


function getSafeRedirect() {

    const redirect = route.query.redirect

    if (
        typeof redirect === "string"
        &&
        redirect.startsWith("/")
        &&
        !redirect.startsWith("//")
    ) {

        return redirect
    }

    return "/"
}


async function handleLogin() {

    errorMessage.value = ""

    loading.value = true

    try {

        await login(
            username.value,
            password.value
        )

        await router.replace(
            getSafeRedirect()
        )

    } catch (error) {

        if (
            error?.status === 429
        ) {

            errorMessage.value =
                "Too many login attempts. Please try again later."

        } else {

            errorMessage.value =
                "Invalid username or password."
        }

    } finally {

        loading.value = false
    }
}

</script>


<style scoped>

.login-page {

    min-height: 100vh;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 32px;

    background: var(
        --background-color,
        #f5f5f7
    );

}


.login-card {

    width: 100%;

    max-width: 420px;

    padding: 48px;

    background: #ffffff;

    border-radius: 24px;

    box-shadow:
        0 20px 60px
        rgba(0, 0, 0, 0.08);

}


.login-brand {

    text-align: center;

    margin-bottom: 36px;

}


.login-brand h1 {

    margin: 0;

    font-size: 30px;

    font-weight: 600;

    letter-spacing: -0.5px;

}


.login-brand p {

    margin: 10px 0 0;

    color: #6e6e73;

    font-size: 16px;

}


.login-form {

    display: flex;

    flex-direction: column;

    gap: 20px;

}


.login-field {

    display: flex;

    flex-direction: column;

    gap: 8px;

}


.login-field label {

    font-size: 14px;

    font-weight: 500;

    color: #1d1d1f;

}


.login-field input {

    width: 100%;

    box-sizing: border-box;

    padding: 13px 14px;

    border: 1px solid #d2d2d7;

    border-radius: 10px;

    background: #ffffff;

    color: #000000;

    font-size: 16px;

    outline: none;

    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;

}


.login-field input:focus {

    border-color: #0071e3;

    box-shadow:
        0 0 0 3px
        rgba(0, 113, 227, 0.15);

}


.login-button {

    margin-top: 4px;

    width: 100%;

    padding: 13px 16px;

    border: none;

    border-radius: 10px;

    background: #0071e3;

    color: #ffffff;

    font-size: 16px;

    font-weight: 500;

    cursor: pointer;

    transition:
        opacity 0.2s ease,
        transform 0.1s ease;

}


.login-button:hover:not(:disabled) {

    opacity: 0.9;

}


.login-button:active:not(:disabled) {

    transform: scale(0.99);

}


.login-button:disabled {

    opacity: 0.55;

    cursor: not-allowed;

}


.login-error {

    margin: -4px 0 0;

    color: #d70015;

    font-size: 14px;

    line-height: 1.5;

}


.login-back {

    display: block;

    margin-top: 28px;

    text-align: center;

    color: #6e6e73;

    font-size: 14px;

    text-decoration: none;

}


.login-back:hover {

    color: #1d1d1f;

}


@media (max-width: 520px) {

    .login-page {

        padding: 20px;

    }


    .login-card {

        padding: 32px 24px;

        border-radius: 20px;

    }


    .login-brand h1 {

        font-size: 26px;

    }

}

</style>
