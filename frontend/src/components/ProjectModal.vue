<template>

<div class="modal-overlay">


    <div class="project-modal">


        <div class="modal-header">


            <h2>

                {{ isEdit ? "編輯專案" : "新增專案" }}

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

                專案名稱

            </label>



            <input

                v-model="form.name"

                placeholder="輸入專案名稱"

            />



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

                儲存

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


    project:{


        type:Object,

        default:null


    }


})








const emit = defineEmits([

    "save",

    "close",

    "delete"

])










const form = reactive({


    id:null,


    name:""



})









const isEdit = computed(()=>{


    return !!props.project


})









watch(

    ()=>props.project,


    (value)=>{


        if(value){


            form.id=value.id

            form.name=value.name


        }

        else{


            form.id=null

            form.name=""


        }


    },


    {
        immediate:true
    }

)









function save(){



    if(!form.name.trim()){


        alert(

            "請輸入專案名稱"

        )


        return


    }





    emit(

        "save",

        {


            id:form.id,


            name:form.name,


            tasks:props.project?.tasks || []


        }


    )


}



</script>
