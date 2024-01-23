const color_palette = [
    "#000000", // 0 = black
    "#0074d9", // 1 = blue
    "#ff4136", // 2 = red
    "#2ecc40", // 3 = green
    "#ffdc00", // 4 = yellow
    "#aaaaaa", // 5 = gray
    "#f012be", // 6 = fuchsia
    "#ff851b", // 7 = orange
    "#7fdbff", // 8 = teal
    "#870c25", // 9 = brown
    "#282828", // 10 = dark gray
    "#ffffff", // 11 = white
];

const indexdb_database_name = 'ARCDatabase';
const indexdb_store_name_image = 'image';
const indexdb_store_name_other = 'other';
    

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(indexdb_database_name, 5);

        openRequest.onupgradeneeded = function(event) {
            const db = event.target.result;

            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(indexdb_store_name_image)) {
                db.createObjectStore(indexdb_store_name_image, { keyPath: 'id' });
            }

            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(indexdb_store_name_other)) {
                db.createObjectStore(indexdb_store_name_other, { keyPath: 'id' });
            }
        };

        openRequest.onerror = function() {
            console.error("Error opening database:", openRequest.error);
            reject(openRequest.error);
        };

        openRequest.onsuccess = function() {
            resolve(openRequest.result);
        };
    });
}

async function storeData(db, id, data) {
    let storeName = indexdb_store_name_other;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        store.put({ id: id, data: data });

        transaction.oncomplete = () => resolve();
        transaction.onerror = event => reject("IndexedDB write error: " + event.target.errorCode);
    });
}

async function fetchData(db, id) {
    let storeName = indexdb_store_name_other;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = event => reject("IndexedDB read error: " + event.target.errorCode);
    });
}

async function storeCanvas(db, canvas, id) {
    // Convert canvas to blob
    const blob = await new Promise((resolve) => canvas.toBlob(resolve));

    // Perform the transaction
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(indexdb_store_name_image, 'readwrite');
        let images = transaction.objectStore(indexdb_store_name_image);
        let request = images.put({ id: id, image: blob });

        request.onsuccess = function() {
            // console.log("Image saved to DB");
            resolve(request.result);
        };

        request.onerror = function() {
            console.log("Error", request.error);
            reject(request.error);
        };
    });
}


async function fetchImage(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(indexdb_store_name_image, "readonly");
        const store = transaction.objectStore(indexdb_store_name_image);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result ? request.result.image : null);
        request.onerror = event => reject("IndexedDB read error: " + event.target.errorCode);
    });
}

class DatabaseWrapper {
    constructor(indexedDBInstance) {
        this.indexedDBInstance = indexedDBInstance;
    }

    static async create() {
        let indexedDBInstance = await initializeDatabase();
        return new DatabaseWrapper(indexedDBInstance);
    }

    async getData(key) {
        // console.log('DatabaseWrapper.getData()', key);
        return await fetchData(this.indexedDBInstance, key);
    }

    async setData(key, data) {
        // console.log('DatabaseWrapper.setData()', key);
        await storeData(this.indexedDBInstance, key, data);
    }

    async getImage(key) {
        // console.log('DatabaseWrapper.getImage()', key);
        return await fetchImage(this.indexedDBInstance, key);
    }

    async setImageFromCanvas(key, canvas) {
        // console.log('DatabaseWrapper.setImageFromCanvas()', key);
        await storeCanvas(this.indexedDBInstance, canvas, key);
    }
}

class Dataset {
    constructor(datasetId, tasks) {
        this.datasetId = datasetId;
        this.tasks = tasks;
    }

    static async load(database, datasetId) {
        if (!(database instanceof DatabaseWrapper)) {
            throw new Error(`database is not an instance of DatabaseWrapper. database: ${database}`);
        }

        let time0 = Date.now();

        let uint8Array = await Dataset.fetchDatasetJsonGz(database, datasetId);

        let time1 = Date.now();

        // Decompress data
        let decompressed = pako.inflate(uint8Array, { to: 'string' });
        console.log('decompressed.length', decompressed.length);
        let jsonData = JSON.parse(decompressed);

        let time2 = Date.now();

        // Extract tasks
        let tasks = Dataset.tasksFromJsonData(jsonData, datasetId);

        let time3 = Date.now();
        console.log(`Dataset.load() elapsed ${time3 - time0} ms. Fetch: ${time1 - time0} ms. Decompress: ${time2 - time1} ms. Tasks from json: ${time3 - time2} ms.`);

        return new Dataset(datasetId, tasks);
    }

    // Return cached data if available. Fetch data if not in cache.
    static async fetchDatasetJsonGz(database, datasetId) {
        if (!(database instanceof DatabaseWrapper)) {
            throw new Error(`database is not an instance of DatabaseWrapper. database: ${database}`);
        }

        let cacheKey = `dataset_${datasetId}_json_gz`;
        let cachedData = await database.getData(cacheKey);
        if (cachedData) {
            console.log(`Using cached dataset. Key: ${cacheKey} Length: ${cachedData.length}`);
            return new Uint8Array(cachedData);
        }
        console.log('No cached dataset. Will fetch now.');

        // Fetch data if not in cache
        const response = await fetch(`dataset/${datasetId}.json.gz`);
        const arrayBuffer = await response.arrayBuffer();
        let uint8Array = new Uint8Array(arrayBuffer);
        console.log('Did fetch dataset.');

        // Store in IndexedDB
        await database.setData(cacheKey, uint8Array);
        console.log(`Saved dataset to cache. Key: ${cacheKey} Length: ${uint8Array.length}`);
        return uint8Array;
    }

    static tasksFromJsonData(jsonData, datasetId) {
        let tasks = [];
        for (let key of Object.keys(jsonData)) {
            let taskJsonData = jsonData[key];
            let taskId = taskJsonData.id;
            let encodedId = encodeURIComponent(taskId);
            let openUrl = `edit.html?dataset=${datasetId}&task=${encodedId}`;
            let thumbnailCacheId = `task_thumbnail_${datasetId}_${taskId}`;
            let task = new ARCTask(taskJsonData, openUrl, thumbnailCacheId);
            tasks.push(task);
        }
        console.log('Loaded tasks:', tasks.length);
        return tasks;
    }

    findTask(taskId) {
        console.log(`findTask taskId: ${taskId}`);
        for (let task of this.tasks) {
            if (task.jsonData.id == taskId) {
                return task;
            }
        }
        return null;
    }
}

class ARCImage {
    constructor(pixels) {
        var min_length = 1000000;
        var max_length = 0;
        for (let row of pixels) {
            min_length = Math.min(min_length, row.length);
            max_length = Math.max(max_length, row.length);
        }
        if (min_length !== max_length) {
            throw new Error(`Image is not rectangular: min_length=${min_length}, max_length=${max_length}`);
        }
        this.pixels = pixels;
        this.width = min_length;
        this.height = pixels.length;
    }

    static color(width, height, color) {
        if (width < 1 || height < 1 || width > 255 || height > 255) {
            throw new Error(`Image size must be between 1x1 and 255x255: width=${width}, height=${height}`);
        }
        if (color < 0 || color > 255) {
            throw new Error(`Pixel color must be between 0 and 255: color=${color}`);
        }
        var pixels = [];
        for (var y = 0; y < height; y++) {
            var row = [];
            for (var x = 0; x < width; x++) {
                row.push(color);
            }
            pixels.push(row);
        }
        return new ARCImage(pixels);
    }

    clone() {
        let pixels = JSON.parse(JSON.stringify(this.pixels));
        return new ARCImage(pixels);
    }

    toCanvas() {
        let cellSize = 1;
        return this.toCanvasWithCellSize(cellSize);
    }
    
    toCanvasWithCellSize(cellSize) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = this.width * cellSize;
        canvas.height = this.height * cellSize;
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                let pixel = this.pixels[y][x];
                ctx.fillStyle = color_palette[pixel];
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
        return canvas;
    }
    
    cellSize(width, height) {
        let cellX = width / this.width;
        let cellY = height / this.height;
        return Math.floor(Math.min(cellX, cellY));
    }

    // Left position of the image
    calcX0(drawX, width, cellSize) {
        let innerWidth = cellSize * this.width;
        return Math.floor(drawX + (width - innerWidth) / 2);
    }

    // Top position of the image
    calcY0(drawY, height, cellSize) {
        let innerHeight = cellSize * this.height;
        return Math.floor(drawY + (height - innerHeight) / 2);
    }

    draw(ctx, drawX, drawY, width, height, cellSize, options) {
        let x0 = this.calcX0(drawX, width, cellSize);
        var y0 = this.calcY0(drawY, height, cellSize);
        if (options.alignTop) {
            y0 = drawY;
        }
        if (options.alignBottom) {
            let innerHeight = cellSize * this.height;
            y0 = drawY + height - innerHeight;
        }
        this.drawInner(ctx, x0, y0, cellSize);
    }

    drawInner(ctx, x0, y0, cellSize) {
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                let pixel = this.pixels[y][x];
                ctx.fillStyle = color_palette[pixel];
                ctx.fillRect(x0 + (x * cellSize), y0 + (y * cellSize), cellSize, cellSize);
            }
        }
    }

    // Extract a sub-image from the image
    crop(x, y, width, height) {
        if (width < 1 || height < 1) {
            throw new Error(`Invalid crop: size must be 1x1 or bigger. width=${width}, height=${height}`);
        }
        if (x < 0 || y < 0 || x + width > this.width || y + height > this.height) {
            throw new Error(`Invalid crop: rectangle goes outside the image. x=${x}, y=${y}, width=${width}, height=${height}`);
        }
        let pixels = [];
        for (let i = 0; i < height; i++) {
            pixels.push(this.pixels[y + i].slice(x, x + width));
        }
        return new ARCImage(pixels);
    }

    // Reverse the image horizontally
    flipX() {
        let pixels = [];
        for (var y = 0; y < this.height; y++) {
            var row = [];
            for (var x = this.width - 1; x >= 0; x--) {
                row.push(this.pixels[y][x]);
            }
            pixels.push(row);
        }
        return new ARCImage(pixels);
    }

    // Reverse the image vertically
    flipY() {
        let pixels = [];
        for (var y = this.height - 1; y >= 0; y--) {
            pixels.push(this.pixels[y].slice());
        }
        return new ARCImage(pixels);
    }

    // Overlay another image on top of this image
    overlay(other_image, x, y) {
        let pixels = [];
        for (let i = 0; i < this.height; i++) {
            pixels.push(this.pixels[i].slice());
        }
        for (let i = 0; i < other_image.height; i++) {
            for (let j = 0; j < other_image.width; j++) {
                let yi = y + i;
                let xj = x + j;
                if (yi >= 0 && yi < this.height && xj >= 0 && xj < this.width) {
                    pixels[yi][xj] = other_image.pixels[i][j];
                }
            }
        }
        return new ARCImage(pixels);
    }

    // Rotate the image 90 degrees clockwise
    rotateCW() {
        let pixels = [];
        for (var x = 0; x < this.width; x++) {
            var row = [];
            for (var y = this.height - 1; y >= 0; y--) {
                row.push(this.pixels[y][x]);
            }
            pixels.push(row);
        }
        return new ARCImage(pixels);
    }

    // Rotate the image 90 degrees counter-clockwise
    rotateCCW() {
        return this.rotateCW().rotateCW().rotateCW();
    }

    // Flood fill the image with a new color
    floodFill(x, y, targetColor) {
        // Helper function for the flood fill algorithm
        const floodFillHelper = (x, y, sourceColor, targetColor) => {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                return;
            }
            let value = this.pixels[y][x];
            if (value === targetColor || value !== sourceColor) {
                return;
            }
            this.pixels[y][x] = targetColor;
            floodFillHelper(x - 1, y, sourceColor, targetColor);
            floodFillHelper(x + 1, y, sourceColor, targetColor);
            floodFillHelper(x, y - 1, sourceColor, targetColor);
            floodFillHelper(x, y + 1, sourceColor, targetColor);
        };
    
        // Check if coordinates are within bounds
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
    
        // Get the source color and start the flood fill
        let sourceColor = this.pixels[y][x];
        floodFillHelper(x, y, sourceColor, targetColor);
    }    
}

class ARCPair {
    constructor(input, output) {
        this.input = new ARCImage(input);
        this.output = new ARCImage(output);
    }
}

class ARCTask {
    constructor(jsonData, openUrl, thumbnailCacheId) {
        this.jsonData = jsonData;
        this.train = jsonData.train.map(pair => new ARCPair(pair.input, pair.output));
        this.test = jsonData.test.map(pair => new ARCPair(pair.input, pair.output));
        this.openUrl = openUrl;
        this.thumbnailCacheId = thumbnailCacheId;
    }

    toThumbnailCanvas(extraWide, scale) {
        var width = 320 * scale;
        if (extraWide) {
            width *= 2;
        }
        let height = 150 * scale;

        const thumbnailCanvas = document.createElement('canvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        thumbnailCanvas.width = width;
        thumbnailCanvas.height = height;

        let insetValue = 5;
        let canvas = this.toCanvas(insetValue, extraWide);
        thumbnailCtx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        return thumbnailCanvas;
    }

    toCanvas(insetValue, extraWide) {
        let scale = 4;
        var width = 320 * scale;
        if (extraWide) {
            width *= 2;
        }
        let height = 150 * scale;
        let inset = insetValue * scale;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        
        let count = this.train.length + this.test.length;
        let n_train = this.train.length;
        let n_test = this.test.length;

        let inputOutputGapSize = 5 * scale;
        let pairGapSize = 5 * scale;
        let trainTestGapSize = 5 * scale;

        let cellWidthTotalAvailable = width - 2 * inset;

        let cellWidthWithoutGap = cellWidthTotalAvailable / count;
        let cellWidthWithGap = cellWidthWithoutGap - pairGapSize;
        let cellHeight = (height - inputOutputGapSize - 2 * inset) / 2;


        // ctx.fillStyle = 'white';
        // ctx.fillRect(0, 0, width, height);
        // ctx.fillStyle = '#282828';
        // ctx.fillStyle = 'black';
        // ctx.fillRect(inset, inset, width - inset * 2, height - inset * 2);

        let trainTestGap = scale;

        ctx.fillStyle = '#333';
        let inset1 = 0;
        let trainWidth = (n_train * cellWidthTotalAvailable) / count - trainTestGap;
        ctx.fillRect(inset, inset1, trainWidth, height - inset1 * 2);

        // ctx.fillStyle = 'black';
        // ctx.fillRect(inset, height / 2 - 1, width - inset * 2, 2);
    
        // ctx.fillStyle = '#ffffff';
        // ctx.fillRect((n_train * width) / count, 0, width - (n_train * width) / count, height);

        // ctx.fillStyle = 'rgb(70, 60, 40)';
        ctx.fillStyle = 'rgb(60, 50, 60)';
        let maskWidth = (n_test * cellWidthTotalAvailable) / count + inset - trainTestGap;
        let maskX = width - maskWidth - inset1;
        ctx.fillRect(
            maskX, 
            inset1,
            maskWidth, 
            height - inset1 * 2
        );


        var cellSize = 1000000;
        for (let i = 0; i < this.train.length; i++) {
            let size0 = this.train[i].input.cellSize(cellWidthWithGap, cellHeight);
            let size1 = this.train[i].output.cellSize(cellWidthWithGap, cellHeight);
            cellSize = Math.min(cellSize, Math.min(size0, size1));
        }
        for (let i = 0; i < this.test.length; i++) {
            let size0 = this.test[i].input.cellSize(cellWidthWithGap, cellHeight);
            let size1 = this.test[i].output.cellSize(cellWidthWithGap, cellHeight);
            cellSize = Math.min(cellSize, Math.min(size0, size1));
        }
    
        for (let i = 0; i < this.train.length; i++) {
            let x = (i * cellWidthTotalAvailable) / count + inset;
            let y0 = inset;
            let y1 = height / 2;
            this.train[i].input.draw(ctx, x, y0, cellWidthWithoutGap, cellHeight, cellSize, {alignBottom: true});
            this.train[i].output.draw(ctx, x, y1, cellWidthWithoutGap, cellHeight, cellSize, {alignTop: true});
        }
        for (let i = 0; i < this.test.length; i++) {
            let x = ((n_train + i) * cellWidthTotalAvailable) / count + inset;
            let y0 = inset;
            let y1 = height / 2;
            this.test[i].input.draw(ctx, x, y0, cellWidthWithoutGap, cellHeight, cellSize, {alignBottom: true});
            // this.test[i].output.draw(ctx, x, y1, cellWidthWithoutGap, cellHeight, cellSize, {alignTop: true});
        }

        // for (let i = 1; i < count; i++) {
        //     ctx.fillStyle = 'black';
        //     ctx.fillRect((i * cellWidthTotalAvailable) / count + inset, inset, 1, height - inset * 2);
        // }
    
        // ctx.fillStyle = 'rgb(78, 76, 58)';
        // ctx.fillStyle = 'rgb(78, 60, 40)';
        // ctx.fillStyle = 'rgb(70, 60, 40)';
        // let maskWidth = (n_test * cellWidthTotalAvailable) / count;
        // let maskX = width - maskWidth - inset;
        // ctx.fillRect(
        //     maskX, 
        //     height / 2,
        //     maskWidth, 
        //     cellHeight + inputOutputGapSize / 2
        // );

        // ctx.fillStyle = 'black';
        // ctx.fillRect((n_train * cellWidthTotalAvailable) / count + inset - Math.floor(trainTestGapSize / 2), inset, trainTestGapSize, height - inset * 2);
        // ctx.fillRect((n_train * cellWidthTotalAvailable) / count + inset - Math.floor(trainTestGapSize / 2), inset, 1, height - inset * 2);
        // ctx.fillRect((n_train * cellWidthTotalAvailable) / count + inset - Math.floor(trainTestGapSize / 2), inset, 2, height - inset * 2);
        // ctx.fillRect((n_train * cellWidthTotalAvailable) / count + inset - Math.floor(trainTestGapSize / 2), 0, 2, height);

        return canvas;
    }    
}
