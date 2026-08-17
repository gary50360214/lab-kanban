<template>

<div class="modal-overlay">


    <div class="task-modal template-modal">


        <div class="modal-header">


            <h2>

                {{ isEdit ? "編輯 Template" : "新增 Template" }}

            </h2>


            <button

                class="close-button"

                @click="$emit('close')"

            >

                ✕

            </button>


        </div>








        <div class="modal-body">


            <label>

                Template 名稱

            </label>


            <input

                v-model="form.name"

                placeholder="例如 AI Server Bring-up"

            />






            <label>

                Template 說明

            </label>


            <textarea

                v-model="form.description"

                placeholder="描述此流程用途"

            ></textarea>








            <div class="template-task-header">


                <h3>

                    Tasks

                </h3>



                <button

                    class="primary-button"

                    @click="addTask"

                >

                    + 新增 Task

                </button>


            </div>









            <div

                v-for="task in form.tasks"

                :key="task.id"

                class="template-task-editor"

            >




                <div class="template-task-title">


                    <h4>

                        {{task.name || "New Task"}}

                    </h4>



                    <button

                        class="delete-btn"

                        @click="removeTask(task.id)"

                    >

                        🗑

                    </button>


                </div>








                <label>

                    Task Name

                </label>


                <input

                    v-model="task.name"

                    placeholder="Task Name"

                />








                <div class="date-row">


                    <div>


                        <label>

                            Owner

                        </label>


<select

    v-model="task.owner"

>


    <option value="">

        未指定

    </option>



    <option

        v-for="owner in owners"

        :key="owner"

        :value="owner"

    >

        {{owner}}

    </option>


</select>

                    </div>





                    <div>


                        <label>

                            Priority

                        </label>


                        <select

                            v-model="task.priority"

                        >


                            <option>

                                不緊急也不重要

                            </option>


                            <option>

                                不緊急但重要

                            </option>


                            <option>

                                緊急但不重要

                            </option>


                            <option>

                                緊急且重要

                            </option>


                        </select>


                    </div>


                </div>









                <div class="date-row">


                    <div>


                        <label>

                            Status

                        </label>


                        <select

                            v-model="task.status"

                        >


                            <option value="todo">

                                TO DO

                            </option>


                            <option value="running">

                                RUNNING

                            </option>


                            <option value="waiting">

                                WAITING

                            </option>


                            <option value="completed">

                                COMPLETED

                            </option>


                        </select>


                    </div>




                    <div>


                        <label>

                            Start

                        </label>


                        <input

                            type="date"

                            v-model="task.start"

                        />


                    </div>



                    <div>


                        <label>

                            End

                        </label>


                        <input

                            type="date"

                            v-model="task.end"

                        />


                    </div>



                </div>









                <label>

                    Description

                </label>


                <textarea

                    v-model="task.description"

                ></textarea>









                <div class="checklist-editor">


                    <div class="checklist-title">


                        <h4>

                            Checklist

                        </h4>


                    </div>





                    <div

                        v-for="item in task.checklist"

                        :key="item.id"

                        class="checklist-row"

                    >


                        <span>

                            {{item.title}}

                        </span>



                        <button

                            @click="removeChecklist(task,item.id)"

                        >

                              

                        </button>


                    </div>







                    <div class="add-checklist">


                        <input

                            v-model="task.newChecklist"

                            placeholder="新增 Checklist"

                            @keyup.enter="addChecklist(task)"

                        />


                        <button

                            @click="addChecklist(task)"

                        >

                            +

                        </button>


                    </div>



                </div>







            </div>





        </div>








        <div class="modal-buttons">


            <button

                class="cancel-button"

                @click="$emit('close')"

            >

                取消

            </button>




            <button

                class="save-button"

                @click="save"

            >

                儲存 Template

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


    template:{


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








const emptyTask=()=>({


    id:Date.now()+Math.random(),


    name:"",


    owner:"",


    priority:"緊急且重要",


    status:"todo",


    start:"",


    end:"",


    description:"",


    checklist:[],


    newChecklist:""


})








const form=reactive({


    id:null,


    name:"",


    description:"",


    tasks:[]


})








const isEdit=computed(()=>!!props.template)








watch(

    ()=>props.template,


    value=>{


        if(value){


            Object.assign(

                form,

                JSON.parse(

                    JSON.stringify(value)

                )

            )


        }

        else{


            form.id=null

            form.name=""

            form.description=""

            form.tasks=[]


        }



    },

    {

        immediate:true

    }

)








function addTask(){


    form.tasks.push(

        emptyTask()

    )


}








function removeTask(id){


    form.tasks=

    form.tasks.filter(

        item=>item.id!==id

    )


}








function addChecklist(task){


    if(!task.newChecklist?.trim()){

        return

    }



    task.checklist.push({


        id:Date.now(),


        title:task.newChecklist,


        completed:false


    })



    task.newChecklist=""



}








function removeChecklist(task,id){


    task.checklist=

    task.checklist.filter(

        item=>item.id!==id

    )


}








function save(){


    if(!form.name.trim()){


        alert(

            "請輸入 Template 名稱"

        )

        return

    }



    emit(

        "save",

        {

            ...form,

            tasks:

            form.tasks.map(task=>{


                const {

                    newChecklist,

                    ...data

                }=task


                return data


            })

        }

    )


}


</script>