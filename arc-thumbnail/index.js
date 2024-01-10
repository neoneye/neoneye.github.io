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
            let encodedId = encodeURIComponent(id);
            let openUrl = `edit.html?task=${encodedId}`
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
            await storeCanvas(this.db, canvas, id);
        }
    }

    hideDemo() {
        document.getElementById('demo1').hidden = true;
        document.getElementById('demo2').hidden = true;
        document.getElementById('demo3').hidden = true;
    }

    hideOverlay() {
        document.getElementById("overlay").style.display = "none";
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
                let image = await fetchImage(this.db, id);
                // console.log('image', image);
                dataURL = URL.createObjectURL(image);
            } catch (error) {
                console.error(`Error loading image ${id}`, error);
                continue;
            }
                    
            // let canvas = task.toThumbnailCanvas(extraWide, 1);
            // let canvas = task.toCanvas(5, extraWide);
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

        this.hideOverlay();
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
