<template>

<div
    v-if="task.checklist?.length"
    class="task-checklist-preview"
>


    <div class="checklist-header">


        <span>
            Checklist
        </span>


        <span>

            {{ completedCount }}

            /

            {{ task.checklist.length }}

        </span>


    </div>





    <div

        v-for="item in visibleItems"

        :key="item.id"

        class="check-item"

        :class="{
            done:item.completed
        }"

        @click.stop="toggle(item)"

    >



        <button

            class="check-button"

            :class="{
                checked:item.completed
            }"

        >

            {{ item.completed ? "✓" : "" }}

        </button>





        <span>

            {{ item.title }}

        </span>



    </div>





    <div

        v-if="task.checklist.length > limit"

        class="more-check"

    >

        +{{ task.checklist.length - limit }} more


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

    },


    limit:{


        type:Number,


        default:3


    }


})







const emit = defineEmits([

    "toggle"

])







const visibleItems = computed(()=>{


    return props.task.checklist?.slice(

        0,

        props.limit

    ) || []


})








const completedCount = computed(()=>{


    if(!props.task.checklist){

        return 0

    }




    return props.task.checklist.filter(

        item=>item.completed

    ).length


})








function toggle(item){


    emit(

        "toggle",

        item

    )


}



</script>
