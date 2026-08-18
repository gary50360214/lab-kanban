import {
    ref
} from "vue"


/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

export const TASK_STATUSES = [

    {
        value: "todo",
        label: "TO DO"
    },

    {
        value: "running",
        label: "RUNNING"
    },

    {
        value: "waiting",
        label: "WAITING"
    },

    {
        value: "completed",
        label: "COMPLETED"
    }

]


/*
|--------------------------------------------------------------------------
| Priorities
|--------------------------------------------------------------------------
*/

export const TASK_PRIORITIES = [

    "緊急且重要",

    "緊急但不重要",

    "不緊急但重要",

    "不緊急也不重要"

]


/*
|--------------------------------------------------------------------------
| Status Normalization
|--------------------------------------------------------------------------
*/

export function normalizeTaskStatus(status) {

    if (!status) {

        return "todo"

    }


    const value =
        String(status)
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
| Clone
|--------------------------------------------------------------------------
*/

function clone(value) {

    return JSON.parse(

        JSON.stringify(value)

    )

}


/*
|--------------------------------------------------------------------------
| Normalize Checklist
|--------------------------------------------------------------------------
*/

function normalizeChecklist(
    checklist = []
) {

    if (!Array.isArray(checklist)) {

        return []

    }


    return checklist.map(

        (item, index) => ({

            id:
                item.id ??
                `check-${Date.now()}-${index}`,

            text:
                String(
                    item.text ?? ""
                ).trim(),

            completed:
                Boolean(
                    item.completed
                )

        })

    )

}


/*
|--------------------------------------------------------------------------
| Normalize Task
|--------------------------------------------------------------------------
*/

function normalizeTask(task = {}) {

    return {

        id:
            task.id ?? null,

        name:
            String(
                task.name ?? ""
            ).trim(),

        owner:
            task.owner ?? "",

        status:
            normalizeTaskStatus(
                task.status
            ),

        priority:
            task.priority ??
            "不緊急也不重要",

        start:
            task.start ?? "",

        end:
            task.end ?? "",

        description:
            String(
                task.description ?? ""
            ).trim(),

        progress:
            Math.min(

                100,

                Math.max(

                    0,

                    Number(
                        task.progress ?? 0
                    ) || 0

                )

            ),

        checklist:
            normalizeChecklist(
                task.checklist
            )

    }

}


/*
|--------------------------------------------------------------------------
| useTasks
|--------------------------------------------------------------------------
*/

export function useTasks() {


    const editingTask =
        ref(null)


    /*
    |--------------------------------------------------------------------------
    | Start Creating
    |--------------------------------------------------------------------------
    */

    function createTask() {

        editingTask.value =
            createEmptyTask()

        return editingTask.value

    }


    /*
    |--------------------------------------------------------------------------
    | Start Editing
    |--------------------------------------------------------------------------
    */

    function editTask(task) {

        editingTask.value =
            clone(
                normalizeTask(task)
            )


        return editingTask.value

    }


    /*
    |--------------------------------------------------------------------------
    | Save Task
    |--------------------------------------------------------------------------
    */

    function saveTask(
        task,
        project
    ) {

        if (!project) {

            console.error(
                "Cannot save task: no project."
            )

            return false

        }


        if (
            !task?.name?.trim()
        ) {

            window.alert(
                "請輸入任務名稱"
            )

            return false

        }


        /*
         * Validate dates.
         */

        if (

            task.start &&

            task.end &&

            task.end < task.start

        ) {

            window.alert(
                "結束日期不能早於開始日期"
            )

            return false

        }


        if (
            !Array.isArray(
                project.tasks
            )
        ) {

            project.tasks = []

        }


        const data =
            normalizeTask(task)


        /*
         * Edit existing task.
         */

        if (data.id) {

            const index =
                project.tasks.findIndex(

                    item =>
                        item.id === data.id

                )


            if (index !== -1) {

                project.tasks[index] =
                    data

            }
            else {

                project.tasks.push(
                    data
                )

            }

        }

        /*
         * Create new task.
         */

        else {

            data.id =
                Date.now()


            project.tasks.push(

                data

            )

        }


        editingTask.value =
            null


        return data

    }


    /*
    |--------------------------------------------------------------------------
    | Delete Task
    |--------------------------------------------------------------------------
    */

    function deleteTask(
        task,
        project
    ) {

        if (
            !task ||
            !project
        ) {

            return false

        }


        if (
            !Array.isArray(
                project.tasks
            )
        ) {

            return false

        }


        const confirmed =
            window.confirm(

                `確定要刪除「${task.name}」嗎？`

            )


        if (!confirmed) {

            return false

        }


        project.tasks =
            project.tasks.filter(

                item =>
                    item.id !== task.id

            )


        return true

    }


    /*
    |--------------------------------------------------------------------------
    | Move Task
    |--------------------------------------------------------------------------
    |
    | Used by Kanban drag & drop.
    |
    */

    function moveTask(
        task,
        status,
        project
    ) {

        if (
            !task ||
            !project
        ) {

            return false

        }


        if (
            !Array.isArray(
                project.tasks
            )
        ) {

            return false

        }


        const normalizedStatus =
            normalizeTaskStatus(
                status
            )


        const target =
            project.tasks.find(

                item =>
                    item.id === task.id

            )


        if (!target) {

            return false

        }


        target.status =
            normalizedStatus


        return true

    }


    /*
    |--------------------------------------------------------------------------
    | Toggle Checklist
    |--------------------------------------------------------------------------
    */

    function toggleChecklist(
        task,
        item
    ) {

        if (
            !task ||
            !item
        ) {

            return false

        }


        item.completed =
            !item.completed


        /*
         * Automatically update progress
         * when checklist exists.
         */

        if (
            Array.isArray(
                task.checklist
            ) &&
            task.checklist.length > 0
        ) {

            const completed =
                task.checklist.filter(

                    checklistItem =>
                        checklistItem.completed

                ).length


            task.progress =
                Math.round(

                    (
                        completed /
                        task.checklist.length
                    ) * 100

                )

        }


        return true

    }


    /*
    |--------------------------------------------------------------------------
    | Add Checklist Item
    |--------------------------------------------------------------------------
    */

    function addChecklistItem(
        task,
        text = ""
    ) {

        if (!task) {

            return false

        }


        if (
            !Array.isArray(
                task.checklist
            )
        ) {

            task.checklist = []

        }


        task.checklist.push({

            id:
                `check-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,

            text:
                text.trim(),

            completed:
                false

        })


        return true

    }


    /*
    |--------------------------------------------------------------------------
    | Remove Checklist Item
    |--------------------------------------------------------------------------
    */

    function removeChecklistItem(
        task,
        index
    ) {

        if (
            !task ||
            !Array.isArray(
                task.checklist
            )
        ) {

            return false

        }


        if (
            index < 0 ||
            index >= task.checklist.length
        ) {

            return false

        }


        task.checklist.splice(

            index,

            1

        )


        return true

    }


    /*
    |--------------------------------------------------------------------------
    | Update Progress
    |--------------------------------------------------------------------------
    */

    function updateProgress(
        task,
        progress
    ) {

        if (!task) {

            return false

        }


        task.progress =
            Math.min(

                100,

                Math.max(

                    0,

                    Number(progress) || 0

                )

            )


        return true

    }


    /*
    |--------------------------------------------------------------------------
    | Create From Template
    |--------------------------------------------------------------------------
    */

    function createTaskFromTemplate(
        template
    ) {

        if (!template) {

            return createEmptyTask()

        }


        return normalizeTask({

            id: null,

            name:
                template.name ?? "",

            owner:
                template.owner ?? "",

            status:
                template.status ?? "todo",

            priority:
                template.priority ??
                "不緊急也不重要",

            start:
                template.start ?? "",

            end:
                template.end ?? "",

            description:
                template.description ?? "",

            progress:
                0,

            /*
             * Checklist is copied, but every
             * item starts unchecked.
             */

            checklist:
                Array.isArray(
                    template.checklist
                )

                    ? template.checklist.map(

                        item => ({

                            id:
                                `task-check-${Date.now()}-${Math.random()
                                    .toString(36)
                                    .slice(2, 8)}`,

                            text:
                                item.text ?? "",

                            completed:
                                false

                        })

                    )

                    : []

        })

    }


    /*
    |--------------------------------------------------------------------------
    | Empty Task
    |--------------------------------------------------------------------------
    */

    function createEmptyTask() {

        return {

            id: null,

            name: "",

            owner: "",

            status: "todo",

            priority:
                "不緊急也不重要",

            start: "",

            end: "",

            description: "",

            progress: 0,

            checklist: []

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Public API
    |--------------------------------------------------------------------------
    */

    return {

        editingTask,

        createTask,

        editTask,

        saveTask,

        deleteTask,

        moveTask,

        toggleChecklist,

        addChecklistItem,

        removeChecklistItem,

        updateProgress,

        createTaskFromTemplate,

        createEmptyTask

    }

}