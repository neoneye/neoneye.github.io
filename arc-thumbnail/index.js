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
  
  function drawCheckerboard() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 320; 
    const height = 200; 
    const cellSize = 20; // Size of each checkerboard cell
    canvas.width = width;
    canvas.height = height;

    for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
            ctx.fillStyle = (x + y) % (cellSize * 2) === 0 ? 'black' : 'white';
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }

    return canvas;
}

// 2. Convert the canvas to a Blob and save it to IndexedDB
function saveCanvasToIndexedDB(canvas) {
    canvas.toBlob(blob => {
        const openRequest = indexedDB.open('checkerboardDB', 1);

        openRequest.onupgradeneeded = function() {
            let db = openRequest.result;
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images', { keyPath: 'id' });
            }
        };

        openRequest.onerror = function() {
            console.error("Error", openRequest.error);
        };

        openRequest.onsuccess = function() {
            let db = openRequest.result;
            let transaction = db.transaction('images', 'readwrite');
            let images = transaction.objectStore('images');
            let request = images.put({ id: 'checkerboard', image: blob });

            request.onsuccess = function() {
                console.log("Checkerboard saved to DB");
            };

            request.onerror = function() {
                console.log("Error", request.error);
            };
        };
    });
}

// 3. Retrieve the Blob from IndexedDB and display it
function retrieveImageFromIndexedDB() {
    const openRequest = indexedDB.open('checkerboardDB', 1);

    openRequest.onsuccess = function() {
        let db = openRequest.result;
        let transaction = db.transaction('images', 'readonly');
        let images = transaction.objectStore('images');
        let request = images.get('checkerboard');

        request.onsuccess = function() {
            if (request.result) {
                const imgURL = URL.createObjectURL(request.result.image);
                // const img = document.createElement('img');
                // img.src = imgURL;
                // document.body.appendChild(img);

                const imgElement = document.getElementById('showimage');
                if (imgElement) {
                    imgElement.src = imgURL;
                } else {
                    console.log('No image element found with id "showimage"');
                }
            } else {
                console.log("No image found in DB");
            }
        };

        request.onerror = function() {
            console.log("Error", request.error);
        };
    };
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
    constructor(jsonData) {
        this.jsonData = jsonData;
        this.train = jsonData.train.map(pair => new ARCPair(pair.input, pair.output));
        this.test = jsonData.test.map(pair => new ARCPair(pair.input, pair.output));
    }

    toCanvas(extraWide) {
        let scale = 4;
        var width = 320 * scale;
        if (extraWide) {
            width *= 2;
        }
        let height = 150 * scale;
        let inset = 8 * scale;

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
        ctx.fillStyle = '#282828';
        // ctx.fillStyle = 'black';
        ctx.fillRect(inset, inset, width - inset * 2, height - inset * 2);

        // ctx.fillStyle = 'black';
        // ctx.fillRect(inset, height / 2 - 1, width - inset * 2, 2);
    
        // ctx.fillStyle = '#ffffff';
        // ctx.fillRect((n_train * width) / count, 0, width - (n_train * width) / count, height);

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
            this.test[i].output.draw(ctx, x, y1, cellWidthWithoutGap, cellHeight, cellSize, {alignTop: true});
        }

        // for (let i = 1; i < count; i++) {
        //     ctx.fillStyle = 'black';
        //     ctx.fillRect((i * cellWidthTotalAvailable) / count + inset, inset, 1, height - inset * 2);
        // }
    
        ctx.fillStyle = '#d0a070';
        let maskWidth = (n_test * cellWidthTotalAvailable) / count;
        let maskX = width - maskWidth - inset;
        ctx.fillRect(
            maskX, 
            height / 2,
            maskWidth, 
            cellHeight + inputOutputGapSize / 2
        );

        ctx.fillStyle = 'black';
        ctx.fillRect((n_train * cellWidthTotalAvailable) / count + inset - Math.floor(trainTestGapSize / 2), inset, trainTestGapSize, height - inset * 2);

        return canvas;
    }    
}


class PageController {
    constructor() {
        // this.start();
        this.load();
    }

    start() {
        const canvas = drawCheckerboard();
        document.body.appendChild(canvas);
        saveCanvasToIndexedDB(canvas);

        // Optionally, call this function to retrieve and display the image
        // retrieveImageFromIndexedDB();
    }

    async loadTaskData(url) {
        let response = await fetch(url);
        let jsonData = await response.json();
        return new ARCTask(jsonData);
    }

    async load() {
        console.log('PageController.load()');
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
        for (let i = 0; i < 10; i += 1) {
            new_names = new_names.concat(names);
        }
        names = new_names;

        let tasks = [];
        for (let name of names) {
            try {
                let response = await fetch(`dataset/${name}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let jsonData = await response.json();
                let task = new ARCTask(jsonData);
                tasks.push(task);
            } catch (error) {
                console.error("Error loading task:", name, error);
            }
        }

        console.log('Loaded tasks:', tasks.length);

        document.getElementById('demo1').hidden = true;
        document.getElementById('demo2').hidden = true;
        document.getElementById('demo3').hidden = true;

        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];

            let count = task.train.length + task.test.length;
            let extraWide = (count > 6);

            let canvas = task.toCanvas(extraWide);
    
            const el_img = document.createElement('img');
            el_img.className = 'gallery__img';
    
            const el_figure = document.createElement('figure');
            if (extraWide) {
                el_figure.className = `gallery__item gallery__item__wide`;
            } else {
                el_figure.className = 'gallery__item gallery__item__normal';
            }
            el_figure.appendChild(el_img);
    
            const el_gallery = document.getElementById('gallery');
            el_gallery.appendChild(el_figure);
    
            el_img.src = canvas.toDataURL();
        }
    }
}

var gPageController = null;
  
function body_onload() {
    gPageController = new PageController();
}
