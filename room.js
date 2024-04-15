class Room {
    constructor(container, params) {
        this.container = container;

        this.minRowCount = params.minRowCount ?? 4;
        this.minColCount = params.minColCount ?? 4;
        this.minFlrCount = params.minFlrCount ?? 1;
        this.maxRowCount = params.maxRowCount ?? 10;
        this.maxColCount = params.maxColCount ?? 10;
        this.maxFlrCount = params.maxFlrCount ?? 4;

        this.enemyCount = params.enemyCount ?? Math.floor(Math.random() * 2) + 1;

        this.biomes = [{
            // plains
            name: "plains",
            path: "tiles/biome_plains/",
            tiles: ["tilegrass001.glb", "tilegrass002.glb", "tilegrass003.glb"],
            props: ["plant_01.glb", "plant_02.glb", "plant_03.glb", "plant_04.glb", "plant_05.glb", "rock001.glb"]
        },
        {
            // desert
            name: "desert",
            path: "tiles/biome_deserts/",
            tiles: ["tiledesert001.glb", "tiledesert002.glb", "tiledesert003.glb"],
            props: ["rockdesert001.glb", "rockdesert002.glb", "plant_05_to_test.glb"]
        }
        ]
        this.biome = params.biome ?? this.biomes[params.biomeId] ?? this.biomes[Math.floor(Math.random() * this.biomes.length)];

        // read the params
        this.flrCount = params.flrCount ?? Math.floor(Math.random() * (this.maxFlrCount - this.minFlrCount) + this.minFlrCount);
        this.rowCount = params.rowCount ?? Math.floor(Math.random() * (this.maxRowCount - this.minRowCount) + this.minRowCount);
        this.colCount = params.colCount ?? Math.floor(Math.random() * (this.maxColCount - this.minColCount) + this.minColCount);
        this.heightMap = params.heightMap ?? Array.from({
            length: this.rowCount
        }, (_, x) =>
            Array.from({
                length: this.colCount
            }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.flrCount))
        );
        this.entityMap = params.entityMap ?? Array.from({
            length: this.rowCount
        }, () => Array(this.colCount).fill(0));

        this.tilemap = params.tilemap ?? [];

        const numberOfAvailableSpots = this.rowCount * this.colCount;
        this.propCount = params.propCount ?? Math.floor(numberOfAvailableSpots / 6);

        console.log(`Floor: ${this.flrCount}; Rows: ${this.rowCount}; Cols: ${this.colCount}`);

        for (let r = 0; r < this.rowCount; r++) {
            const row = [];
            for (let c = 0; c < this.colCount; c++) {
                const el = document.createElement("mr-tile");
                el.dataset.tileset = this.biome.tiles;
                el.dataset.tilepath = this.biome.path;

                const tile = {
                    el: el,
                    pos: {
                        x: r,
                        y: c
                    }
                };


                row.push(tile);
            }
            this.tilemap.push(row);
        }

        // enemies
        for (let i = 0; i < this.enemyCount; i++) {
            const el = document.createElement("mr-enemy");
            const enemy = {
                el: el,
                type: 'enemy',
                hp: 3
            };
            this.addToEntityMap(enemy);
        }

        // props
        for (let i = 0; i < this.propCount; i++) {
            const el = document.createElement("mr-prop");
            el.dataset.tileset = this.biome.props;
            el.dataset.tilepath = this.biome.path;
            const prop = {
                el: el,
                type: 'prop'
            }
            this.addToEntityMap(prop);
        }

        // player
        const player = document.createElement("mr-player");
        this.playerPos = params.playerPos ?? this.addToEntityMap({
            el: player,
            type: 'player'
        });
        console.log(`Player position: { x: ${this.playerPos.x}, y: ${this.playerPos.y}}`)

        // chests
        const chestCount = params.chestCount ?? (Math.random() * 2 | 0);
        for (let i = 0; i < chestCount; i++) {
            const randomChest = document.createElement("mr-chest");
            this.addToEntityMap({
                el: randomChest,
                type: 'chest'
            });
        }

        this.entityMap.forEach(row => {
            row.forEach(entity => {
                if (entity) {
                    this.container.appendChild(entity.el);
                }
            });
        });

        this.tilemap.forEach(row => {
            row.forEach(tile => {
                this.container.appendChild(tile.el);
            });
        });

        this.printArray("this.heightMap", this.heightMap);
        this.printArray("this.entityMap", this.entityMap);

    }

    // only used to debug
    printArray(string, array) {
        console.log(string);
        array.forEach(row => {
            console.log(row);
        })
    }

    addToEntityMap(entity) {
        let inserted = false;
        let pos;

        while (!inserted) {
            const randRow = Math.floor(Math.random() * this.rowCount);
            const randCol = Math.floor(Math.random() * this.colCount);

            if (this.entityMap[randRow][randCol] === 0) {
                this.entityMap[randRow][randCol] = entity;
                inserted = true;
                pos = {
                    x: randRow,
                    y: randCol
                }
            }
        }
        return pos
    }

    moveEntity(x1, y1, x2, y2) {
        if (!this.entityMap[x1] || !this.entityMap[x1][y1]) {
            console.log("No object found at the source position.");
            return; // No object at the source position
        }

        if (!this.entityMap[x2] || this.entityMap[x2][y2] !== 0) {
            console.log("Target position is not empty or out of bounds.");
            return; // Target cell is not empty or out of bounds
        }

        // Move the object
        this.entityMap[x2][y2] = this.entityMap[x1][y1];
        this.entityMap[x1][y1] = 0; // Set the source cell to empty
        this.entityMap[x2][y2].animation = {
            started: false,
            x: x1,
            y: y1,
            distX: x2 - x1,
            distY: y2 - y1
        }
    }

    checkForDoor(container) {
        let isEnemy = false;
        let isDoor = false;
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {
                const entity = this.entityMap[r][c];
                if (entity.type == 'enemy') {
                    isEnemy = true;
                }
                if (entity.type == 'door') {
                    isDoor = true;
                }
            }
        }

        if (!isEnemy && !isDoor) {
            const el = document.createElement("mr-door");
            container.appendChild(el);

            const door = {
                el: el,
                type: 'door'
            };

            this.addToEntityMap(door);
        }
    }

    calculateDistancesFromPlayer() {
        this.calculateDistances(this.playerPos.y, this.playerPos.x, this.entityMap);
    }

    calculateDistances(x, y, blockmap) {

        // https://codepen.io/lobau/pen/XWQqVwy/6a4c88328ccf9f08befa5463af05708a
        const width = blockmap[0].length;
        const height = blockmap.length;

        // Initialize distances array with Infinity for unvisited cells
        this.distances = Array.from({
            length: height
        }, () =>
            Array(width).fill(Infinity)
        );
        this.distances[y][x] = 0; // Distance to itself is 0

        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            // [-1, -1],
            // [1, 1],
            // [-1, 1],
            // [1, -1]
        ];

        // Queue for BFS, starting with the specified cell
        let queue = [
            [x, y]
        ];

        while (queue.length > 0) {
            const [currentX, currentY] = queue.shift();

            for (let [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;

                // Check bounds and obstacles
                if (
                    newX >= 0 &&
                    newX < width &&
                    newY >= 0 &&
                    newY < height &&
                    blockmap[newY][newX] === 0
                ) {
                    // Calculate potential new distance
                    const newDistance = this.distances[currentY][currentX] + 1;

                    // Update distance if newDistance is smaller
                    if (newDistance < this.distances[newY][newX]) {
                        this.distances[newY][newX] = newDistance;
                        queue.push([newX, newY]);
                    }
                }
            }
        }
    }

    project(entity, r, c, timer) {

        let coor;

        if (entity.animation && !entity.animation.started) {
            entity.animation.started = true;
            entity.animation.timerStart = timer;
        }

        if (entity.animation) {
            const duration = 3; // seconds
            const startTime = timer - entity.animation.timerStart;

            const t = startTime * duration;
            const p = this.Animator.fanOut(t);

            let distR = entity.animation.x + entity.animation.distX * p;
            let distC = entity.animation.y + entity.animation.distY * p;

            coor = {
                x: distC,
                y: this.heightMap[r][c] * 0.35 + 0.3,
                z: distR
            };

            if (t > 1) {
                delete entity.animation;
            }

        } else {
            coor = {
                x: c,
                y: this.heightMap[r][c] * 0.35 + 0.3,
                z: r
            };
        }

        entity.el.dataset.position = `${coor.x - this.colCount / 2} ${coor.y + this.waveDeltaYAt(r, c, timer)} ${coor.z - this.rowCount / 2}`;
    }

    projectCoordinates(r, c) {
        return {
            x: c - this.colCount / 2,
            y: this.heightMap[r][c] * 0.35 + 0.3,
            z: r - this.rowCount / 2
        }
    }

    waveDeltaYAt(r, c, timer) {
        return 0;
        // return Math.sin(timer + this.heightMap[r][c] / 1.5 + r / 10.5 + c / 1.5) / 100;
        // return Math.sin(timer + this.heightMap[r][c] / 1.1 + r / 1.1 + c / 1.1) / 5;
    }

    getPlayerPos() {
        // TODO: find and return the player position
        // no more playerpos
    }

    Animator = {
        easeInOut: time => {
            return time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1;
        },
        easeOutBack: time => {
            return Math.pow(time - 1, 2) * ((1.70158 + 1) * (time - 1) + 1.70158) + 1;
        },
        elastic: time => {
            return Math.pow(2, -5 * time) * Math.sin(((time - 0.3 / 4) * (Math.PI * 2)) / 0.3) + 1;
        },
        fanOut: time => {
            return 2 / (1 + Math.pow(1000, -time)) - 1;
        },
        rollercoaster: time => {
            return (-1.15 * Math.sin(time * 7.7)) / (time * 7.7) + 1.15;
        },
        linear: time => {
            return time;
        },
    };
}