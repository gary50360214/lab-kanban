import {
    ref
} from "vue"


/*
|--------------------------------------------------------------------------
| Default Templates
|--------------------------------------------------------------------------
|
| Keep the initial data small and predictable.
| Templates can be created, edited and deleted later.
|
*/

const DEFAULT_TEMPLATES = [

    {
        id: 1,

        name: "Server Firmware Update",

        owner: "",

        status: "todo",

        priority: "不緊急但重要",

        start: "",

        end: "",

        description:
            "Update BIOS / BMC / NIC / GPU firmware and verify system status.",

        

        checklist: [

            {
                id: "default-fw-1",

                text: "Confirm current firmware versions",

                completed: false

            },

            {
                id: "default-fw-2",

                text: "Update firmware",

                completed: false

            },

            {
                id: "default-fw-3",

                text: "Verify system status",

                completed: false

            }

        ]

    }

]
const STORAGE_KEY =
    "nd2a33_templates"

/*
|--------------------------------------------------------------------------
| Deep Clone
|--------------------------------------------------------------------------
*/

function clone(value) {

    return JSON.parse(

        JSON.stringify(value)

    )

}


/*
|--------------------------------------------------------------------------
| Load Templates
|--------------------------------------------------------------------------
*/

function loadTemplates(
    fallback = DEFAULT_TEMPLATES
) {

    const raw =
        localStorage.getItem(
            STORAGE_KEY
        )


    if (!raw) {

        return clone(fallback)

    }


    try {

        const data =
            JSON.parse(raw)


        if (!Array.isArray(data)) {

            return clone(fallback)

        }


        return data

    }
    catch (error) {

        console.error(
            "Failed to load templates:",
            error
        )


        return clone(fallback)

    }

}
/*
|--------------------------------------------------------------------------
| Save Templates
|--------------------------------------------------------------------------
*/

function saveTemplates(
    templates
) {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(
            templates
        )

    )

}
/*
|--------------------------------------------------------------------------
| Normalize Status
|--------------------------------------------------------------------------
*/

function normalizeStatus(status) {

    if (!status) {

        return "todo"

    }


    const value = String(status)
        .trim()
        .toLowerCase()


    const map = {

        "todo":
            "todo",

        "to do":
            "todo",

        "to_do":
            "todo",


        "running":
            "running",

        "run":
            "running",

        "in progress":
            "running",

        "in_progress":
            "running",


        "waiting":
            "waiting",

        "wait":
            "waiting",


        "completed":
            "completed",

        "complete":
            "completed",

        "done":
            "completed"

    }


    return map[value] || "todo"

}


/*
|--------------------------------------------------------------------------
| Normalize Template
|--------------------------------------------------------------------------
*/

function normalizeTemplate(template = {}) {

    return {

        id:
            template.id ?? null,

        name:
            template.name ?? "",

        owner:
            template.owner ?? "",

        status:
            normalizeStatus(
                template.status
            ),

        priority:
            template.priority ??
            "不緊急也不重要",

        start:
            template.start ?? "",

        end:
            template.end ?? "",

        description:
            template.description ?? "",

        checklist:
            Array.isArray(
                template.checklist
            )

                ? template.checklist.map(

                    (item, index) => ({

                        id:
                            item.id ??
                            `check-${Date.now()}-${index}`,

                        text:
                            item.text ?? "",

                        completed:
                            Boolean(
                                item.completed
                            )

                    })

                )

                : []

    }

}


/*
|--------------------------------------------------------------------------
| useTemplates
|--------------------------------------------------------------------------
*/

export function useTemplates(
    initialTemplates = DEFAULT_TEMPLATES
) {


    const templates = ref(

        loadTemplates(initialTemplates)
        .map(normalizeTemplate)
    )


    /*
    |--------------------------------------------------------------------------
    | Create Template
    |--------------------------------------------------------------------------
    */

    function createTemplate(template) {

        const data =
            normalizeTemplate(template)


        data.id =
            Date.now()


        templates.value.push(

            data

        )
saveTemplates(
    templates.value
)

        return data

    }


    /*
    |--------------------------------------------------------------------------
    | Update Template
    |--------------------------------------------------------------------------
    */

    function updateTemplate(template) {

        if (!template?.id) {

            return false

        }


        const index =
            templates.value.findIndex(

                item =>
                    item.id === template.id

            )


        if (index === -1) {

            return false

        }


        const data =
            normalizeTemplate(template)


        data.id =
            template.id


        templates.value[index] =
            data
saveTemplates(
    templates.value
)

        return data

    }


    /*
    |--------------------------------------------------------------------------
    | Delete Template
    |--------------------------------------------------------------------------
    */

    function deleteTemplate(template) {

        const id =
            typeof template === "object"

                ? template?.id

                : template


        if (!id) {

            return false

        }


        const index =
            templates.value.findIndex(

                item =>
                    item.id === id

            )


        if (index === -1) {

            return false

        }


        templates.value.splice(

            index,

            1

        )
saveTemplates(
    templates.value
)

        return true

    }


    /*
    |--------------------------------------------------------------------------
    | Get Template
    |--------------------------------------------------------------------------
    */

    function getTemplate(id) {

        const template =
            templates.value.find(

                item =>
                    item.id === id

            )


        if (!template) {

            return null

        }


        return clone(template)

    }


    /*
    |--------------------------------------------------------------------------
    | Create Task From Template
    |--------------------------------------------------------------------------
    */

    function createTaskFromTemplate(
        template
    ) {

        if (!template) {

            return null

        }


        const data =
            normalizeTemplate(template)


        /*
         * A template should NEVER reuse
         * the template's checklist object.
         */

        return {

            id: null,

            name:
                data.name,

            owner:
                data.owner,

            status:
                data.status,

            priority:
                data.priority,

            start:
                data.start,

            end:
                data.end,

            description:
                data.description,

            checklist:
                data.checklist.map(

                    item => ({

                        id:
                            `task-check-${Date.now()}-${Math.random()
                                .toString(36)
                                .slice(2, 8)}`,

                        text:
                            item.text,

                        /*
                         * New tasks start with
                         * unchecked checklist items.
                         */

                        completed:
                            false

                    })

                )

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Create Empty Template
    |--------------------------------------------------------------------------
    */

    function createEmptyTemplate() {

        return {

            id: null,

            name: "",

            owner: "",

            status: "todo",

            priority: "不緊急也不重要",

            start: "",

            end: "",

            description: "",

            checklist: []

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Public API
    |--------------------------------------------------------------------------
    */

    return {

        templates,

        createTemplate,

        updateTemplate,

        deleteTemplate,

        getTemplate,

        createTaskFromTemplate,

        createEmptyTemplate

    }

}