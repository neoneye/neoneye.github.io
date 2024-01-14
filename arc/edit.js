function goBack() {
    history.back(); // Go back to the previous page
    return false;  // Prevents the default anchor action
}

// https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
function iOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function enableFullscreenMode() {
    if (iOS()) {
        // Fullscreen mode behaves weird on iPad. It's better to disable it.
        // Fullscreen mode is not available on iPhone. It's better to disable it.
        return false;
    }
    return true;
}

class PageController {
    constructor() {
        this.db = null;

        // Get the full URL
        const url = window.location.href;

        // Create URLSearchParams object
        const urlParams = new URLSearchParams(window.location.search);

        // Get the 'task' parameter
        const urlParamTask = urlParams.get('task');

        // If 'task' parameter exists, decode it
        if (urlParamTask) {
            const decodedTask = decodeURIComponent(urlParamTask);
            console.log("Task:", decodedTask);
            this.taskId = decodedTask;

            document.title = decodedTask;

            document.getElementById('title_task').innerText = decodedTask;
        } else {
            this.taskId = null;
            console.error("URLSearchParams does not contain 'task' parameter.");
        }

        // Get the 'dataset' parameter
        const urlParamDataset = urlParams.get('dataset');

        // If 'dataset' parameter exists, decode it
        if (urlParamDataset) {
            const decodedDataset = decodeURIComponent(urlParamDataset);
            console.log("Dataset:", decodedDataset);
            this.datasetId = decodedDataset;
        } else {
            this.datasetId = 'ARC';
            console.error("URLSearchParams does not contain 'dataset' parameter.");
        }

        if (enableFullscreenMode()) {
            let el = document.getElementById('fullscreen-button');
            el.style.display = 'inline-block';
        }

        this.canvas = document.getElementById('draw-area-canvas');
        this.isDrawing = false;
        this.currentColor = 0;

        var pixels = [];
        let maxPixelSize = 100;
        for (var i = 0; i < maxPixelSize; i++) {
            var row = [];
            for (var j = 0; j < maxPixelSize; j++) {
                row.push(0);
            }
            pixels.push(row);
        }
        this.maxPixelSize = maxPixelSize;
        this.image = new ARCImage(pixels);

        this.isFullscreen = false;
    }

    async onload() {
        this.db = await initializeDatabase();
        console.log('PageController.onload()', this.db);
        await this.loadTask();
        this.addEventListeners();
        this.hideOverlayShowEditor();
    }

    addEventListeners() {
        // Add an event listener to resize the canvas whenever the window is resized
        window.addEventListener('resize', () => {
            resizeCanvas();
            this.showCanvas();
        });

        this.canvas.addEventListener('touchstart', (event) => { this.startDrawing(event); }, false);
        this.canvas.addEventListener('touchmove', (event) => { this.draw(event); }, false);
        this.canvas.addEventListener('touchend', (event) => { this.stopDrawing(event); }, false);
        this.canvas.addEventListener('mousedown', (event) => { this.startDrawing(event); }, false);
        this.canvas.addEventListener('mousemove', (event) => { this.draw(event); }, false);
        this.canvas.addEventListener('mouseup', (event) => { this.stopDrawing(event); }, false);
        this.canvas.addEventListener('mouseout', (event) => { this.stopDrawing(event); }, false);

        // Listen for the keyup event
        window.addEventListener('keyup', (event) => {
            if (event.code === 'KeyF') {
                if (enableFullscreenMode()) {
                    this.toggleFullscreen();
                }
            }
            if (event.code === 'KeyO') {
                this.toggleOverlay();
            }
            // console.log(event.code);
        });
        
        document.addEventListener("fullscreenchange", (event) => {
            if (document.fullscreenElement) {
                console.log(`Element: ${document.fullscreenElement.id} entered full-screen mode.`);
                this.isFullscreen = true;
            } else {
                console.log('Leaving full-screen mode.');
                this.isFullscreen = false;
            }
        });        
    }

    getPosition(event) {
        let rect = this.canvas.getBoundingClientRect();
        var x, y;
        // Check if it's a touch event
        if (event.touches) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else { // Mouse event
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        return { x: x, y: y };
    }

    startDrawing(event) {
        event.preventDefault();
        this.isDrawing = true;
        var ctx = this.canvas.getContext('2d');
        let position = this.getPosition(event);
        let xcellSize = 5;
        ctx.fillStyle = 'black';
        ctx.fillRect(position.x, position.y, xcellSize, xcellSize);

        let width = this.canvas.width;
        let height = this.canvas.height;
        let cellSize = this.image.cellSize(width, height);

        const drawX = 0;
        const drawY = 0;
        const innerWidth = cellSize * this.image.width;
        const innerHeight = cellSize * this.image.height;
        let x0 = Math.floor(drawX + (width - innerWidth) / 2);
        var y0 = Math.floor(drawY + (height - innerHeight) / 2);

        // let cellx = Math.floor((position.x-x0)/cellSize + 0.5);
        // let celly = Math.floor((position.y-y0)/cellSize + 0.5);
        let cellx = Math.floor((position.x-x0)/cellSize);
        let celly = Math.floor((position.y-y0)/cellSize);
        // console.log('cellx', cellx, 'celly', celly);
        if (cellx < 0 || cellx >= this.image.width) {
            return;
        }
        if (celly < 0 || celly >= this.image.height) {
            return;
        }
        this.image.pixels[celly][cellx] = this.currentColor;
        this.showCanvas();
    }

    draw(event) {
        event.preventDefault();
        if (!this.isDrawing) {
            return;
        }
        var ctx = this.canvas.getContext('2d');
        let position = this.getPosition(event);
        let xcellSize = 5;
        ctx.fillStyle = 'grey';
        ctx.fillRect(position.x, position.y, xcellSize, xcellSize);

        let width = this.canvas.width;
        let height = this.canvas.height;
        let cellSize = this.image.cellSize(width, height);

        const drawX = 0;
        const drawY = 0;
        const innerWidth = cellSize * this.image.width;
        const innerHeight = cellSize * this.image.height;
        let x0 = Math.floor(drawX + (width - innerWidth) / 2);
        var y0 = Math.floor(drawY + (height - innerHeight) / 2);

        // let cellx = Math.floor((position.x-x0)/cellSize + 0.5);
        // let celly = Math.floor((position.y-y0)/cellSize + 0.5);
        let cellx = Math.floor((position.x-x0)/cellSize);
        let celly = Math.floor((position.y-y0)/cellSize);
        // console.log('cellx', cellx, 'celly', celly);
        if (cellx < 0 || cellx >= this.image.width) {
            return;
        }
        if (celly < 0 || celly >= this.image.height) {
            return;
        }
        this.image.pixels[celly][cellx] = this.currentColor;
        this.showCanvas();
    }

    stopDrawing(event) {
        event.preventDefault();
        this.isDrawing = false;
        // var ctx = this.canvas.getContext('2d');
        // let cellSize = 100;
        // ctx.fillStyle = 'white';
        // ctx.fillRect(0, 0, cellSize, cellSize);
    }

    pickColor(colorValue) {
        var paletteItems = document.querySelectorAll('#palette > div');
        paletteItems.forEach((item) => {
            item.classList.remove('palette_item_selected');
        });

        // Select the clicked color
        var selectedColor = document.getElementById('palette-item' + colorValue);
        selectedColor.classList.add('palette_item_selected');

        this.currentColor = colorValue;
    }

    async loadTask() {
        console.log('PageController.loadBundle()');

        var cachedData = null;
        try {
            cachedData = await fetchData(this.db, this.datasetId);
        } catch (error) {
            console.error('Error loading bundle', error);
            return;
        }
        if (!cachedData) {
            console.error('Error there is no cached data.');
            return;
        }
        console.log('Using cached data');

        let task = await this.findTask(cachedData, this.taskId);
        if(!task) {
            console.error('Error there is no task.');
            return;
        }
        this.task = task;
        await this.showTask(task);

        let image = this.task.test[0].input;
        let pixels = JSON.parse(JSON.stringify(image.pixels));
        this.image = new ARCImage(pixels)

        this.showCanvas();
    }

    findTask(jsonData, taskId) {
        console.log('processData called');

        for (let key of Object.keys(jsonData)) {
            let dict = jsonData[key];
            let id = dict.id;
            if (taskId == id) {
                let openUrl = `http://127.0.0.1:8090/task/${taskId}`;
                let thumbnailCacheId = `task_thumbnail_${this.datasetId}_${taskId}`;
                let task = new ARCTask(dict, openUrl, thumbnailCacheId);
                return task;
            }
        }

        return null;
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

    showCanvas() {
        const ctx = this.canvas.getContext('2d');

        let width = this.canvas.width;
        let height = this.canvas.height;

        let image = this.image;
        let cellSize = image.cellSize(width, height);
        image.draw(ctx, 0, 0, width, height, cellSize, {});
    }

    toggleOverlay() {
        let el0 = document.getElementById("task-image");
        let el1 = document.getElementById("draw-area-outer");
        let el2 = document.getElementById("page-footer-item2");
        if (el0.style.visibility == "hidden") {
            this.hideEditorShowOverlay();
        } else {
            this.hideOverlayShowEditor();
        }
    }

    hideOverlayShowEditor() {
        let el0 = document.getElementById("task-image");
        let el1 = document.getElementById("draw-area-outer");
        let el2 = document.getElementById("page-footer-draw-mode");
        el0.style.visibility = "hidden";
        el1.style.visibility = "visible";
        el2.style.visibility = "visible";
    }

    hideEditorShowOverlay() {
        let el0 = document.getElementById("task-image");
        let el1 = document.getElementById("draw-area-outer");
        let el2 = document.getElementById("page-footer-draw-mode");
        el0.style.visibility = "visible";
        el1.style.visibility = "hidden";
        el2.style.visibility = "hidden";
    }

    toggleFullscreen() {
        if (this.isFullscreen) {
            const cancelFullScreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
            cancelFullScreen.call(document);
            this.isFullscreen = false;
            return;
        }
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
            this.isFullscreen = true;
        } else if (document.documentElement.webkitRequestFullscreen) { // Safari specific
            document.documentElement.webkitRequestFullscreen();
            this.isFullscreen = true;
        } else {
            // Fullscreen API is not supported
            alert("Fullscreen mode is not supported in your browser.");
        }
    }

    submitDrawing() {
        console.log('Submit');
        let image = this.image;
        let json0 = JSON.stringify(image.pixels);

        let expectedImage = this.task.test[0].output;
        let json1 = JSON.stringify(expectedImage.pixels);

        let isCorrect = json0 == json1;

        var el = null;
        if (isCorrect) {
            el = document.getElementById('submit-status-correct');
        } else {
            el = document.getElementById('submit-status-incorrect');
        }
        el.style.display = 'block';

        // Hide status after 3 seconds
        setTimeout(() => {
            el.style.display = 'none';
        }, 3000);
    }
}

var gPageController = null;
  
function body_onload() {
    // Resize the canvas to match the parent div size on initial load
    resizeCanvas();
    gPageController = new PageController();
    (async () => {
        gPageController.onload();
    })();
}

function resizeCanvas() {
    let canvas = document.getElementById('draw-area-canvas');
    let parentDiv = document.getElementById('draw-area-outer');    
    canvas.width = parentDiv.clientWidth;
    canvas.height = parentDiv.clientHeight;
}
