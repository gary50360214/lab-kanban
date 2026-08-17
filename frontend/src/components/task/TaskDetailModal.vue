<template>

<div class="modal-overlay">


    <div class="task-modal">


        <div class="modal-header">


            <h2>

                任務詳細

            </h2>


            <button

                class="close-button"

                @click="$emit('close')"

            >

                ✕

            </button>


        </div>





        <div

            v-if="task"

            class="modal-body"

        >


            <h3>

                {{ task.name }}

            </h3>





            <div class="task-meta">


                <div>

                    👤 負責人：

                    {{ task.owner || "未指定" }}

                </div>


                <div>

                    ⭐ 優先度：

                    {{ task.priority }}

                </div>


                <div>

                    📌 狀態：

                    {{ statusText(task.status) }}

                </div>


                <div>

                    📅 日期：

                    {{ task.start }}

                    ~

                    {{ task.end }}

                </div>


            </div>







            <div

                v-if="task.description"

                class="task-description"

            >

                {{ task.description }}

            </div>








            <div class="checklist-editor">


                <h3>

                    Checklist

                </h3>




                <div

                    v-for="item in task.checklist"

                    :key="item.id"

                    class="check-item"

                    :class="{done:item.completed}"

                >


                    <button

                        class="check-button"

                        :class="{checked:item.completed}"

                        @click="toggle(item)"

                    >

                        <span v-if="item.completed">

                            ✓

                        </span>

                    </button>



                    <span>

                        {{ item.title }}

                    </span>


                </div>



            </div>



        </div>








        <div class="modal-buttons">


            <button

                class="cancel-button"

                @click="$emit('close')"

            >

                關閉

            </button>


        </div>



    </div>


</div>


</template>








<script setup>


const props = defineProps({


    task:{


        type:Object,


        default:null


    }


})





const emit = defineEmits([


    "close",


    "toggle-checklist"


])







function toggle(item){


    emit(

        "toggle-checklist",

        props.task,

        item

    )


}







function statusText(status){


    const map={


        todo:"TO DO",


        running:"RUNNING",


        waiting:"WAITING",


        completed:"COMPLETED"


    }


    return map[status] || status


}


</script>