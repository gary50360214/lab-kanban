<template>

<div class="task-progress">

    <div class="progress-bar">

        <div
            class="progress"
            :style="{
                width: progress + '%'
            }"
        ></div>

    </div>

</div>

</template>



<script setup>


import {
    computed
} from "vue"





const props = defineProps({

    task:{
        type:Object,
        required:true
    }

})






const progress = computed(()=>{


    if(!props.task.checklist?.length){

        return 0

    }




    const completed = props.task.checklist.filter(

        item=>item.completed

    ).length




    return Math.round(

        completed /

        props.task.checklist.length *

        100

    )


})



</script>
