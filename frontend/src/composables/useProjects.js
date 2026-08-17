import {
    ref,
    watch
} from "vue"







const STORAGE_KEY = "nd2a33_projects"









const defaultProjects = [


    {
        id:1,
        name:"Remote LAB",
        tasks:[]
    },


    {
        id:2,
        name:"Remote WAB",
        tasks:[]
    },


    {
        id:3,
        name:"CRMC",
        tasks:[]
    },


    {
        id:4,
        name:"DLC LAB",
        tasks:[]
    },


    {
        id:5,
        name:"GT LAB",
        tasks:[]
    },


    {
        id:6,
        name:"MLperf",
        tasks:[]
    },


    {
        id:7,
        name:"GAIFA",
        tasks:[]
    }


]









function loadProjects(){


    const data =


        localStorage.getItem(

            STORAGE_KEY

        )






    if(data){


        return JSON.parse(data)


    }





    return JSON.parse(

        JSON.stringify(

            defaultProjects

        )

    )


}









export function useProjects(){







    const projects = ref(

        loadProjects()

    )








    const selectedProject = ref(


        projects.value[0] || null


    )












    watch(

        projects,


        value=>{


            localStorage.setItem(


                STORAGE_KEY,


                JSON.stringify(value)


            )


        },


        {

            deep:true

        }

    )












    function selectProject(project){



        selectedProject.value = project



    }












    function createProject(project){



        const newProject={


            id:Date.now(),


            name:project.name,


            tasks:[]


        }






        projects.value.push(

            newProject

        )





        selectedProject.value = newProject





        return newProject



    }













    function updateProject(project){



        const index =


            projects.value.findIndex(


                item=>

                item.id===project.id


            )








        if(index!==-1){



            projects.value[index]=project



            if(

                selectedProject.value?.id===project.id

            ){



                selectedProject.value=

                    project


            }


        }


    }












    function deleteProject(project){



        if(

            !confirm(

                `確定刪除 ${project.name}?`

            )

        ){



            return false


        }








        projects.value =


            projects.value.filter(


                item=>

                item.id!==project.id


            )









        if(

            selectedProject.value?.id===project.id

        ){


            selectedProject.value =


                projects.value[0] || null


        }





        return true


    }













    function createEmptyProject(){



        return {


            id:null,


            name:"",


            tasks:[]


        }


    }












    return {


        projects,


        selectedProject,


        selectProject,


        createProject,


        updateProject,


        deleteProject,


        createEmptyProject


    }



}