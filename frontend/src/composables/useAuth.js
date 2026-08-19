import {
    ref
} from "vue"


const authenticated = ref(false)

const username = ref(null)

const initialized = ref(false)


let checkingAuth = null


async function checkAuth() {

    if (checkingAuth) {

        return checkingAuth
    }


    checkingAuth = (
        async () => {

            try {

                const response =
                    await fetch(
                        "/api/auth/me",
                        {
                            method: "GET",
                            credentials: "include"
                        }
                    )


                if (
                    !response.ok
                ) {

                    authenticated.value =
                        false

                    username.value =
                        null

                    return false
                }


                const data =
                    await response.json()


                authenticated.value =
                    data.authenticated === true

                username.value =
                    data.username ?? null


                return authenticated.value

            } catch {

                authenticated.value =
                    false

                username.value =
                    null

                return false

            } finally {

                initialized.value =
                    true

            }

        }
    )()


    try {

        return await checkingAuth

    } finally {

        checkingAuth = null

    }
}


async function login(
    usernameValue,
    passwordValue
) {

    const response =
        await fetch(
            "/api/auth/login",
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    username:
                        usernameValue,
                    password:
                        passwordValue
                })
            }
        )


    if (
        !response.ok
    ) {

        const error =
            new Error(
                "Login failed"
            )

        error.status =
            response.status

        throw error
    }


    const data =
        await response.json()


    authenticated.value =
        data.authenticated === true

    username.value =
        data.username ?? null

    initialized.value =
        true


    return data
}


async function logout() {

    try {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST",
                credentials: "include"
            }
        )

    } finally {

        authenticated.value =
            false

        username.value =
            null

        initialized.value =
            true

    }
}


function useAuth() {

    return {

        authenticated,

        username,

        initialized,

        checkAuth,

        login,

        logout

    }

}


export {
    useAuth
}
