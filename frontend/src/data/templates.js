export const defaultTemplates = [


    {
        id:1,

        name:"AI Server Bring-up",


        tasks:[


            {

                id:1,

                name:"Update BIOS",


                checklist:[


                    {
                        id:101,

                        title:"Check BIOS Version",

                        completed:false

                    },


                    {
                        id:102,

                        title:"Backup BIOS Setting",

                        completed:false

                    },


                    {
                        id:103,

                        title:"Flash BIOS",

                        completed:false

                    },


                    {
                        id:104,

                        title:"Verify BIOS Version",

                        completed:false

                    }


                ]

            },







            {

                id:2,

                name:"Update BMC",


                checklist:[


                    {
                        id:201,

                        title:"Check BMC IP",

                        completed:false

                    },


                    {
                        id:202,

                        title:"Update BMC Firmware",

                        completed:false

                    },


                    {
                        id:203,

                        title:"Verify Redfish",

                        completed:false

                    }


                ]

            },








            {

                id:3,

                name:"Install Ubuntu",


                checklist:[


                    {
                        id:301,

                        title:"Install Ubuntu 22.04",

                        completed:false

                    },


                    {
                        id:302,

                        title:"Install Driver",

                        completed:false

                    },


                    {
                        id:303,

                        title:"Verify Device",

                        completed:false

                    }


                ]

            },








            {

                id:4,

                name:"Stress Test",


                checklist:[


                    {
                        id:401,

                        title:"Run stressapptest",

                        completed:false

                    },


                    {
                        id:402,

                        title:"Run fio Test",

                        completed:false

                    },


                    {
                        id:403,

                        title:"Collect Log",

                        completed:false

                    }


                ]

            }




        ]

    }



]
