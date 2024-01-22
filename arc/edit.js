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
            el.classList.remove('hidden');
        }

        this.canvas = document.getElementById('draw-area-canvas');
        this.dragndropCanvas = document.getElementById('dragndrop-area-canvas');
        this.isDrawing = false;
        this.currentColor = 0;
        this.currentTest = 0;
        this.currentTool = 'paint';
        this.numberOfTests = 1;
        this.userDrawnImages = {};
        this.inset = 2;
        this.clipboard = null;
        this.isPasteMode = false;
        this.isPasting = false;
        this.pasteX = 0;
        this.pasteY = 0;

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

        this.selectRectangle = { 
            x0: 0, 
            y0: 0,
            x1: 0,
            y1: 0,
        };

        {
            // Select the radio button with the id 'tool_paint'
            // Sometimes the browser remembers the last selected radio button, across sessions.
            // This code makes sure that the 'tool_paint' radio button is always selected on launch.
            document.getElementById('tool_paint').checked = true;
        }
    }

    async onload() {
        this.db = await initializeDatabase();
        console.log('PageController.onload()', this.db);
        await this.loadTask();
        this.addEventListeners();
        this.hideEditorShowOverlay();
    }

    addEventListeners() {
        // Add an event listener to resize the canvas whenever the window is resized
        window.addEventListener('resize', () => {
            resizeCanvas();
            this.showCanvas(true);
        });
        window.addEventListener('orientationchange', () => {
            resizeCanvas();
            this.showCanvas(true);
        });        

        // Interaction with the image canvas
        this.canvas.addEventListener('touchstart', (event) => { this.startDraw(event); }, false);
        this.canvas.addEventListener('touchmove', (event) => { this.moveDraw(event); }, false);
        this.canvas.addEventListener('touchend', (event) => { this.stopDraw(event); }, false);
        this.canvas.addEventListener('mousedown', (event) => { this.startDraw(event); }, false);
        this.canvas.addEventListener('mousemove', (event) => { this.moveDraw(event); }, false);
        this.canvas.addEventListener('mouseup', (event) => { this.stopDraw(event); }, false);
        this.canvas.addEventListener('mouseout', (event) => { this.stopDraw(event); }, false);

        // Interaction with the dragndrop canvas
        this.dragndropCanvas.addEventListener('touchstart', (event) => { this.startPaste(event); }, false);
        this.dragndropCanvas.addEventListener('touchmove', (event) => { this.movePaste(event); }, false);
        this.dragndropCanvas.addEventListener('touchend', (event) => { this.stopPaste(event); }, false);
        this.dragndropCanvas.addEventListener('mousedown', (event) => { this.startPaste(event); }, false);
        this.dragndropCanvas.addEventListener('mousemove', (event) => { this.movePaste(event); }, false);
        this.dragndropCanvas.addEventListener('mouseup', (event) => { this.stopPaste(event); }, false);
        this.dragndropCanvas.addEventListener('mouseout', (event) => { this.stopPaste(event); }, false);

        // Listen for the keyup event
        window.addEventListener('keyup', (event) => { this.keyUp(event); });
        
        document.addEventListener("fullscreenchange", (event) => {
            if (document.fullscreenElement) {
                console.log(`Element: ${document.fullscreenElement.id} entered full-screen mode.`);
                this.isFullscreen = true;
            } else {
                console.log('Leaving full-screen mode.');
                this.isFullscreen = false;
            }
        });

        // Get all radio buttons with the name 'tool_switching'
        var radios = document.querySelectorAll('input[name="tool_switching"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                // This function is called whenever a radio button is selected
                if(radio.checked) {
                    this.didPickTool(radio.value);
                }
            });
        });
    }

    keyboardShortcutPickTool(radioButtonId) {
        let el = document.getElementById(radioButtonId);
        el.checked = true;
        this.didPickTool(el.value);
        this.hideToolPanel();
    }

    keyUp(event) {
        // console.log(event.code);

        // Get the currently focused element
        let activeElement = document.activeElement;

        // Check if the focused element is a text input or textarea
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            // If so, don't execute the rest of the keyUp function
            // This allows normal behavior for text input, like moving the cursor
            // console.log('Focused element is a text input or textarea', event.code);
            return;
        }

        if (this.isPasteMode) {
            // While the dragndrop canvas is visible, only the 'Enter' key is handled.
            // All other keyboard interactions are ignored.
            if (event.code === 'Enter') {
                this.pasteFromClipboardAccept();
            }
            return;
        }

        if (event.code === 'KeyF') {
            if (enableFullscreenMode()) {
                this.toggleFullscreen();
            }
        }
        if (event.code === 'KeyO') {
            this.toggleOverlay();
        }
        if (event.code === 'KeyC') {
            this.copyToClipboard();
        }
        if (event.code === 'KeyV') {
            this.pasteFromClipboard();
        }
        if (event.code === 'KeyP') {
            this.keyboardShortcutPickTool('tool_paint');
        }
        if (event.code === 'KeyS') {
            this.keyboardShortcutPickTool('tool_select');
        }
        if (event.code === 'KeyL') {
            this.keyboardShortcutPickTool('tool_fill');
        }
        if (event.code === 'ArrowUp') {
            this.moveUp();
        }
        if (event.code === 'ArrowDown') {
            this.moveDown();
        }
        if (event.code === 'ArrowLeft') {
            this.moveLeft();
        }
        if (event.code === 'ArrowRight') {
            this.moveRight();
        }
    }

    didPickTool(toolId) {
        console.log('Selected Tool:', toolId);
        let el = document.getElementById('tool-button');
        el.innerText = `Tool: ${toolId}`;
        this.currentTool = toolId;
        this.showCanvas(true);
        this.hideToolPanel();

        let el1 = document.getElementById('crop-selected-rectangle-button');
        if (this.isCurrentToolSelect()) {
            el1.classList.remove('hidden');
        } else {
            el1.classList.add('hidden');
        }
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

    translateCoordinatesToSecondCanvas(firstCanvas, secondCanvas, x, y) {
        // Get bounding rectangles of both canvases
        let rectFirst = firstCanvas.getBoundingClientRect();
        let rectSecond = secondCanvas.getBoundingClientRect();
    
        // Calculate the difference in position between the two canvases
        let deltaX = rectSecond.left - rectFirst.left;
        let deltaY = rectSecond.top - rectFirst.top;
    
        // If the canvases have different scales, calculate the scale factors
        // (For example, if they have different dimensions but display the same content)
        let scaleX = secondCanvas.width / rectSecond.width;
        let scaleY = secondCanvas.height / rectSecond.height;
    
        // Adjust the coordinates
        let newX = (x + deltaX) * scaleX;
        let newY = (y + deltaY) * scaleY;
    
        return { x: newX, y: newY };
    }

    startPaste(event) {
        if(!this.isPasteMode) {
            console.error('Paste mode is not active, startPaste() should not be called.');
            return;
        }

        event.preventDefault();
        this.isPasting = true;
        let position = this.getPosition(event);

        this.pasteX = position.x;
        this.pasteY = position.y;
        // console.log('Paste mode. x:', this.pasteX, 'y:', this.pasteY);
        this.showCanvas(true);
    }

    movePaste(event) {
        if(!this.isPasteMode) {
            console.error('Paste mode is not active, movePaste() should not be called.');
            return;
        }
        if(!this.isPasting) {
            return;
        }

        event.preventDefault();
        let position = this.getPosition(event);

        this.pasteX = position.x;
        this.pasteY = position.y;
        // console.log('Paste mode. x:', this.pasteX, 'y:', this.pasteY);
        this.showCanvas(true);
    }

    stopPaste(event) {
        event.preventDefault();
        this.isPasting = false;
    }

    startDraw(event) {
        event.preventDefault();
        this.isDrawing = true;
        var ctx = this.canvas.getContext('2d');
        let position = this.getPosition(event);
        let xcellSize = 5;
        ctx.fillStyle = 'white';
        ctx.fillRect(position.x, position.y, xcellSize, xcellSize);

        if(this.isPasteMode) {
            this.pasteX = position.x;
            this.pasteY = position.y;
            // console.log('Paste mode. x:', this.pasteX, 'y:', this.pasteY);
            this.showCanvas(true);
            return;
        }

        let width = this.canvas.width - this.inset * 2;
        let height = this.canvas.height - this.inset * 2;
        let cellSize = this.image.cellSize(width, height);

        const drawX = this.inset;
        const drawY = this.inset;
        const innerWidth = cellSize * this.image.width;
        const innerHeight = cellSize * this.image.height;
        let x0 = Math.floor(drawX + (width - innerWidth) / 2);
        var y0 = Math.floor(drawY + (height - innerHeight) / 2);

        let cellx = Math.floor((position.x-x0)/cellSize);
        let celly = Math.floor((position.y-y0)/cellSize);
        // console.log('cellx', cellx, 'celly', celly);

        if(this.currentTool == 'select') {
            let clampedCellX = Math.max(0, Math.min(cellx, this.image.width - 1));
            let clampedCellY = Math.max(0, Math.min(celly, this.image.height - 1));
            this.selectRectangle = { 
                x0: clampedCellX, 
                y0: clampedCellY,
                x1: clampedCellX,
                y1: clampedCellY,
            };
            this.showCanvas(true);
            return;
        }

        if (cellx < 0 || cellx >= this.image.width) {
            return;
        }
        if (celly < 0 || celly >= this.image.height) {
            return;
        }
        if(this.currentTool == 'paint') {
            this.image.pixels[celly][cellx] = this.currentColor;
            this.showCanvas(false);
        }
        if(this.currentTool == 'fill') {
            this.floodFill(cellx, celly);
            this.showCanvas(false);
        }
    }

    moveDraw(event) {
        event.preventDefault();
        if (!this.isDrawing) {
            return;
        }
        var ctx = this.canvas.getContext('2d');
        let position = this.getPosition(event);
        let xcellSize = 5;
        ctx.fillStyle = 'grey';
        ctx.fillRect(position.x, position.y, xcellSize, xcellSize);

        if(this.isPasteMode) {
            this.pasteX = position.x;
            this.pasteY = position.y;
            // console.log('Paste mode. x:', this.pasteX, 'y:', this.pasteY);
            this.showCanvas(true);
            return;
        }

        let width = this.canvas.width - this.inset * 2;
        let height = this.canvas.height - this.inset * 2;
        let cellSize = this.image.cellSize(width, height);

        const drawX = this.inset;
        const drawY = this.inset;
        const innerWidth = cellSize * this.image.width;
        const innerHeight = cellSize * this.image.height;
        let x0 = Math.floor(drawX + (width - innerWidth) / 2);
        var y0 = Math.floor(drawY + (height - innerHeight) / 2);

        let cellx = Math.floor((position.x-x0)/cellSize);
        let celly = Math.floor((position.y-y0)/cellSize);
        // console.log('cellx', cellx, 'celly', celly);
        if(this.currentTool == 'select') {
            let clampedCellX = Math.max(0, Math.min(cellx, this.image.width - 1));
            let clampedCellY = Math.max(0, Math.min(celly, this.image.height - 1));
            this.selectRectangle.x1 = clampedCellX;
            this.selectRectangle.y1 = clampedCellY;
            this.showCanvas(true);
            return;
        }

        if (cellx < 0 || cellx >= this.image.width) {
            return;
        }
        if (celly < 0 || celly >= this.image.height) {
            return;
        }
        if(this.currentTool == 'paint') {
            this.image.pixels[celly][cellx] = this.currentColor;
            this.showCanvas(false);
        }
    }

    stopDraw(event) {
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

        let fillSelectedRectangle = this.currentTool == 'select';
        if (fillSelectedRectangle) {
            let { minX, maxX, minY, maxY } = this.getSelectedRectangleCoordinates();
            if (minX > maxX || minY > maxY) {
                return;
            }
            if (minX < 0 || maxX >= this.image.width) {
                return;
            }
            if (minY < 0 || maxY >= this.image.height) {
                return;
            }
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    this.image.pixels[y][x] = this.currentColor;
                }
            }
            this.showCanvas(false);
        }        
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
        this.numberOfTests = task.test.length;
        this.showTask(task);

        this.assignImageFromCurrentTest();
        this.assignSelectRectangleFromCurrentImage();
        this.showCanvas(true);
    }

    assignImageFromCurrentTest() {
        let testIndex = this.currentTest % this.numberOfTests;
        let image = this.task.test[testIndex].input;
        let pixels = JSON.parse(JSON.stringify(image.pixels));
        this.image = new ARCImage(pixels)
    }

    assignSelectRectangleFromCurrentImage() {
        this.selectRectangle = {
            x0: 0,
            y0: 0,
            x1: this.image.width - 1,
            y1: this.image.height - 1,
        };
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

    showTask(task) {
        console.log('Show task:', task);

        this.populateTable(task);
    }

    calcCellSize(task) {
        let el = document.getElementById('main-inner');
        let width = el.clientWidth;
        let height = el.clientHeight;

        let heightOfNonImage = 40;
        let separatorWidth = 10;
        let paddingWidth = (task.train.length + task.test.length) * 20;
        let widthOfNonImage = separatorWidth + paddingWidth;

        var sumPixelWidth = 0;
        for (let i = 0; i < task.train.length; i++) {
            let input = task.train[i].input;
            let output = task.train[i].output;
            sumPixelWidth += Math.max(input.width, output.width);
        }
        for (let i = 0; i < task.test.length; i++) {
            let input = task.test[i].input;
            var output = this.imageForTestIndex(i);
            if (!output) {
                output = input;
            }
            sumPixelWidth += Math.max(input.width, output.width);
        }

        var maxPixelHeight = 0;
        for (let i = 0; i < task.train.length; i++) {
            let input = task.train[i].input;
            let output = task.train[i].output;
            let pixelHeight = input.height + output.height;
            maxPixelHeight = Math.max(maxPixelHeight, pixelHeight);
        }
        for (let i = 0; i < task.test.length; i++) {
            let input = task.test[i].input;
            var output = this.imageForTestIndex(i);
            if (!output) {
                output = input;
            }
            let pixelHeight = input.height + output.height;
            maxPixelHeight = Math.max(maxPixelHeight, pixelHeight);
        }

        let cellSizeX = Math.floor((width - widthOfNonImage) / sumPixelWidth);
        let cellSizeY = Math.floor((height - heightOfNonImage) / maxPixelHeight);
        let cellSize = Math.min(cellSizeX, cellSizeY);
        return cellSize;
    }

    populateTable(task) {
        let cellSize = this.calcCellSize(task);

        let el_tr0 = document.getElementById('mytable-row0');
        let el_tr1 = document.getElementById('mytable-row1');
        let el_tr2 = document.getElementById('mytable-row2');

        // Remove all children
        el_tr0.innerText = '';
        el_tr1.innerText = '';
        el_tr2.innerText = '';

        for (let i = 0; i < task.train.length; i++) {
            let input = task.train[i].input;
            let output = task.train[i].output;
            let el_td0 = document.createElement('td');
            let el_td1 = document.createElement('td');
            let el_td2 = document.createElement('td');
            // el_td0.innerText = `Train ${i + 1}`;
            // el_td1.innerText = `Input ${i + 1}`;
            // el_td2.innerText = `Output ${i + 1}`;

            {
                el_td0.classList.add('center-x');
                el_td0.innerText = `Train ${i + 1}`;
            }

            {
                el_td1.classList.add('input-image-cell');
                el_td1.classList.add('center-x');

                let el_img = document.createElement('img');
                let canvas = input.toCanvasWithCellSize(cellSize);
                let dataURL = canvas.toDataURL();
                el_img.src = dataURL;
                el_td1.appendChild(el_img);
            }

            {
                el_td2.classList.add('output-image-cell');
                el_td2.classList.add('center-x');

                let el_img = document.createElement('img');
                let canvas = output.toCanvasWithCellSize(cellSize);
                let dataURL = canvas.toDataURL();
                el_img.src = dataURL;
                el_td2.appendChild(el_img);
            }
            el_tr0.appendChild(el_td0);
            el_tr1.appendChild(el_td1);
            el_tr2.appendChild(el_td2);
        }

        {
            let el_td0 = document.createElement('td');
            el_td0.innerHTML = '&nbsp;';
            el_td0.classList.add('seperator-column');
            el_td0.rowSpan = 3;
            el_tr0.appendChild(el_td0);
        }

        for (let i = 0; i < task.test.length; i++) {
            let input = task.test[i].input;
            let el_td0 = document.createElement('td');
            let el_td1 = document.createElement('td');
            let el_td2 = document.createElement('td');
            // el_td0.innerText = `Test ${i + 1}`;
            // el_td1.innerText = `Input ${i + 1}`;
            // el_td2.innerText = `Output ${i + 1}`;

            if (i == this.currentTest) {
                el_td0.classList.add('active-test');
                el_td1.classList.add('active-test');
                el_td2.classList.add('active-test');
                let handler = () => {
                    this.hideOverlayShowEditor();
                };
                el_td0.onpointerdown = handler;
                el_td1.onpointerdown = handler;
                el_td2.onpointerdown = handler;
            } else {
                el_td0.classList.add('click-to-active-test');
                el_td1.classList.add('click-to-active-test');
                el_td2.classList.add('click-to-active-test');
                let handler = () => {
                    this.activateTestIndex(i);
                };
                el_td0.onpointerdown = handler;
                el_td1.onpointerdown = handler;
                el_td2.onpointerdown = handler;
            }

            {
                el_td0.classList.add('center-x');
                el_td0.innerText = `Test ${i + 1}`;
            }

            {
                el_td1.classList.add('input-image-cell');
                el_td1.classList.add('center-x');

                let el_img = document.createElement('img');
                let canvas = input.toCanvasWithCellSize(cellSize);
                let dataURL = canvas.toDataURL();
                el_img.src = dataURL;
                el_td1.appendChild(el_img);
            }

            {
                el_td2.classList.add('output-image-cell');
                el_td2.classList.add('center-x');
                el_td2.classList.add('test-output-cell');

                var output = this.imageForTestIndex(i);
                if (!output) {
                    el_td2.innerText = `?`;
                } else {

                    let el_img = document.createElement('img');
                    let canvas = output.toCanvasWithCellSize(cellSize);
                    let dataURL = canvas.toDataURL();
                    el_img.src = dataURL;
                    el_td2.appendChild(el_img);
    
                }
    
            }
            el_tr0.appendChild(el_td0);
            el_tr1.appendChild(el_td1);
            el_tr2.appendChild(el_td2);
        }
    }

    isCurrentToolSelect() {
        return this.currentTool == 'select';
    }

    showCanvas(clear) {
        let isSelectTool = this.isCurrentToolSelect();

        const ctx = this.canvas.getContext('2d');

        let canvasWidth = this.canvas.width;
        let canvasHeight = this.canvas.height;
        let inset = this.inset;
        let width = canvasWidth - inset * 2;
        let height = canvasHeight - inset * 2;

        // Clear the canvas to be fully transparent
        if(clear) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        }

        let image = this.image;
        let cellSize = image.cellSize(width, height);

        // Draw an outline around the image
        {
            let x = image.calcX0(0, width, cellSize) + inset - 1;
            let y = image.calcY0(0, height, cellSize) + inset - 1;
            let w = image.width * cellSize + 2;
            let h = image.height * cellSize + 2;
            var color = '#888888';
            if (isSelectTool) {
                color = 'black';
            }
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        }

        // Draw the image
        image.draw(ctx, inset, inset, width, height, cellSize, {});

        // Draw the dashed select rectangle
        if (isSelectTool && !this.isPasteMode) {
            let { minX, maxX, minY, maxY } = this.getSelectedRectangleCoordinates();
            // console.log('minX', minX, 'maxX', maxX, 'minY', minY, 'maxY', maxY);

            let x = image.calcX0(0, width, cellSize) + minX * cellSize + inset;
            let y = image.calcY0(0, height, cellSize) + minY * cellSize + inset;
            // console.log('x', x, 'y', y);
    
            let drawWidth = (maxX - minX + 1) * cellSize;
            let drawHeight = (maxY - minY + 1) * cellSize;

            this.drawDashedRectangle(ctx, x, y, drawWidth, drawHeight);
        }

        if (this.isPasteMode) {
            if (this.clipboard) {
                const ctx2 = this.dragndropCanvas.getContext('2d');
                ctx2.clearRect(0, 0, this.dragndropCanvas.width, this.dragndropCanvas.height);

                let pasteX = this.pasteX;
                let pasteY = this.pasteY;
                let clipboardImage = this.clipboard;
                let halfWidth = Math.floor(clipboardImage.width * cellSize / 2);
                let halfHeight = Math.floor(clipboardImage.height * cellSize / 2);
                let minXRaw = pasteX - halfWidth;
                let minYRaw = pasteY - halfHeight;
                let position2 = this.translateCoordinatesToSecondCanvas(this.dragndropCanvas, this.canvas, minXRaw, minYRaw);
                let drawX = Math.floor(position2.x);
                let drawY = Math.floor(position2.y);
                ctx.globalAlpha = 0.75;
                clipboardImage.drawInner(ctx2, drawX, drawY, cellSize);
                ctx.globalAlpha = 1;

                let x0 = image.calcX0(0, width, cellSize) + inset;
                let y0 = image.calcY0(0, height, cellSize) + inset;

                var minX = Math.floor((pasteX - halfWidth - x0) / cellSize + 0.5);
                var minY = Math.floor((pasteY - halfHeight - y0) / cellSize + 0.5);
                var maxX = minX + clipboardImage.width - 1;
                var maxY = minY + clipboardImage.height - 1;

                minX = Math.max(0, minX);
                minY = Math.max(0, minY);
                maxX = Math.min(image.width - 1, maxX);
                maxY = Math.min(image.height - 1, maxY);
    
                let x = image.calcX0(minX * cellSize + inset, width, cellSize);
                let y = image.calcY0(minY * cellSize + inset, height, cellSize);
        
                let drawWidth = (maxX - minX + 1) * cellSize;
                let drawHeight = (maxY - minY + 1) * cellSize;
                if (drawWidth > 0 && drawHeight > 0) {
                    this.drawDashedRectangle(ctx, x, y, drawWidth, drawHeight);
                }
            }
        }
    }

    drawDashedRectangle(ctx, x, y, width, height) {
        // First draw a solid white rectangle
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.rect(x - 1, y - 1, width, height);
        ctx.stroke();

        // Then draw a dashed black rectangle
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.rect(x - 1, y - 1, width, height);
        ctx.stroke();    
    }

    toggleOverlay() {
        let el = document.getElementById("mytable");
        if (el.classList.contains('hidden')) {
            this.hideEditorShowOverlay();
        } else {
            this.hideOverlayShowEditor();
        }
    }

    hideOverlayShowEditor() {
        let el0 = document.getElementById("mytable");
        let el1 = document.getElementById("draw-area-outer");
        let el2 = document.getElementById("page-footer-draw-mode");
        el0.classList.add('hidden');
        el1.classList.remove('hidden');
        el2.classList.remove('hidden');

        // Sometimes the browser doesn't render the <canvas> after it's hidden and shown again.
        resizeCanvas();
        this.showCanvas(true);
    }

    hideEditorShowOverlay() {
        let el0 = document.getElementById("mytable");
        let el1 = document.getElementById("draw-area-outer");
        let el2 = document.getElementById("page-footer-draw-mode");
        el0.classList.remove('hidden');
        el1.classList.add('hidden');
        el2.classList.add('hidden');

        this.takeSnapshotOfCurrentImage();
        this.populateTable(this.task);
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

        let testIndex = this.currentTest % this.numberOfTests;
        let expectedImage = this.task.test[testIndex].output;
        let json1 = JSON.stringify(expectedImage.pixels);

        let isCorrect = json0 == json1;

        var el = null;
        if (isCorrect) {
            el = document.getElementById('submit-status-correct');
        } else {
            el = document.getElementById('submit-status-incorrect');
        }
        el.classList.remove('hidden');

        // Hide status after 3 seconds
        setTimeout(() => {
            el.classList.add('hidden');
        }, 3000);
    }

    takeSnapshotOfCurrentImage() {
        let pixels = JSON.parse(JSON.stringify(this.image.pixels));
        let newImage = new ARCImage(pixels);
        this.userDrawnImages[this.currentTest] = newImage;
    }

    imageForTestIndex(testIndex) {
        let image = this.userDrawnImages[testIndex];
        if (!image) {
            return null;
        }
        let pixels = JSON.parse(JSON.stringify(image.pixels));
        let newImage = new ARCImage(pixels);
        return newImage;
    }

    activateTestIndex(testIndex) {
        this.takeSnapshotOfCurrentImage();
        let value0 = this.currentTest;
        this.currentTest = testIndex % this.numberOfTests;
        let value1 = this.currentTest;
        console.log(`Activate test: ${value0} -> ${value1}`);
        this.populateTable(this.task);
        let image = this.imageForTestIndex(this.currentTest);
        if (image) {
            this.image = image;
        } else {
            this.assignImageFromCurrentTest();
        }
        this.assignSelectRectangleFromCurrentImage();
        this.showCanvas(true);
    }

    getWidthHeightFromTextfield() {
        let sizeInput = document.getElementById('canvas-size-input').value;
    
        // Split the string at 'x'
        let dimensions = sizeInput.split('x');
    
        if (dimensions.length != 2) {
            console.error('Invalid input format. Correct format: widthxheight');
            return null;
        }

        let width = parseInt(dimensions[0]);
        let height = parseInt(dimensions[1]);

        if (isNaN(width) || isNaN(height)) {
            console.error('Invalid input: width and height must be numbers.');
            return null;
        }
        if (width < 1 || height < 1) {
            console.error('Invalid input: width and height must be 1 or greater.');
            return null;
        }
        if (width > this.maxPixelSize || height > this.maxPixelSize) {
            console.error(`Invalid input: width and height must be less than or equal to ${this.maxPixelSize}.`);
            return null;
        }
        
        // Return width and height as an object
        return { width, height };
    }
    
    resizeImageOnKeyDown(event) {
        // Check if the key pressed is 'Enter'
        if (event.key === 'Enter' || event.keyCode === 13) {
            // Call the function you want to execute when Enter is pressed
            this.resizeImage();
        }
    }

    resizeImage() {
        let size = this.getWidthHeightFromTextfield();
        if (!size) {
            console.error('Unable to determine the size');
            return;
        }

        console.log('Width:', size.width, 'Height:', size.height);

        // Resize the image, preserve the content.
        let outsideColor = this.currentColor;
        let pixels = this.image.pixels;
        let newPixels = [];
        for (var y = 0; y < size.height; y++) {
            var row = [];
            for (var x = 0; x < size.width; x++) {
                var value = outsideColor;
                if (y < pixels.length && x < pixels[y].length) {
                    value = pixels[y][x];
                }
                row.push(value);
            }
            newPixels.push(row);
        }
        let newImage = new ARCImage(newPixels);
        this.image = newImage;
        this.assignSelectRectangleFromCurrentImage();
        this.showCanvas(true);

        this.hideToolPanel();
    }

    startOverWithInputImage() {
        this.assignImageFromCurrentTest();
        this.assignSelectRectangleFromCurrentImage();
        this.showCanvas(true);
        this.hideToolPanel();
    }

    floodFill(x, y) {
        this.image.floodFill(x, y, this.currentColor);
    }

    getSelectedRectangleCoordinates() {
        let minX = Math.min(this.selectRectangle.x0, this.selectRectangle.x1);
        let maxX = Math.max(this.selectRectangle.x0, this.selectRectangle.x1);
        let minY = Math.min(this.selectRectangle.y0, this.selectRectangle.y1);
        let maxY = Math.max(this.selectRectangle.y0, this.selectRectangle.y1);
        return { minX, maxX, minY, maxY };
    }

    cropSelectedRectangle() {
        if (!this.isCurrentToolSelect()) {
            console.log('Crop is only available in select mode.');
            return;
        }

        let { minX, maxX, minY, maxY } = this.getSelectedRectangleCoordinates();
        // console.log('minX', minX, 'maxX', maxX, 'minY', minY, 'maxY', maxY);
        if (minX > maxX || minY > maxY) {
            return;
        }
        if (minX < 0 || maxX >= this.image.width) {
            return;
        }
        if (minY < 0 || maxY >= this.image.height) {
            return;
        }
        this.image = this.image.crop(minX, minY, maxX - minX + 1, maxY - minY + 1);
        this.assignSelectRectangleFromCurrentImage();
        this.showCanvas(true);
        this.hideToolPanel();
    }

    copyToClipboard() {
        let rectangle = this.getToolRectangle();
        let cropImage = this.image.crop(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        this.clipboard = cropImage;
        this.hideToolPanel();
        console.log(`Copied to clipboard. width: ${cropImage.width}, height: ${cropImage.height}`);
    }

    pasteFromClipboard() {
        if (!this.clipboard) {
            console.log('Paste from clipboard. Clipboard is empty');
            return;
        }
        let image = this.clipboard;
        console.log(`Paste from clipboard. width: ${image.width}, height: ${image.height}`);
        this.pasteX = this.canvas.width / 2;
        this.pasteY = this.canvas.height / 2;
        this.hideToolPanel();
        this.isPasteMode = true;
        this.showDragndropArea();
        resizeCanvas();
        this.showCanvas(true);
    }

    showDragndropArea() {
        let el = document.getElementById('dragndrop-area-outer');
        el.classList.remove('hidden');
    }

    hideDragndropArea() {
        let el = document.getElementById('dragndrop-area-outer');
        el.classList.add('hidden');
    }

    pasteFromClipboardAccept() {
        if (!this.clipboard) {
            console.log('Paste from clipboard accept. Clipboard is empty');
            return;
        }
        if (!this.isPasteMode) {
            console.log('Paste from clipboard accept. Not in paste mode');
            return;
        }
        console.log('Paste from clipboard accept.');

        let canvasWidth = this.canvas.width;
        let canvasHeight = this.canvas.height;
        let inset = this.inset;
        let width = canvasWidth - inset * 2;
        let height = canvasHeight - inset * 2;

        let image = this.image;
        let cellSize = image.cellSize(width, height);

        let pasteX = this.pasteX;
        let pasteY = this.pasteY;
        let clipboardImage = this.clipboard;
        let halfWidth = Math.floor(clipboardImage.width * cellSize / 2);
        let halfHeight = Math.floor(clipboardImage.height * cellSize / 2);

        let x0 = image.calcX0(0, width, cellSize) + inset;
        let y0 = image.calcY0(0, height, cellSize) + inset;

        var minX = Math.floor((pasteX - halfWidth - x0) / cellSize + 0.5);
        var minY = Math.floor((pasteY - halfHeight - y0) / cellSize + 0.5);

        this.image = this.image.overlay(clipboardImage, minX, minY);
        this.isPasteMode = false;

        let clampedX0 = Math.max(0, Math.min(minX, this.image.width - 1));
        let clampedY0 = Math.max(0, Math.min(minY, this.image.height - 1));
        let clampedX1 = Math.max(0, Math.min(minX + clipboardImage.width - 1, this.image.width - 1));
        let clampedY1 = Math.max(0, Math.min(minY + clipboardImage.height - 1, this.image.height - 1));
        this.selectRectangle.x0 = clampedX0;
        this.selectRectangle.y0 = clampedY0;
        this.selectRectangle.x1 = clampedX1;
        this.selectRectangle.y1 = clampedY1;

        this.showCanvas(true);
        this.hideDragndropArea();
    }

    pasteFromClipboardReject() {
        console.log('Paste from clipboard reject.');
        this.isPasteMode = false;
        this.showCanvas(true);
        this.hideDragndropArea();
    }

    // Get either the selected rectangle or the rectangle for the entire image
    getToolRectangle() {
        if (this.isCurrentToolSelect()) {
            let { minX, maxX, minY, maxY } = this.getSelectedRectangleCoordinates();
            if (minX > maxX || minY > maxY) {
                throw new Error(`getToolRectangle. Invalid selected rectangle: min must be smaller than max. minX: ${minX}, maxX: ${maxX}, minY: ${minY}, maxY: ${maxY}`);
            }
            if (minX < 0 || maxX >= this.image.width || minY < 0 || maxY >= this.image.height) {
                throw new Error(`getToolRectangle. The selected rectangle is outside the image boundaries. minX: ${minX}, maxX: ${maxX}, minY: ${minY}, maxY: ${maxY}`);
            }
            return { 
                x: minX, 
                y: minY,
                width: maxX - minX + 1, 
                height: maxY - minY + 1 
            };
        } else {
            return { 
                x: 0, 
                y: 0, 
                width: this.image.width, 
                height: this.image.height 
            };
        }
    }

    // Reverse the x-axis of the selected rectangle
    flipX() {
        let rectangle = this.getToolRectangle();
        let cropImage = this.image.crop(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        let flippedImage = cropImage.flipX();
        this.image = this.image.overlay(flippedImage, rectangle.x, rectangle.y);
        this.showCanvas(true);
        this.hideToolPanel();
    }

    // Reverse the y-axis of the selected rectangle
    flipY() {
        let rectangle = this.getToolRectangle();
        let cropImage = this.image.crop(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        let flippedImage = cropImage.flipY();
        this.image = this.image.overlay(flippedImage, rectangle.x, rectangle.y);
        this.showCanvas(true);
        this.hideToolPanel();
    }

    // Rotate clockwise
    rotateCW() {
        if (!this.isCurrentToolSelect()) {
            this.image = this.image.rotateCW();
            this.assignSelectRectangleFromCurrentImage();
            this.showCanvas(true);
            this.hideToolPanel();
            return;
        }
        let rectangle = this.getToolRectangle();
        if (rectangle.width != rectangle.height) {
            console.log('Rotate is only available for square selections.');
            return;
        }
        let cropImage = this.image.crop(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        let rotatedImage = cropImage.rotateCW();
        this.image = this.image.overlay(rotatedImage, rectangle.x, rectangle.y);
        this.showCanvas(true);
        this.hideToolPanel();
    }

    // Rotate counter clockwise
    rotateCCW() {
        if (!this.isCurrentToolSelect()) {
            this.image = this.image.rotateCCW();
            this.assignSelectRectangleFromCurrentImage();
            this.showCanvas(true);
            this.hideToolPanel();
            return;
        }
        let rectangle = this.getToolRectangle();
        if (rectangle.width != rectangle.height) {
            console.log('Rotate is only available for square selections.');
            return;
        }
        let cropImage = this.image.crop(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        let rotatedImage = cropImage.rotateCCW();
        this.image = this.image.overlay(rotatedImage, rectangle.x, rectangle.y);
        this.showCanvas(true);
        this.hideToolPanel();
    }

    // Move left with wrap around
    moveLeft() {
        let rectangle = this.getToolRectangle();
        if (rectangle.width < 2) {
            console.log('Move is only available when the width is 2 or greater.');
            return;
        }
        let image0 = this.image.crop(rectangle.x, rectangle.y, 1, rectangle.height);
        let image1 = this.image.crop(rectangle.x + 1, rectangle.y, rectangle.width - 1, rectangle.height);
        this.image = this.image.overlay(image1, rectangle.x, rectangle.y);
        this.image = this.image.overlay(image0, rectangle.x + rectangle.width - 1, rectangle.y);
        this.showCanvas(true);
        this.hideToolPanel();
    }

    // Move right with wrap around
    moveRight() {
        let rectangle = this.getToolRectangle();
        if (rectangle.width < 2) {
            console.log('Move is only available when the width is 2 or greater.');
            return;
        }
        let image0 = this.image.crop(rectangle.x + rectangle.width - 1, rectangle.y, 1, rectangle.height);
        let image1 = this.image.crop(rectangle.x, rectangle.y, rectangle.width - 1, rectangle.height);
        this.image = this.image.overlay(image1, rectangle.x + 1, rectangle.y);
        this.image = this.image.overlay(image0, rectangle.x, rectangle.y);
        this.showCanvas(true);
        this.hideToolPanel();
    }

    // Move up with wrap around
    moveUp() {
        let rectangle = this.getToolRectangle();
        if (rectangle.height < 2) {
            console.log('Move is only available when the height is 2 or greater.');
            return;
        }
        let image0 = this.image.crop(rectangle.x, rectangle.y, rectangle.width, 1);
        let image1 = this.image.crop(rectangle.x, rectangle.y + 1, rectangle.width, rectangle.height - 1);
        this.image = this.image.overlay(image1, rectangle.x, rectangle.y);
        this.image = this.image.overlay(image0, rectangle.x, rectangle.y + rectangle.height - 1);
        this.showCanvas(true);
        this.hideToolPanel();
    }

    // Move down with wrap around
    moveDown() {
        let rectangle = this.getToolRectangle();
        if (rectangle.height < 2) {
            console.log('Move is only available when the height is 2 or greater.');
            return;
        }
        let image0 = this.image.crop(rectangle.x, rectangle.y + rectangle.height - 1, rectangle.width, 1);
        let image1 = this.image.crop(rectangle.x, rectangle.y, rectangle.width, rectangle.height - 1);
        this.image = this.image.overlay(image1, rectangle.x, rectangle.y + 1);
        this.image = this.image.overlay(image0, rectangle.x, rectangle.y);
        this.showCanvas(true);
        this.hideToolPanel();
    }

    showToolPanel() {
        {
            var el = document.getElementById('canvas-size-input');
            el.value = `${this.image.width}x${this.image.height}`;
        }
        {
            var el = document.getElementById('tool-panel');
            el.classList.remove('hidden');
        }
    }

    hideToolPanel() {
        var el = document.getElementById('tool-panel');
        el.classList.add('hidden');
    }

    dismissToolPanel(event) {
        let innerDiv = document.getElementById('tool-panel-inner');
    
        // Check if the click was outside the inner div
        if (event.target === innerDiv || innerDiv.contains(event.target)) {
            // Click inside, do nothing
        } else {
            // Click outside, dismiss the panel
            this.hideToolPanel();
        }
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
    {
        let canvas = document.getElementById('draw-area-canvas');
        let parentDiv = document.getElementById('draw-area-outer');    
        canvas.width = parentDiv.clientWidth;
        canvas.height = parentDiv.clientHeight;
    }
    {
        let canvas = document.getElementById('dragndrop-area-canvas');
        let parentDiv = document.getElementById('dragndrop-area-outer');    
        canvas.width = parentDiv.clientWidth;
        canvas.height = parentDiv.clientHeight;
    }
}
