<template>

<div>


    <!-- Header -->

    <div class="modal-header">


        <h2>

            管理負責人

        </h2>



        <button

            class="close-button"

            @click="$emit('close')"

        >

            ✕


        </button>


    </div>









    <!-- Body -->


    <div class="modal-body">



        <div class="member-list">



            <div

                v-for="owner in localOwners"

                :key="owner"

                class="member-item"

            >



                <span>

                    {{ owner }}

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









    <!-- Footer -->


    <div class="modal-buttons">



        <button

            class="cancel-button"

            @click="close"

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

</template>









<script setup>


import {

    ref,

    watch

} from "vue"








const props = defineProps({



    owners:{


        type:Array,


        default:()=>[]

    }



})








const emit = defineEmits([



    "update",


    "close"



])









const localOwners = ref([

    ...props.owners

])








const newOwner = ref("")









watch(

    ()=>props.owners,

    value=>{


        localOwners.value=[

            ...value

        ]


    }


)









function addOwner(){



    const name = newOwner.value.trim()



    if(!name){


        return


    }






    if(localOwners.value.includes(name)){


        return


    }






    localOwners.value.push(name)



    newOwner.value=""



}









function removeOwner(owner){



    localOwners.value = localOwners.value.filter(


        item=>item!==owner


    )


}









function save(){



    emit(

        "update",

        localOwners.value

    )



    close()


}









function close(){


    emit(

        "close"

    )


}



</script>