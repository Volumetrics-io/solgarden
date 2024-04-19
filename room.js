class Room {
    constructor(container, params) {
        this.container = container;

        this.needsUpdate = false;

        this.minRowCount = params.minRowCount ?? 4;
        this.minColCount = params.minColCount ?? 4;
        this.minFlrCount = params.minFlrCount ?? 1;

        this.maxRowCount = params.maxRowCount ?? 10;
        this.maxColCount = params.maxColCount ?? 10;
        this.maxFlrCount = params.maxFlrCount ?? 5;

        this.enemyCount = params.enemyCount ?? Math.floor(Math.random() * 2) + 1;
        this.loreCount = params.loreCount ?? 1;

        this.isDoor = params.isDoor ?? false;

        this.biomes = [{
                // plains
                name: "plains",
                path: "tiles/biome_plains/",
                tiles: ["tilegrass001.glb", "tilegrass002.glb", "tilegrass003.glb"],
                props: ["plant_01.glb", "plant_02.glb", "plant_03.glb", "plant_04.glb", "plant_05.glb"],
                block: ["rock001.glb"]
            },
            {
                // desert
                name: "desert",
                path: "tiles/biome_deserts/",
                tiles: ["tiledesert001.glb", "tiledesert002.glb", "tiledesert003.glb"],
                props: ["plant_05_to_test.glb"],
                block: ["rockdesert001.glb", "rockdesert002.glb"]
            }
        ]
        this.biome = params.biome ?? this.biomes[params.biomeId] ?? this.biomes[Math.floor(Math.random() * this.biomes.length)];

        // read the params, or generate a random geometry for the room
        this.flrCount = params.flrCount ?? Math.floor(Math.random() * (this.maxFlrCount - this.minFlrCount) + this.minFlrCount);
        this.rowCount = params.rowCount ?? Math.floor(Math.random() * (this.maxRowCount - this.minRowCount) + this.minRowCount);
        this.colCount = params.colCount ?? Math.floor(Math.random() * (this.maxColCount - this.minColCount) + this.minColCount);

        // this table contains an integer between 0 and the floor count
        // [ [0, 0, 0],
        //   [1, 1, 1],
        //   [2, 2, 2]]
        // results in a map that look like stairs
        this.heightMap = params.heightMap ?? Array.from({
                length: this.rowCount
            }, (_, x) =>
            Array.from({
                length: this.colCount
            }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.flrCount))
        );

        // this table contains an interactible or blocking entity
        // this includes the player. By default each cell contains 0
        // [ [rock,   0,       door ],
        //   [0,      player,  0    ],
        //   [0,      0,       rock ]]
        this.entityMap = params.entityMap ?? Array.from({
            length: this.rowCount
        }, () => Array(this.colCount).fill(0));

        // this table contains uninteractible props
        // like plants, zone indicators, etc
        // [ [0,      0,       0 ],
        //   [plant,  0,       0 ],
        //   [0,      plant,   0 ]]
        this.propMap = params.propMap ?? Array.from({
            length: this.rowCount
        }, () => Array(this.colCount).fill(0));

        // this tilemap contains the floor tile
        // floor tiles are the interactive entities that drive the interaction
        // the player will touch them to move, pick up items, attack, etc.
        // each cell of this table will contain a tile element
        // [ [tile,   tile,  tile ],
        //   [tile,   tile,  tile ],
        //   [tile,   tile,  tile ]]
        this.tilemap = params.tilemap ?? [];

        const numberOfAvailableSpots = this.rowCount * this.colCount;
        this.propCount = params.propCount ?? Math.ceil(numberOfAvailableSpots / 4);
        this.blockCount = params.blockCount ?? Math.ceil(numberOfAvailableSpots / 8);

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


        // player
        const player = document.createElement("mr-player");
        this.playerPos = params.playerPos ?? this.addToMap({
            el: player,
            type: 'player'
        }, this.entityMap);
        // this.addToMap(lore, this.entityMap);
        console.log(`Player position: { x: ${this.playerPos.x}, y: ${this.playerPos.y}}`)

        // door
        if (!this.isDoor) {
            const door = document.createElement("mr-door");
            this.addToMap({
                el: door,
                type: 'door'
            }, this.entityMap);
        }

        ///////////////////////////////////////////////
        // TODO: make solvable rooms
        // Now that we have the player and the door,
        // we can test using the pathfinder with the random
        // position we generate in addToMap
        ///////////////////////////////////////////////

        // lore
        for (let i = 0; i < this.loreCount; i++) {
            const el = document.createElement("mr-lore");
            const lore = {
                el: el,
                type: 'lore',
            };
            // this.addToEntityMap(lore);
            this.addToMap(lore, this.entityMap);
        }

        // enemies
        for (let i = 0; i < this.enemyCount; i++) {
            const el = document.createElement("mr-enemy");
            const enemy = {
                el: el,
                type: 'enemy',
                hp: 3,
                attack: Math.floor(Math.random() * 20) + 1
            };
            // this.addToEntityMap(enemy);
            this.addToMap(enemy, this.entityMap);
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
            // this.addToPropMap(prop);
            this.addToMap(prop, this.propMap);
        }

        // blocks
        for (let i = 0; i < this.blockCount; i++) {
            const el = document.createElement("mr-prop");
            el.dataset.tileset = this.biome.block;
            el.dataset.tilepath = this.biome.path;
            const prop = {
                el: el,
                type: 'prop'
            }
            this.addToMap(prop, this.entityMap);
            // this.addToEntityMap(prop);
        }

        // weapon
        // TODO: expose weaponCount
        const weapon = document.createElement("mr-melee-weapon");
        weapon.dataset.type = "short-sword";
        this.addToMap({
            el: weapon,
            type: 'weapon',
            subType: 'melee',
            name: 'short-sword',
            attack: 3
        }, this.entityMap);

        // key
        // TODO: expose isKey
        // const key = document.createElement("mr-key");
        // this.addToMap({
        //     el: key,
        //     type: 'key'
        // }, this.entityMap);

        // chests
        const chestCount = params.chestCount ?? (Math.random() * 2 | 0);
        for (let i = 0; i < chestCount; i++) {
            const randomChest = document.createElement("mr-chest");
            this.addToMap({
                el: randomChest,
                type: 'chest'
            }, this.entityMap);
        }

        this.entityMap.forEach(row => {
            row.forEach(entity => {
                if (entity) {
                    this.container.appendChild(entity.el);
                }
            });
        });

        this.propMap.forEach(row => {
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

        this.calculateDistancesFromPlayer();


        // Debug
        // this.printArray("this.heightMap", this.heightMap);
        // this.printArray("this.entityMap", this.entityMap);
        // this.printArray("this.propMap", this.propMap);
        // this.printArray("this.distances", this.distances);

    }

    // only used to debug
    printArray(string, array) {
        console.log(string);
        array.forEach(row => {
            console.log(row);
        })
    }

    addToMap(entity, map) {
        let inserted = false;
        let pos;

        while (!inserted) {
            const randRow = Math.floor(Math.random() * this.rowCount);
            const randCol = Math.floor(Math.random() * this.colCount);

            if (map[randRow][randCol] === 0) {
                map[randRow][randCol] = entity;
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

    calculateDistancesFromPlayer() {
        this.calculateDistances(this.playerPos.y, this.playerPos.x, this.entityMap);
        // this.printArray("this.distances", this.distances);
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
                    (blockmap[newY][newX] === 0 || blockmap[newY][newX].type != "prop")
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
            // const p = this.Animator.fanOut(t);
            const p = this.Animator.fanOut(t);
            const h = this.Animator.jump(t);

            let distR = entity.animation.x + entity.animation.distX * p;
            let distC = entity.animation.y + entity.animation.distY * p;
            let distF;

            if (entity.type == "enemy") {
                distF = h * 0.8;
            } else {
                distF = 0;
            }

            coor = {
                x: distC,
                y: this.heightMap[r][c] * 0.35 + 0.3 + distF,
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

        // TODO: use threejs directly
        // https://dustinpfister.github.io/2022/04/04/threejs-object3d-position/
        entity.el.object3D.position.x = coor.x - this.colCount / 2;
        // entity.el.object3D.position.y = coor.y + this.waveDeltaYAt(r, c, timer);
        entity.el.object3D.position.y = coor.y;
        entity.el.object3D.position.z = coor.z - this.rowCount / 2;
        // entity.el.dataset.position = `${coor.x - this.colCount / 2} ${coor.y + this.waveDeltaYAt(r, c, timer)} ${coor.z - this.rowCount / 2}`;
    }

    projectCoordinates(r, c) {
        return {
            x: c - this.colCount / 2,
            y: this.heightMap[r][c] * 0.35 + 0.3,
            z: r - this.rowCount / 2
        }
    }

    waveDeltaYAt(r, c, timer) {
        // return 0;
        // return Math.sin(timer + this.heightMap[r][c] / 1.5 + r / 10.5 + c / 1.5) / 100;
        return Math.sin(timer + this.heightMap[r][c] / 1.1 + r / 1.1 + c / 1.1) / 100;
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
        jump: time => {
            return -((2 * time - 1) * (2 * time - 1)) + 1;
        },
        softJump: time => {
            return 1 - (Math.cos(time * 2 * Math.PI) / 2 + 0.5);
        }
    };
}
