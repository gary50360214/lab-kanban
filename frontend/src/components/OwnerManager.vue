```vue
<template>

    <div>

        <!-- Header -->

        <div class="modal-header">

            <h2>
                管理負責人
            </h2>


            <button
                class="close-button"
                @click="close"
            >
                ✕
            </button>

        </div>


        <!-- Body -->

        <div class="modal-body">

            <div class="member-list">

                <div
                    v-for="owner in localOwners"
                    :key="owner.id"
                    class="member-item"
                >

                    <span>
                        {{ owner.name }}
                    </span>


                    <button
                        class="delete-button"
                        @click="removeOwner(owner)"
                    >
                        刪除
                    </button>

                </div>

            </div>


            <div class="owner-add">

                <input
                    v-model="newOwner"
                    placeholder="輸入新負責人"
                    @keyup.enter="addOwner"
                />


                <button
                    class="secondary-button"
                    @click="addOwner"
                >
                    新增
                </button>

            </div>

        </div>

    </div>

</template>


<script setup>

import {
    ref,
    watch,
    onMounted
} from "vue"


/* ==============================================
   Props
============================================== */

const props = defineProps({

    owners: {

        type: Array,

        default: () => []

    }

})


/* ==============================================
   Events
============================================== */

const emit = defineEmits([

    "update",

    "close"

])


/* ==============================================
   Local State
============================================== */

const localOwners =
    ref([])

const newOwner =
    ref("")


/* ==============================================
   Load Owners
============================================== */

async function loadOwners() {

    try {

        const response =
            await fetch("/api/owners")


        if (!response.ok) {

            throw new Error(
                `Failed to load owners: ${response.status}`
            )

        }


        const owners =
            await response.json()


        localOwners.value =
            Array.isArray(owners)
                ? owners
                : []

    }
    catch (error) {

        console.error(
            "Failed to load owners:",
            error
        )

    }

}


/* ==============================================
   Add Owner
============================================== */

async function addOwner() {

    const name =
        newOwner.value.trim()


    if (!name) {

        return

    }


    const exists =
        localOwners.value.some(
            owner =>
                owner.name === name
        )


    if (exists) {

        window.alert(
            "此負責人已存在"
        )

        return

    }


    try {

        const response =
            await fetch(
                "/api/owners",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            name
                        })
                }
            )


        if (!response.ok) {

            const error =
                await response.json()


            throw new Error(
                error.detail ||
                `Failed to create owner: ${response.status}`
            )

        }


        newOwner.value = ""


        /*
         * API is the source of truth.
         * Reload instead of manually maintaining
         * another copy of the owner list.
         */
        await loadOwners()


        emit(
            "update"
        )

    }
    catch (error) {

        console.error(
            "Failed to create owner:",
            error
        )


        window.alert(
            error.message ||
            "新增負責人失敗"
        )

    }

}


/* ==============================================
   Remove Owner
============================================== */

async function removeOwner(owner) {

    if (!owner?.id) {

        return

    }


    try {

        const response =
            await fetch(
                `/api/owners/${owner.id}`,
                {
                    method: "DELETE"
                }
            )


        if (!response.ok) {

            const error =
                await response.json()


            throw new Error(
                error.detail ||
                `Failed to delete owner: ${response.status}`
            )

        }


        /*
         * Reload from API.
         */
        await loadOwners()


        /*
         * Tell parent that the owner list
         * has changed.
         */
        emit(
            "update"
        )

    }
    catch (error) {

        console.error(
            "Failed to delete owner:",
            error
        )


        window.alert(
            error.message ||
            "刪除負責人失敗"
        )

    }

}


/* ==============================================
   Save
============================================== */

/*
 * Owner creation/deletion is already persisted
 * immediately through the API.
 *
 * Save therefore only means:
 * "finish editing this modal".
 */
function save() {

    emit(
        "update"
    )

    close()

}


/* ==============================================
   Close
============================================== */

function close() {

    emit(
        "close"
    )

}


/* ==============================================
   Parent Owner Sync
============================================== */

watch(

    () => props.owners,

    value => {

        if (!Array.isArray(value)) {

            localOwners.value = []

            return

        }


        /*
         * Parent receives API owner objects.
         *
         * Clone them so OwnerManager does not
         * directly mutate parent's state.
         */
        localOwners.value =
            value.map(
                owner => ({
                    id: owner.id,
                    name: owner.name
                })
            )

    },

    {
        immediate: true,
        deep: true
    }

)


/* ==============================================
   Mounted
============================================== */

onMounted(() => {

    loadOwners()

})

</script>
```
