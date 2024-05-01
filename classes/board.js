class Board {
    constructor(container, params) {
        this.container = container;
        this.levelId = params.levelId ?? 0;

        this.isDebug = params.isDebug ?? false;

        this.minRowCount = params.minRowCount ?? 5;
        this.minColCount = params.minColCount ?? 4;
        this.minFlrCount = params.minFlrCount ?? 1;

        this.maxRowCount = params.maxRowCount ?? 10;
        this.maxColCount = params.maxColCount ?? 4;
        this.maxFlrCount = params.maxFlrCount ?? 4;

        this.enemyCount = params.enemyCount ?? Math.floor(Math.random() * 2) + 1;
        this.isLore = params.isLore ?? true;
        this.isDoor = params.isDoor ?? false;

        this.isQuake = false;
        // this.quakeTimerStart = 0;
        // this.quakeHasStarted = false;
        // this.quakePos = {
        //     x: 0,
        //     y: 0
        // }
        // this.quakeSpeed = 3;
        // this.quakeForce = 0.2; // 0.5

        // TODO: biome soundtrack sound be here
        this.biomes = [{
                // plains
                name: "plains",
                path: "biomes/plains/",
                // audio: "/audio/farm.mp3",
                tiles: ["tilegrass001.glb", "tilegrass002.glb", "tilegrass003.glb"],
                props: ["plant_01.glb", "plant_02.glb", "plant_03.glb", "plant_04.glb", "plant_05.glb"],
                block: ["rock001.glb"]
            },
            {
                // desert
                name: "desert",
                path: "biomes/deserts/",
                // audio: "/audio/badlands.mp3",
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
            }, (_, y) => Math.floor(this.smoothNoise(x * 0.5, y * 0.5) * this.flrCount))
        );

        // this table contains an interactible or blocking entity
        // this includes the player. By default each cell contains 0
        // [ [rock,   0,       door ],
        //   [0,      player,  0    ],
        //   [0,      0,       rock ]]
        this.entityMap = params.entityMap ?? Array.from({
            length: this.rowCount
        }, () => Array(this.colCount).fill(0));

        // console.log(this.entityMap)

        // this table contains uninteractible props
        // like plants, zone indicators, etc
        // [ [0,      0,       0 ],
        //   [plant,  0,       0 ],
        //   [0,      plant,   0 ]]
        this.propMap = params.propMap ?? Array.from({
            length: this.rowCount
        }, () => Array(this.colCount).fill(0));

        // this tileMap contains the floor tile
        // floor tiles are the interactive entities that drive the interaction
        // the player will touch them to move, pick up items, attack, etc.
        // each cell of this table will contain a tile element
        // [ [tile,   tile,  tile ],
        //   [tile,   tile,  tile ],
        //   [tile,   tile,  tile ]]
        this.tileMap = params.tileMap ?? [];

        const availSpots = this.rowCount * this.colCount;
        this.propCount = params.propCount ?? Math.ceil(availSpots / 8);
        this.blockCount = params.blockCount ?? Math.ceil(availSpots / 8);

        // will hold all the visual effect elements
        // like poofs, projectiles, etc.
        this.effectList = [];

        if (this.isDebug) {
            console.log(`Floor: ${this.flrCount}`);
            console.log(`Rows: ${this.rowCount}`);
            console.log(`Cols: ${this.colCount}`);
        }

        // generate all the random floor tiles
        // based on the random tile set
        for (let r = 0; r < this.rowCount; r++) {
            const row = [];
            for (let c = 0; c < this.colCount; c++) {

                const el = document.createElement("mr-tile");
                const rand = Math.floor(Math.random() * this.biome.tiles.length);
                const tilemodel = this.biome.tiles[rand];
                el.dataset.model = this.biome.path + this.biome.tiles[rand];

                const tile = {
                    el: el,
                    pos: {
                        x: r,
                        y: c
                    }
                };
                row.push(tile);
            }
            this.tileMap.push(row);
        }

        // player
        const player = document.createElement("mr-player");
        this.playerPos = this.addToMap({
            el: player,
            type: 'player'
        }, this.entityMap);

        // door
        const door = document.createElement("mr-door");
        if (this.biome.name == 'battery') door.dataset.hasKey = true;
        this.doorPos = this.addToMap({
            el: door,
            type: 'door'
        }, this.entityMap)

        // lore
        // 10% of the time
        if (this.isLore && Math.random() < 0.1) {
            const el = document.createElement("mr-lore");
            const lore = {
                el: el,
                type: 'lore',
            };
            this.addToMap(lore, this.entityMap);
        }

        // enemies
        for (let i = 0; i < this.enemyCount; i++) {
            const EnemySubtypes = [
                'static',
                'homing',
                'aimless',
                // 'horse'
            ]

            const rand = Math.floor(Math.random() * EnemySubtypes.length);
            const subtype = EnemySubtypes[rand];

            const el = document.createElement("mr-enemy");
            const hp = this.levelId / 4 + Math.random() * this.levelId / 4;
            const attack = Math.floor(Math.random() * 2 + 1);

            // console.log(subtype);

            // el.dataset.hp = hp;
            // el.dataset.attack = attack;
            el.dataset.subtype = subtype;
            const enemy = {
                el: el,
                type: 'enemy',
                subtype: subtype,
                hp: hp,
                attack: attack
            };
            this.addToMap(enemy, this.entityMap);

            if (this.isDebug) console.log(enemy);
        }

        // props
        // plants, things the player can walk on
        for (let i = 0; i < this.propCount; i++) {
            const el = document.createElement("mr-prop");
            el.dataset.tileset = this.biome.props;
            el.dataset.tilepath = this.biome.path;
            const prop = {
                el: el,
                type: 'prop'
            }
            this.addToMap(prop, this.propMap);
        }

        // blocks
        // rocks, etc. Things that block the player
        for (let i = 0; i < this.blockCount; i++) {
            const el = document.createElement("mr-prop");
            el.dataset.tileset = this.biome.block;
            el.dataset.tilepath = this.biome.path;
            const prop = {
                el: el,
                type: 'prop'
            }
            this.addToMap(prop, this.entityMap);
        }


        // This is the spawn room
        if (this.levelId == 0) {

            // weapon
            const twig = document.createElement("mr-weapon");
            twig.dataset.model = "twig"

            this.addToMap({
                el: twig,
                type: 'weapon',
                subtype: 'melee',
                name: 'twig',
                range: 1,
                attack: 1
            }, this.entityMap);

            // key
            const key = document.createElement("mr-key");
            this.addToMap({
                el: key,
                type: 'key'
            }, this.entityMap);
        }

        // chests
        const isChest = params.isChest ?? true;
        if (isChest && Math.random() < 0.15) {
            const randomChest = document.createElement("mr-chest");
            this.addToMap({
                el: randomChest,
                type: 'chest'
            }, this.entityMap);
        }

        // Health drop in the battery room
        if (this.biome.name == 'battery') {
            const healthLoot = document.createElement("mr-loot");
            healthLoot.dataset.effect = "health";

            // twig.dataset.model = "twig"
            this.addToMap({
                el: healthLoot,
                type: 'loot',
                effect: "health"
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

        this.tileMap.forEach(row => {
            row.forEach(tile => {
                this.container.appendChild(tile.el);
            });
        });

        this.calcDistFromPlayer();

        if (this.isDebug) {
            this.printArray("this.heightMap", this.heightMap);
            this.printArray("this.entityMap", this.entityMap);
            this.printArray("this.propMap", this.propMap);
            this.printArray("this.distances", this.distances);
        }
    }

    // only used to debug
    printArray(string, array) {
        console.log(string);
        array.forEach(row => {
            console.log(row);
        })
    }

    startQuakeAt(x, y, force, frequence, duration) {
        this.quakePos = {
            x: x,
            y: y
        };
        this.isQuake = true;
        this.quakeHasStarted = false;
        this.quakeDuration = duration;
        this.quakeForce = force;
        this.quakeFrequence = frequence;
    }

    addToMap(entity, map) {
        let inserted = false;
        let pos;

        while (!inserted) {
            let randRow;
            let randCol = Math.floor(Math.random() * this.colCount);
            let distanceToDoor = Infinity;

            if (entity.type == "player") {
                randRow = 0;
            } else if (entity.type == "door") {
                randRow = this.rowCount - 1;
            } else {
                randRow = Math.floor(Math.random() * (this.rowCount - 2) + 1);

                // make a copy of the entity map
                // this temporary array is used to determine
                // if there would still be a solution if we
                // add the element at the random position.
                let tempMap = map.map(function(arr) {
                    return arr.slice();
                });

                // add the entity to the array copy
                tempMap[randRow][randCol] = entity;

                // calc distances with the entity
                // and see if there is a possible solution
                let dist = this.calcDist(this.playerPos.y, this.playerPos.x, tempMap);
                distanceToDoor = dist[this.doorPos.x][this.doorPos.y];
            }

            if (entity.type == "player" ||
                entity.type == "door" ||
                (map[randRow][randCol] === 0 && distanceToDoor != Infinity)) {
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

        // TODO: this probably should be an ECS?
        this.entityMap[x2][y2].animation = {
            speed: 3,
            started: false,
            x: x1,
            y: y1,
            distX: x2 - x1,
            distY: y2 - y1
        }
    }

    movePlayer(x, y) {
        this.moveEntity(this.playerPos.x, this.playerPos.y, x, y);
        this.playerPos.x = x;
        this.playerPos.y = y;
    }

    replaceEntity(r, c, entity) {
        this.entityMap[r][c] = entity;
    }

    showDamageAt(r, c, damage) {
        this.entityMap[r][c].el.showDamage(damage);
    }

    openDoor() {
        const x = this.doorPos.x;
        const y = this.doorPos.y;
        this.entityMap[x][y].el.open();
    }

    calcDistFromPlayer() {
        this.distances = this.calcDist(this.playerPos.y, this.playerPos.x, this.entityMap);
        // this.printArray("this.distances", this.distances);
    }

    calcDist(x, y, blockmap) {

        // https://codepen.io/lobau/pen/XWQqVwy/6a4c88328ccf9f08befa5463af05708a
        const width = blockmap[0].length;
        const height = blockmap.length;

        // Initialize distances array with Infinity for unvisited cells
        const distances = Array.from({
                length: height
            }, () =>
            Array(width).fill(Infinity)
        );
        distances[y][x] = 0; // Distance to itself is 0

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
                    const newDistance = distances[currentY][currentX] + 1;

                    // Update distance if newDistance is smaller
                    if (newDistance < distances[newY][newX]) {
                        distances[newY][newX] = newDistance;
                        queue.push([newX, newY]);
                    }
                }
            }
        }

        return distances;
    }

    project(entity, r, c, timer) {

        let coor;
        let floorY;

        if (this.isQuake) {

            const startTime = timer - this.quakeTimerStart;

            const t = startTime / this.quakeDuration;
            const x = this.quakePos.x;
            const y = this.quakePos.y;

            const dx = r - x;
            const dy = c - y;

            // const scale = 2;

            // distance between tile and player
            const dist = Math.sqrt(dx * dx + dy * dy + t) + 1;

            // a hyperbolic function crashing the amplitude to 0
            const falloff = 1 / (10 * t + 1) - 0.0909;

            // a cool looking function that simulate a wave propagating
            // https://www.youtube.com/watch?v=ciUNizDgiOs
            // the amplitude decreases with the distance
            const amplitude = Math.sin(dist + t * this.quakeFrequence) / (dist * 10);

            // the Y offset, product of the amplitude and the falloff
            // the -1 is for the motion to go down first, like it got hit
            const offsetY = -1 * amplitude * falloff * this.quakeForce;

            // The base floor Y used for the rest of the calculations.
            floorY = this.heightMap[r][c] * 0.35 + 0.3 + offsetY * 2;
        } else {
            floorY = this.heightMap[r][c] * 0.35 + 0.3;
        }

        if (entity.animation && !entity.animation.started) {
            entity.animation.started = true;
            entity.animation.timerStart = timer;
        }

        if (entity.animation) {
            // const speed = 3;
            const startTime = timer - entity.animation.timerStart;

            const t = startTime * entity.animation.speed;
            // const p = Animator.fanOut(t);
            const p = Animator.fanOut(t);
            const h = Animator.jump(t);

            let distR = entity.animation.x + entity.animation.distX * p;
            let distC = entity.animation.y + entity.animation.distY * p;
            let distF;

            if (entity.type == "enemy") {
                if (entity.subtype == 'homing') {
                    distF = 0;
                } else if (entity.subtype == 'aimless') {
                    distF = h * 0.7;
                } else {
                    distF = 0;
                }

            } else if (entity.type == "projectile") {
                // projectiles
                distF = h * 2;

                // projectiles move linearly
                // so we use t instead of p for the progress
                distR = entity.animation.x + entity.animation.distX * t;
                distC = entity.animation.y + entity.animation.distY * t;

            } else {
                // this is the player
                distF = h * 0.8;
            }

            coor = {
                x: distC,
                y: floorY + distF,
                z: distR
            };

            if (t > 1) {
                coor = {
                    x: c,
                    y: floorY,
                    z: r
                };
                delete entity.animation;
            }

        } else {
            // console.log("is this a tile?")
            coor = {
                x: c,
                y: floorY,
                z: r
            };
        }

        // the offset is to center the board in the table
        entity.el.object3D.position.x = coor.x - this.colCount / 2 + 0.5;
        entity.el.object3D.position.y = coor.y;
        entity.el.object3D.position.z = coor.z - this.rowCount / 2 + 0.5;
    }

    projectileTo(startPos, endPos) {

        const particle = document.createElement("mr-projectile");
        particle.dataset.foo = "bar";
        this.container.appendChild(particle);

        this.effectList.push({
            el: particle,
            type: 'projectile',
            r: startPos.x,
            c: startPos.y,
            animation: {
                speed: 2,
                started: false,
                x: startPos.x,
                y: startPos.y,
                distX: endPos.x - startPos.x,
                distY: endPos.y - startPos.y
            }
        })
    }

    // projectCoordinates(r, c) {
    //     return {
    //         x: c - this.colCount / 2,
    //         y: this.heightMap[r][c] * 0.35 + 0.3,
    //         z: r - this.rowCount / 2
    //     }
    // }

    // waveDeltaYAt(r, c, timer) {
    //     // return 0;
    //     // return Math.sin(timer + this.heightMap[r][c] / 1.5 + r / 10.5 + c / 1.5) / 100;
    //     return Math.sin(timer + this.heightMap[r][c] / 1.1 + r / 1.1 + c / 1.1) / 100;
    // }

    getPlayerPos() {
        return this.playerPos;
    }

    distBetween(x1, y1, x2, y2) {
        var distX = x1 - x2;
        var distY = y1 - y2;
        return Math.sqrt(distX * distX + distY * distY);
    }

    updateFloor(state, timer) {
        const ppos = this.getPlayerPos();

        // Quake is about to start
        if (this.isQuake && !this.quakeHasStarted) {
            this.quakeHasStarted = true;
            this.quakeTimerStart = timer;
        }

        // Quake is running
        if (this.isQuake && this.quakeHasStarted) {

            if (timer - this.quakeTimerStart > this.quakeDuration) {
                console.log("quake is over")
                this.isQuake = false;
            }
        }

        this.tileMap.forEach(row => {
            row.forEach(tile => {

                const x = tile.pos.x;
                const y = tile.pos.y;
                const el = tile.el;

                // const x = parseInt(tile.el.dataset.x);
                // const y = parseInt(tile.el.dataset.y);

                this.project(tile, x, y, timer);

                if (state.isPlayerTurn) {
                    const dist = this.distances[x][y];
                    const entity = this.getEntityAt(x, y);
                    const ppos = this.getPlayerPos();

                    // is the tile reachable by walking (pathfinder distance)
                    const isReachable = (
                        dist != Infinity &&
                        dist <= state.action &&
                        dist > 0);

                    //  combat related distances are Euclidean
                    const rawDist = this.distBetween(x, y, ppos.x, ppos.y);

                    let attackRange;
                    if (state.selectedWeapon == 'melee') {
                        attackRange = state.meleeRange;
                    } else if (state.selectedWeapon == 'range') {
                        attackRange = state.rangeRange;
                    } else {
                        console.error('Illegal value for selectedWeapon.');
                    }

                    if (!entity) {
                        if (isReachable) {
                            // the tile is floor, and in reach
                            el.tileColor('white');
                            el.setCostIndicator(dist);
                        } else {
                            // floor, but too far for current action points
                            el.hideTile();
                        }

                    } else if (entity.type == "loot" ||
                        entity.type == "lore" ||
                        entity.type == "key" ||
                        entity.type == "weapon" ||
                        entity.type == "chest"
                    ) {
                        if (isReachable) {
                            // the tile is floor, and in reach
                            el.tileColor('glow-white');
                            el.setCostIndicator(dist);
                        } else {
                            // floor, but too far for current action points
                            el.tileColor('neutral');
                            el.setCostIndicator("");
                        }

                    } else if (entity.type == "door") {

                        if (state.hasKey && isReachable) {
                            el.tileColor('range');
                        } else if (isReachable) {
                            el.tileColor('health');
                        } else {
                            el.tileColor('neutral');
                        }
                        el.setCostIndicator("");

                    } else if (entity.type == "enemy") {

                        // if the enemy is in attack range
                        if (rawDist <= attackRange) {
                            el.tileColor('health');
                            el.setCostIndicator("×");
                        } else {
                            el.tileColor('neutral');
                            el.setCostIndicator("×");
                        }

                    } else if (entity.type == "player") {
                        el.hideTile();
                    } else if (entity.type == "prop") {
                        el.hideTile();
                    }

                    // If either melee or range weapon is hovered
                    if (state.hoverMelee) {
                        if (rawDist <= state.meleeRange) {
                            el.tileColor('health');
                            el.setCostIndicator('');
                        } else {
                            el.hideTile();
                        }
                    }
                    if (state.hoverRange) {
                        if (rawDist <= state.rangeRange) {
                            el.tileColor('health');
                            el.setCostIndicator('');
                        } else {
                            el.hideTile();
                        }
                    }

                } else {
                    el.hideTile();
                }
            })
        })
    }

    projectEverything(timer) {
        // all the elements that are on the board
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {
                const entity = this.entityMap[r][c];
                if (entity != 0) {
                    this.project(entity, r, c, timer);
                }

                const prop = this.propMap[r][c];
                if (prop != 0) {
                    this.project(prop, r, c, timer);
                }
            }
        }
    }

    projectAnimatedEntities(timer) {
        // during animations, we want entities to update
        // regardless of the needsUpdate flag
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {

                const entity = this.entityMap[r][c];
                // entity.animation gets removed when
                // the animation ends
                if (entity != 0 && entity.animation) {
                    this.project(entity, r, c, timer);
                }
            }
        }

        // all the elements that don't care about the
        // board positon, like visual effects
        // for (let i = 0; i < this.effectList.length; i++) {
        //     const entity = this.effectList[i];
        //     if (entity.animation) {
        //         this.project(entity, entity.r, entity.c, timer);
        //     } else {
        //         // if .animation was removed, it means
        //         // the animation was completed.
        //         // Now we need to remove the entity from the array
        //     }
        // }

        // Remove the elements with a completed animation
        // and animate the other ones.
        for (let i = this.effectList.length - 1; i >= 0; i--) {
            const entity = this.effectList[i];
            if (entity.animation) {
                this.project(entity, entity.r, entity.c, timer);
            } else {
                // Remove the entity from the array since its animation is completed
                this.effectList.splice(i, 1);
                entity.el.remove();
            }
        }
    }

    getEntityAt(r, c) {
        // this is on the map
        if (r >= 0 && r < this.rowCount &&
            c >= 0 && c < this.colCount) {

            if (this.entityMap[r]) {
                if (this.entityMap[r][c]) {
                    return this.entityMap[r][c];
                }
                return false;
            }
            return false;
        }
        // if the cell is not on the board
        // we return a special value
        return "offmap";
    }

    removeEntityAt(r, c) {
        this.entityMap[r][c] = 0;
    }

    getCostFor(x, y, state) {
        let projectedCost = 0;

        const entity = this.entityMap[x][y];

        if (!entity.type ||
            entity.type == "loot" ||
            entity.type == "key" ||
            entity.type == "weapon" ||
            entity.type == "lore" ||
            entity.type == "door"
        ) {
            // the tile is empty, so cost is distance
            projectedCost = this.distances[x][y];

        } else if (entity.type == 'enemy') {
            const ppos = this.getPlayerPos();
            const dist = this.distBetween(x, y, ppos.x, ppos.y);

            // console.log(dist)
            // if(dist <= state.getWeaponRange)
            if (state.selectedWeapon == 'melee' && dist <= state.meleeRange) {
                projectedCost = 1;
            } else if (state.selectedWeapon == 'range' && dist <= state.rangeRange) {
                projectedCost = 3;
            }
        }

        return projectedCost;
    }

    /////////////////////////////////////////////////////////////
    // lerp, noise, and smoothNoise are generating the heightMap.
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    noise(x, y) {
        const random = Math.floor(Math.random() * 99999);
        const n = Math.sin(x * 12.9898 + y * 78.233 + random) * 43758.5453;
        return n - Math.floor(n);
    }

    smoothNoise(x, y) {
        // Interpolate between four corners
        const intX = Math.floor(x);
        const intY = Math.floor(y);
        const fracX = x - intX;
        const fracY = y - intY;

        const v1 = this.noise(intX, intY);
        const v2 = this.noise(intX + 1, intY);
        const v3 = this.noise(intX, intY + 1);
        const v4 = this.noise(intX + 1, intY + 1);

        const i1 = this.lerp(v1, v2, fracX);
        const i2 = this.lerp(v3, v4, fracX);
        return this.lerp(i1, i2, fracY);
    }
    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////

}
