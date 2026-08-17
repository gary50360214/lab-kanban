<template>

    <div class="date-input-wrapper">

        <input
            ref="inputRef"
            :id="id"
            :value="modelValue"
            type="date"
            :disabled="disabled"
            :required="required"
            @input="handleInput"
            @click="openPicker"
        />

    </div>

</template>


<script setup>

import {
    ref
} from "vue"


/* ==============================================
   Props
============================================== */

defineProps({

    modelValue: {

        type: String,

        default: ""

    },


    id: {

        type: String,

        default: ""

    },


    disabled: {

        type: Boolean,

        default: false

    },


    required: {

        type: Boolean,

        default: false

    }

})


/* ==============================================
   Emits
============================================== */

const emit =
    defineEmits([
        "update:modelValue"
    ])


/* ==============================================
   State
============================================== */

const inputRef =
    ref(null)


/* ==============================================
   Input
============================================== */

function handleInput(event) {

    emit(
        "update:modelValue",
        event.target.value
    )

}


/* ==============================================
   Date Picker
============================================== */

function openPicker() {

    console.log("DateInput clicked")
    console.log("inputRef:", inputRef.value)

    if (
        !inputRef.value ||
        inputRef.value.disabled
    ) {
        return
    }

    if (
        typeof inputRef.value.showPicker ===
        "function"
    ) {

        console.log("showPicker exists")

        try {

            inputRef.value.showPicker()

            console.log("showPicker called")

        }
        catch (error) {

            console.error(
                "showPicker failed:",
                error
            )

        }

    } else {

        console.log("showPicker NOT supported")

    }

}
</script>
