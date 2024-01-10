function goBack() {
    history.back(); // Go back to the previous page
    return false;  // Prevents the default anchor action
}

class PageController {
    constructor() {
        this.db = null;

        // Get the full URL
        const url = window.location.href;

        // Create URLSearchParams object
        const urlParams = new URLSearchParams(window.location.search);

        // Get the 'task' parameter
        const task = urlParams.get('task');

        // If 'task' parameter exists, decode it
        if (task) {
            const decodedTask = decodeURIComponent(task);
            console.log("Task:", decodedTask);
            this.taskId = decodedTask;

            document.title = `Edit ${decodedTask}`;

            document.getElementById('title_task').innerText = decodedTask;
        } else {
            this.taskId = null;
            console.log("Task parameter not found in URL");
        }
    }

    async onload() {
        this.db = await initializeDatabase();
        console.log('PageController.onload()', this.db);
        await this.loadTask();
    }

    async loadTask() {
        console.log('PageController.loadBundle()');

        var cachedData = null;
        try {
            cachedData = await fetchData(this.db, 'bundle2');
        } catch (error) {
            console.error('Error loading bundle', error);
            return;
        }
        if (!cachedData) {
            console.error('Error there is no cached data.');
            return;
        }
        console.log('Using cached data');

        let task = await PageController.findTask(cachedData, this.taskId);
        if(!task) {
            console.error('Error there is no task.');
            return;
        }
        this.task = task;
        await this.showTask(task);
    }

    static findTask(jsonData, taskId) {
        console.log('processData called');

        for (let key of Object.keys(jsonData)) {
            let dict = jsonData[key];
            let id = dict.id;
            if (taskId == id) {
                let openUrl = `http://127.0.0.1:8090/task/${id}`
                let task = new ARCTask(dict, openUrl);
                return task;
            }
        }

        return null;
    }

    async renderTasks(tasks) {
        console.log('Render tasks:', tasks.length);

        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];
            let count = task.train.length + task.test.length;
            let extraWide = (count > 6);
            let canvas = task.toThumbnailCanvas(extraWide, 1);

            let id = `task_${i}`;
            await storeCanvas(this.db, canvas, id);
        }
    }

    async showTask(task) {
        console.log('Show task:', task);

        let count = task.train.length + task.test.length;
        let extraWide = (count > 6);
                
        let insetValue = 0;
        let canvas = task.toCanvas(insetValue, extraWide);
        let dataURL = canvas.toDataURL();

        const el_img = document.getElementById('task-image');
        el_img.src = dataURL;
    }
}

var gPageController = null;
  
function body_onload() {
    gPageController = new PageController();
    (async () => {
        gPageController.onload();
    })();
}
