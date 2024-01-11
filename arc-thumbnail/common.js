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
        const openRequest = indexedDB.open(indexdb_database_name, 4);

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