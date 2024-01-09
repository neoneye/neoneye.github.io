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
        const openRequest = indexedDB.open(indexdb_database_name, 1);

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

async function saveCanvasToIndexedDB(db, canvas, id) {
    // Convert canvas to blob
    const blob = await new Promise((resolve) => canvas.toBlob(resolve));

    // Perform the transaction
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(indexdb_store_name_image, 'readwrite');
        let images = transaction.objectStore(indexdb_store_name_image);
        let request = images.put({ id: id, image: blob });

        request.onsuccess = function() {
            console.log("Image saved to DB");
            resolve(request.result);
        };

        request.onerror = function() {
            console.log("Error", request.error);
            reject(request.error);
        };
    });
}


async function retrieveImageFromIndexedDB(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(indexdb_store_name_image, "readonly");
        const store = transaction.objectStore(indexdb_store_name_image);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result ? request.result.image : null);
        request.onerror = event => reject("IndexedDB read error: " + event.target.errorCode);
    });
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

    toCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;
    
        const cellSize = 1;
        for (let y = 0; y < this.height; y += cellSize) {
            for (let x = 0; x < this.width; x += cellSize) {
                let pixel = this.pixels[y][x];
                ctx.fillStyle = color_palette[pixel];
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    
        return canvas;
    }
    
    cellSize(width, height) {
        let cellX = width / this.width;
        let cellY = height / this.height;
        return Math.floor(Math.min(cellX, cellY));
    }

    draw(ctx, drawX, drawY, width, height, cellSize, options) {
        const innerWidth = cellSize * this.width;
        const innerHeight = cellSize * this.height;
        let x0 = Math.floor(drawX + (width - innerWidth) / 2);
        var y0 = Math.floor(drawY + (height - innerHeight) / 2);
        if (options.alignTop) {
            y0 = drawY;
        }
        if (options.alignBottom) {
            y0 = drawY + height - innerHeight;
        }
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                let pixel = this.pixels[y][x];
                ctx.fillStyle = color_palette[pixel];
                ctx.fillRect(x0 + (x * cellSize), y0 + (y * cellSize), cellSize, cellSize);
            }
        }
    }    
}

class ARCPair {
    constructor(input, output) {
        this.input = new ARCImage(input);
        this.output = new ARCImage(output);
    }
}

class ARCTask {
    constructor(jsonData, openUrl) {
        this.jsonData = jsonData;
        this.train = jsonData.train.map(pair => new ARCPair(pair.input, pair.output));
        this.test = jsonData.test.map(pair => new ARCPair(pair.input, pair.output));
        this.openUrl = openUrl;
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

        let canvas = this.toCanvas(extraWide);
        thumbnailCtx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        return thumbnailCanvas;
    }

    toCanvas(extraWide) {
        let scale = 4;
        var width = 320 * scale;
        if (extraWide) {
            width *= 2;
        }
        let height = 150 * scale;
        let inset = 5 * scale;

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


class PageController {
    constructor() {
        this.db = null;
    }

    async onload() {
        this.db = await initializeDatabase();
        console.log('PageController.onload()', this.db);
        await this.loadBundle();
        // await this.loadNames();
    }

    async loadNames() {
        console.log('PageController.loadNames()');
        let names = [
            '0a2355a6',
            '0b17323b',
            '0bb8deee',
            '0becf7df',
            '0c786b71',
            '0c9aba6e',
            'landport_rotrev_00_56_33_87_02_54_99_68',
            'landport_rotrev_02_44_77_37_54_00',
            'ExtractObjects1',
            'ExtractObjects2',
            'ExtractObjects3',
            'InsideOutside1',
            'InsideOutside2',
            'InsideOutside3',
            'after_rain_l6bv83jfqxba4q8hzbg',
            'align_based_on_the_arrow_direction_l6afyzc2pjsb51gkdg',
            'AscendingOrder_l6abjqzwwo7mhobq52',
            '0a0a50ad',
            '0a0ac772',
            '0a0adaff',
            '3128a01f',
            '3875e525',
            '4325b823',
            'closure-filling-0',
            'closure-filling-1',
            'closure-filling-2',
            'shape-pattern-similarity-0',
            'shape-pattern-similarity-1',
            'shape-pattern-similarity-2',
            'referenceable-components',
            'surface-pixel-count',
            'vyaguzeoi',
        ];

        let new_names = [];
        for (let i = 0; i < 1; i += 1) {
            new_names = new_names.concat(names);
        }
        names = new_names;

        let tasks = [];
        for (let name of names) {
            try {
                let openUrl = `http://127.0.0.1:8090/task/${name}`
                let response = await fetch(`dataset/${name}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let jsonData = await response.json();
                let task = new ARCTask(jsonData, openUrl);
                tasks.push(task);
            } catch (error) {
                console.error("Error loading task:", name, error);
            }
        }

        console.log('Loaded tasks:', tasks.length);
        await this.renderTasks(tasks);
        await this.showTasks(tasks);
    }

    async loadBundle() {
        console.log('PageController.loadBundle()');

        let storedUTCTimestamp = localStorage.getItem('lastFetchedUTCTimestamp');
        console.log("JSON was fetched at UTC timestamp:", storedUTCTimestamp);

        try {
            let cachedData = await fetchData(this.db, 'bundle2');
            if (!cachedData) {
                console.log('No cached data. Fetching');

                // Fetch and decompress data if not in cache
                const response = await fetch('dataset/bundle2.json.gz');
                const arrayBuffer = await response.arrayBuffer();
                const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
                const jsonData = JSON.parse(decompressed);
    
                // Store in IndexedDB
                await storeData(this.db, 'bundle2', jsonData);
                
                // Update timestamp
                let utcTimestamp = Date.now();
                localStorage.setItem('lastFetchedUTCTimestamp', utcTimestamp.toString());
    
                let tasks = PageController.processData(jsonData);

                // Render thumbnails
                await this.renderTasks(tasks);

                await this.showTasks(tasks);
            } else {
                console.log('Using cached data');
                let tasks = PageController.processData(cachedData);
                await this.showTasks(tasks);
            }
        } catch (error) {
            console.error('Error loading bundle', error);
        }
    }

    static processData(jsonData) {
        console.log('processData called');

        let tasks = [];
        for (let key of Object.keys(jsonData)) {
            let dict = jsonData[key];
            let id = dict.id;
            let openUrl = `http://127.0.0.1:8090/task/${id}`
            let task = new ARCTask(dict, openUrl);
            tasks.push(task);
        }
        console.log('Loaded tasks:', tasks.length);

        return tasks;
    }

    async renderTasks(tasks) {
        console.log('Render tasks:', tasks.length);

        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];
            let count = task.train.length + task.test.length;
            let extraWide = (count > 6);
            let canvas = task.toThumbnailCanvas(extraWide, 1);

            let id = `task_${i}`;
            // This does background stuff, it's not async await
            // The code immediately after this gets executed before this the thumbnails have been stored to the database.
            await saveCanvasToIndexedDB(this.db, canvas, id);
        }
    }

    hideDemo() {
        document.getElementById('demo1').hidden = true;
        document.getElementById('demo2').hidden = true;
        document.getElementById('demo3').hidden = true;
    }

    async showTasks(tasks) {
        console.log('Show tasks:', tasks.length);
        this.hideDemo();

        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];

            let count = task.train.length + task.test.length;
            let extraWide = (count > 6);

            var dataURL = null;
            try {
                let id = `task_${i}`;
                let image = await retrieveImageFromIndexedDB(this.db, id);
                // console.log('image', image);
                dataURL = URL.createObjectURL(image);
            } catch (error) {
                console.error(`Error loading image ${id}`, error);
                continue;
            }
                    
            // let canvas = task.toThumbnailCanvas(extraWide, 1);
            // let canvas = task.toCanvas(extraWide);
            // dataURL = canvas.toDataURL();
    
            const el_img = document.createElement('img');
            el_img.className = 'gallery__img';
    
            const el_a = document.createElement('a');
            if (extraWide) {
                el_a.className = `gallery__item gallery__item__wide`;
            } else {
                el_a.className = 'gallery__item gallery__item__normal';
            }
            el_a.href = task.openUrl;
            el_a.appendChild(el_img);
    
            const el_gallery = document.getElementById('gallery');
            el_gallery.appendChild(el_a);
    
            el_img.src = dataURL;
        }
    }

    flushIndexedDB() {
        localStorage.removeItem('lastFetchedUTCTimestamp');

        const openRequest = indexedDB.open(indexdb_database_name, 1);

        openRequest.onsuccess = function() {
            let db = openRequest.result;
            let transaction = db.transaction('images', 'readwrite');
            let images = transaction.objectStore('images');
            let request = images.clear();

            request.onsuccess = function() {
                console.log("IndexedDB flushed");
            };

            request.onerror = function() {
                console.log("Error", request.error);
            };
        };
    }
}

var gPageController = null;
  
function body_onload() {
    gPageController = new PageController();
    (async () => {
        gPageController.onload();
    })();
}
