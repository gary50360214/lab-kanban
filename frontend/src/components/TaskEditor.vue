<template>

<div class="task-editor">


    <!-- Header -->

    <header class="project-modal-header">


        <h2>

            {{ isEdit ? "Edit Task" : "New Task" }}

        </h2>



        <button

            class="project-modal-close"

            @click="close"

        >

            ×

        </button>


    </header>









    <div class="project-modal-body">





        <!-- Task Name -->


        <div class="project-form-group">


            <label>

                Task Name

            </label>



            <input

                v-model="form.title"

                placeholder="Enter task name"

            />


        </div>









        <!-- Owner -->


        <div class="project-form-group">


            <label>

                Owner

            </label>



            <select

                v-model="form.owner"

            >

                <option

                    v-for="owner in owners"

                    :key="owner"

                >

                    {{ owner }}

                </option>


            </select>


        </div>









        <!-- Status -->


        <div class="project-form-group">


            <label>

                Status

            </label>



            <select

                v-model="form.status"

            >

                <option value="TODO">

                    TO DO

                </option>


                <option value="RUNNING">

                    RUNNING

                </option>


                <option value="WAITING">

                    WAITING

                </option>


                <option value="COMPLETED">

                    COMPLETED

                </option>


            </select>


        </div>









        <!-- Priority -->


        <div class="project-form-group">


            <label>

                Priority

            </label>



            <select

                v-model="form.priority"

            >


                <option value="urgent-important">

                    緊急且重要

                </option>


                <option value="urgent-not-important">

                    緊急但不重要

                </option>


                <option value="not-urgent-important">

                    不緊急但重要

                </option>


                <option value="not-urgent-not-important">

                    不緊急也不重要

                </option>


            </select>


        </div>









        <!-- Date -->


        <div class="task-date-row">


            <div class="project-form-group">


                <label>

                    Start Date

                </label>


                <input

                    type="date"

                    v-model="form.startDate"

                />


            </div>





            <div class="project-form-group">


                <label>

                    End Date

                </label>


                <input

                    type="date"

                    v-model="form.endDate"

                />


            </div>



        </div>









        <!-- Description -->


        <div class="project-form-group">


            <label>

                Description

            </label>



            <textarea

                rows="4"

                v-model="form.description"

                placeholder="Task details"

            />


        </div>









        <!-- Checklist -->


        <div class="checklist-editor">


            <label>

                Checklist

            </label>




            <div

                v-for="(item,index) in form.checklist"

                :key="index"

                class="check-item"


            >


                <input

                    type="checkbox"

                    v-model="item.done"

                />



                <input

                    v-model="item.text"

                    placeholder="Checklist item"

                />



                <button

                    @click="removeChecklist(index)"

                >

                    ×

                </button>



            </div>





            <button

                class="add-check"

                @click="addChecklist"

            >

                + Add Checklist

            </button>



        </div>









        <!-- Progress -->


        <div class="task-progress-editor">


            <label>

                Progress {{ form.progress }}%

            </label>



            <input

                type="range"

                min="0"

                max="100"

                v-model="form.progress"

        <!-- Actions -->


        <div class="project-modal-actions">


            <button

                class="project-modal-secondary"

                @click="close"

            >

                Cancel

            </button>





            <button

                class="project-modal-primary"

                @click="save"

            >

                Save Task

            </button>



        </div>




    </div>



</div>

</template>









<script setup>


import {

    reactive,

    computed,

    watch

} from "vue"









const props = defineProps({



    task:{


        type:Object,


        default:null


    },



    owners:{


        type:Array,


        default:()=>[]

    }



})








const emit = defineEmits([



    "save",


    "close"



])








const isEdit = computed(()=>!!props.task)









const defaultTask = ()=>({



    title:"",


    owner:"",


    status:"TODO",


    priority:"urgent-important",


    startDate:"",


    endDate:"",


    description:"",


    checklist:[],


    progress:0



})









const form = reactive(defaultTask())








watch(

    ()=>props.task,

    value=>{


        Object.assign(

            form,

            defaultTask(),

            value || {}

        )


    },


    {

        immediate:true

    }

)









function addChecklist(){


    form.checklist.push({


        text:"",


        done:false


    })


}








function removeChecklist(index){


    form.checklist.splice(

        index,

        1

    )


}








function save(){


    emit(

        "save",

        {

            ...form,

            id:props.task?.id || Date.now()

        }

    )


}








function close(){


    emit(

        "close"

    )


}



</script>
