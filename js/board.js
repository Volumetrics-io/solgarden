class Board {
    constructor(container, params) {
        this.container = container;

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

        // TODO: biome soundtrack sound be here
        this.biome = params.biome ?? BIOMES[params.biomeId] ?? BIOMES[Math.floor(Math.random() * BIOMES.length)];

        // read the params, or generate a random geometry for the room
        this.floorCount = params.floorCount ?? Math.floor(Math.random() * (this.maxFlrCount - this.minFlrCount) + this.minFlrCount);
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
            }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.floorCount))
        );

        // this table contains: player, enemies, blocks (like rocks)
        // This is the table used for pathfinding (mouvements, combat)
        // By default each cell contains 0
        // [ [rock,   0,       0    ],
        //   [0,      player,  0    ],
        //   [0,      0,       rock ]]
        this.entityMap = params.entityMap ?? Array.from({
            length: this.rowCount
        }, () => Array(this.colCount).fill(0));

        // this table contains lootable entities like
        // health pickup, key, weapons, etc
        // anything that the player pick up when visiting the cell
        // [ [0,      0,       door ],
        //   [bow,    0,       0    ],
        //   [0,      0,       key  ]]
        this.lootMap = params.lootMap ?? Array.from({
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

        // this tileMap contains the floor tile
        // floor tiles are the interactive entities that drive the interaction
        // the player will touch them to move, pick up items, attack, etc.
        // each cell of this table will contain a tile element
        // [ [tile,   tile,  tile ],
        //   [tile,   tile,  tile ],
        //   [tile,   tile,  tile ]]
        this.tileMap = params.tileMap ?? [];

        const availSpots = this.rowCount * this.colCount;
        this.propCount = params.propCount ?? Math.ceil(availSpots / 4);
        this.blockCount = params.blockCount ?? Math.ceil(availSpots / 8);

        // will hold all the visual effect elements
        // like poofs, projectiles, etc.
        this.effectList = [];

        if (STATE.isDebug) {
            console.log(`Floor: ${this.floorCount}`);
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

        // Set the location of the player and the door
        if (STATE.level == 0) {
            STATE.ppos = {
                x: 1,
                y: 1,
            }
            STATE.dpos = {
                x: 5,
                y: 0,
            }
        } else {
            STATE.ppos = {
                x: 0,
                y: Math.floor(Math.random() * this.colCount),
            }
            STATE.dpos = {
                x: this.rowCount - 1,
                y: Math.floor(Math.random() * this.colCount),
            }
        }
        this.playerEl = document.createElement("mr-player");
        this.entityMap[STATE.ppos.x][STATE.ppos.y] = {
            el: this.playerEl,
            type: 'player'
        }
        this.doorEl = document.createElement("mr-door");
        this.lootMap[STATE.dpos.x][STATE.dpos.y] = {
            el: this.doorEl,
            type: 'door'
        }

        if (this.biome.name == 'battery') {
            STATE.hasKey = true;
            this.doorEl.open();
        }

        // lore
        // 10% of the time

        // TODO: convert lore in action upgrade
        // if (this.isLore && Math.random() < 0.1) {
        //     const el = document.createElement("mr-lore");
        //     const lore = {
        //         el: el,
        //         type: 'lore',
        //     };
        //     this.addToLootMap(lore);
        // }

        // enemies
        for (let i = 0; i < this.enemyCount; i++) {

            const rand = Math.floor(Math.random() * ENEMY_SUBTYPES.length);
            const subtype = ENEMY_SUBTYPES[rand];

            const el = document.createElement("mr-enemy");
            const hp = STATE.level / 4 + Math.random() * STATE.level / 4;
            const attack = Math.floor(Math.random() * 2 + STATE.level / 8);

            el.dataset.subtype = subtype;
            this.addToMap({
                el: el,
                type: 'enemy',
                subtype: subtype,
                hp: hp,
                attack: attack
            });

            if (STATE.isDebug) console.log(enemy);
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
            this.addToPropMap(prop);
        }

        // blocks
        // rocks, etc. Things that block the player
        for (let i = 0; i < this.blockCount; i++) {
            const el = document.createElement("mr-prop");
            el.dataset.tileset = this.biome.block;
            el.dataset.tilepath = this.biome.path;
            this.addToMap({
                el: el,
                type: 'prop'
            });
        }

        // chests
        const isChest = params.isChest ?? true;
        if (isChest && Math.random() < 0.15) {
            const randomChest = document.createElement("mr-chest");
            this.addToMap({
                el: randomChest,
                type: 'chest'
            });
        }

        // Health drop in the battery room
        if (this.biome.name == 'battery') {
            const rand = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < rand; i++) {
                const loot = document.createElement("mr-loot");
                loot.dataset.effect = "health";
                this.addToLootMap({
                    el: loot,
                    type: 'loot',
                    effect: "health"
                });
            }
        }

        this.entityMap.forEach(row => {
            row.forEach(entity => {
                if (entity) {
                    this.container.appendChild(entity.el);
                }
            });
        });

        this.lootMap.forEach(row => {
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

        this.updateDistances();

        if (STATE.isDebug) {
            printArray("this.heightMap", this.heightMap);
            printArray("this.entityMap", this.entityMap);
            printArray("this.lootMap", this.lootMap);
            printArray("this.propMap", this.propMap);
            printArray("this.distances", this.distances);
        }
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

    addToMap(entity) {
        let inserted = false;

        while (!inserted) {
            let row = Math.floor(Math.random() * (this.rowCount - 2) + 1);
            let col = Math.floor(Math.random() * this.colCount);
            let distanceToDoor = Infinity;

            // make a copy of the entity map
            // this temporary array is used to determine
            // if there would still be a solution if we
            // add the element at the random position.
            let tempMap = this.entityMap.map(function(arr) {
                return arr.slice();
            });

            // add the entity to the array copy
            tempMap[row][col] = entity;

            // calc distances with the entity
            // and see if there is a possible solution
            let dist = this.calcDist(STATE.ppos.y, STATE.ppos.x, tempMap);
            distanceToDoor = dist[STATE.dpos.x][STATE.dpos.y];

            if (this.entityMap[row][col] === 0 &&
                this.lootMap[row][col] === 0 &&
                distanceToDoor != Infinity) {

                this.entityMap[row][col] = entity;
                inserted = true;
            }
        }
    }

    addToPropMap(entity) {
        let inserted = false;
        while (!inserted) {
            let row = Math.floor(Math.random() * (this.rowCount - 2) + 1)
            let col = Math.floor(Math.random() * this.colCount);

            if (this.propMap[row][col] === 0) {
                this.propMap[row][col] = entity;
                inserted = true;
            }
        }
    }

    addToLootMap(entity) {
        let inserted = false;
        while (!inserted) {
            let row = Math.floor(Math.random() * (this.rowCount - 2) + 1);
            let col = Math.floor(Math.random() * this.colCount);

            if (this.entityMap[row][col] === 0 &&
                this.lootMap[row][col] === 0) {

                this.lootMap[row][col] = entity;
                inserted = true;
            }
        }
    }

    moveEntity(x1, y1, x2, y2) {
        if (!this.entityMap[x1] || !this.entityMap[x1][y1]) {
            console.log("No object found at the source position.");
            return;
        } else if (!this.entityMap[x2] || this.entityMap[x2][y2] !== 0) {
            console.log("Target position is not empty or out of bounds.");
            return;
        }

        // Move the object
        this.entityMap[x2][y2] = this.entityMap[x1][y1];
        this.entityMap[x1][y1] = 0;

        // TODO: this probably should be an ECS?
        this.entityMap[x2][y2].animation = {
            type: 'move',
            speed: 5,
            started: false,
            x: x1,
            y: y1,
            distX: x2 - x1,
            distY: y2 - y1
        }
    }

    movePlayer(x, y) {

        // the path finder needs an obstacle map
        // we can just copy the entity map
        const blockmap = this.entityMap.map(function(arr) {
            return arr.slice();
        });

        // remove origin and target from copy
        // otherwise the pathfinding can't work
        blockmap[STATE.ppos.x][STATE.ppos.y] = 0;
        blockmap[x][y] = 0;

        const pf = new PathFinder(blockmap);
        const path = pf.findPath([STATE.ppos.x, STATE.ppos.y], [x, y]);

        // the next move queue
        this.nextMoveQueue = [];
        for (var i = 1; i < path.length - 1; i++) {
            this.nextMoveQueue.push(path[i]);
        }
        this.nextMoveQueue.push([x, y]);
        this.nextMoveQueue = this.nextMoveQueue.reverse();
        this.movementQueue();

        return this.nextMoveQueue.length;
    }

    orientsTowards(element, deltaX, deltaY) {

        // Orient the player model based on move
        if (deltaX < 0) {
            element.dataset.rotation = `0 0 0`;
        } else if (deltaX > 0) {
            element.dataset.rotation = `0 180 0`;
        } else if (deltaY < 0) {
            element.dataset.rotation = `0 90 0`;
        } else if (deltaY > 0) {
            element.dataset.rotation = `0 270 0`;
        }
    }

    movementQueue() {
        // if the queue is not empty, grab the next move.
        if (this.nextMoveQueue.length > 0) {
            const move = this.nextMoveQueue.pop();
            const x = move[0];
            const y = move[1];

            const deltaX = STATE.ppos.x - x;
            const deltaY = STATE.ppos.y - y;
            this.orientsTowards(this.playerEl, deltaX, deltaY);

            this.moveEntity(STATE.ppos.x, STATE.ppos.y, x, y);
            STATE.ppos.x = x;
            STATE.ppos.y = y;

            if (this.lootMap[x][y] != 0) {
                this.lootEntity(x, y);
            }
        }

        setTimeout(() => {
            Sounds.play('chessSound');
        }, 150)

        // if the queue is still not empty, do it again.
        if (this.nextMoveQueue.length > 0) {
            setTimeout(() => {
                this.movementQueue();
            }, 300)
        }
    }

    dropWeaponAt(x, y) {

        const randType = Math.floor(Math.random() * WEAPONS.length);
        const randId = Math.floor(Math.random() * WEAPONS[randType].length);
        const weapon = WEAPONS[randType][randId];

        const el = document.createElement("mr-weapon");
        el.dataset.model = weapon.subtype;
        this.container.appendChild(el);

        this.lootMap[x][y] = {
            el: el,
            type: 'weapon',
            weaponID: randType,
            subtype: weapon.subtype,
            attack: 1 + Math.ceil(STATE.level / 5),
            range: weapon.range,
            crits: weapon.crits,
            ammoType: weapon.ammoType,
            cost: weapon.cost,
        };

        this.needsUpdate = true;
    }

    dropLootAt(x, y) {

        // Check how many enemies are on the board
        // and check if at least one key is laying on the board
        let enemyCount = 0;
        let isAlreadyKey = false;
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {
                if (this.entityMap[r][c].type == 'enemy') {
                    enemyCount++;
                }
                if (this.lootMap[r][c].type == 'key') {
                    isAlreadyKey = true;
                }
            }
        }

        // Drop the loot
        let element, type;
        if (enemyCount == 0 && STATE.hasKey) {

            // Last enemy but already have the key?
            // 30% chances to drop a chest
            if (Math.random() < 0.3) {
                const chest = document.createElement("mr-chest");
                this.container.appendChild(chest);
                this.addToMap({
                    el: chest,
                    type: 'chest',
                });
            }

            element = document.createElement("mr-loot");
            type = "loot";

        } else if (enemyCount == 0 && !STATE.hasKey && !isAlreadyKey) {

            // last enemy and no key in inventory or on the board
            // the key must drop
            element = document.createElement("mr-key");
            type = "key";

        } else if (enemyCount > 0 && !STATE.hasKey && !isAlreadyKey &&
            Math.random() > 0.5) {

            // not the last enemy and no key. Key could drop
            // but only if there is not already one on the board
            element = document.createElement("mr-key");
            type = "key";

        } else {

            // Otherwise drop something random
            element = document.createElement("mr-loot");
            type = "loot";
        }

        this.container.appendChild(element);
        this.entityMap[x][y] = 0;

        const loot = {
            el: element,
            type: type
        };

        // if the cell is already used, drop the loot somewhere else
        if (this.lootMap[x][y] == 0) {
            this.lootMap[x][y] = loot;
        } else {
            this.addToLootMap(loot);
        }

        // TODO: this is where we can add the poof animation
        // this.entityMap[x][y] = 0;
        // this.lootMap[x][y] = loot;

        this.needsUpdate = true;
    }

    lootEntity(x, y) {
        const entity = this.lootMap[x][y];

        if (STATE.isDebug) console.log(entity);

        switch (entity.type) {
            case "key":
                STATE.hasKey = true;
                this.doorEl.open();
                this.container.removeChild(entity.el);
                this.removeLootAt(x, y);
                // TODO: switch to a key sound
                Sounds.play('analogSound');
                break;

            case "weapon":
                if (entity.attack > STATE.weapons[entity.weaponID].attack) {
                    STATE.weapons[entity.weaponID].attack = entity.attack;
                    STATE.weapons[entity.weaponID].subtype = entity.subtype;
                    STATE.weapons[entity.weaponID].range = entity.range;
                    STATE.weapons[entity.weaponID].crits = entity.crits;
                    STATE.weapons[entity.weaponID].ammoType = entity.ammoType;
                    STATE.weapons[entity.weaponID].cost = entity.cost;
                }

                this.container.removeChild(entity.el);
                this.removeLootAt(x, y);
                // TODO: switch to a blade sound
                Sounds.play('analogSound');

                // Update the player with the right weapon
                this.playerEl.update();

                break;

            case "lore":
                entity.el.playLore();
                this.container.removeChild(entity.el);
                this.removeLootAt(x, y);

                // TODO: switch to a wiring / drive sound?
                Sounds.play('analogSound')
                break;

            case "loot":
                entity.el.applyEffect();
                this.container.removeChild(entity.el);
                this.removeLootAt(x, y);

                // TODO: switch to a better sound
                Sounds.play('analogSound')
                break;
        }
    }

    replaceEntity(r, c, entity) {
        this.entityMap[r][c] = entity;
    }

    showDamageAt(r, c, damage, color) {
        const dmgTile = document.querySelector("#damage-tile");
        dmgTile.pos = {
            x: r,
            y: c
        }
        dmgTile.showDamage(damage, color);
    }

    updateDistances() {
        this.distances = this.calcDist(STATE.ppos.y, STATE.ppos.x, this.entityMap);
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
            [0, 1]
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
                    (blockmap[newY][newX] === 0 ||
                        blockmap[newY][newX].type != "prop")
                ) {

                    // Calculate potential new distance
                    const newDistance = distances[currentY][currentX] + 1;

                    // Update distance if newDistance is smaller
                    // and effectively make enemies block the player
                    if (newDistance < distances[newY][newX] &&
                        blockmap[newY][newX].type != "enemy") {

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

            // distance between tile and player
            const dist = Math.sqrt(dx * dx + dy * dy + t) + 1;

            // a hyperbolic function crashing the amplitude to 0
            const falloff = 1 / (10 * t + 1) - 0.0909;

            // a cool looking function that simulate a wave propagating
            // https://www.youtube.com/watch?v=ciUNizDgiOs
            // the amplitude decreases with the distance
            const ampl = Math.sin(dist + t * this.quakeFrequence) / (dist * 10);

            // the Y offset, product of the amplitude and the falloff
            // the -1 is for the motion to go down first, like it got hit
            const offsetY = -1 * ampl * falloff * this.quakeForce;

            // The base floor Y used for the rest of the calculations.
            floorY = this.heightMap[r][c] * 0.35 + 0.3 + offsetY * 2;
        } else {
            floorY = this.heightMap[r][c] * 0.35 + 0.3;
        }

        if (entity.animation && !entity.animation.started) {
            entity.animation.started = true;
            entity.animation.timerStart = timer;
        }

        if (entity.animation && entity.animation.type == 'move') {
            const startTime = timer - entity.animation.timerStart;

            const t = startTime * entity.animation.speed;
            const p = Animator.fanOut(t);
            const h = Animator.jump(t);

            let distR = entity.animation.x + entity.animation.distX * p;
            let distC = entity.animation.y + entity.animation.distY * p;
            let distF;

            if (entity.type == "enemy") {
                if (entity.subtype == 'aimless') {
                    distF = h * 0.7;
                } else {
                    // includes 'homing'
                    distF = 0;
                }

            } else if (entity.type == "projectile") {
                // projectiles
                distF = h * entity.animation.arc + 0.5;

                // projectiles move linearly
                // so we use t instead of p for the progress
                distR = entity.animation.x + entity.animation.distX * t;
                distC = entity.animation.y + entity.animation.distY * t;

            } else {
                // this is the player
                distF = h * 0.6;
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
            coor = {
                x: c,
                y: floorY,
                z: r
            };
        }

        // the offset is to center the board in the table
        entity.el.object3D.position.set(
            coor.x - this.colCount / 2 + 0.5,
            coor.y,
            coor.z - this.rowCount / 2 + 0.5
        );
    }

    projectileTo(startPos, endPos, type) {

        // console.log(type);

        const particle = document.createElement("mr-projectile");
        particle.dataset.type = type;
        this.container.appendChild(particle);

        var dx = endPos.x - startPos.x;
        var dy = endPos.y - startPos.y;

        // Calculate the rotation angle
        var angleRadians = Math.atan2(dy, dx);
        var angleDegrees = angleRadians * 180 / Math.PI;
        particle.dataset.rotation = `0 ${angleDegrees} 0`;

        if (type == 'arrow') {
            this.effectList.push({
                el: particle,
                type: 'projectile',
                r: startPos.x,
                c: startPos.y,
                animation: {
                    type: 'move',
                    speed: 4,
                    arc: 0.5,
                    started: false,
                    x: startPos.x,
                    y: startPos.y,
                    distX: endPos.x - startPos.x,
                    distY: endPos.y - startPos.y
                }
            })
        } else {
            this.effectList.push({
                el: particle,
                type: 'projectile',
                r: startPos.x,
                c: startPos.y,
                animation: {
                    type: 'move',
                    speed: 2,
                    arc: 3,
                    started: false,
                    x: startPos.x,
                    y: startPos.y,
                    distX: endPos.x - startPos.x,
                    distY: endPos.y - startPos.y
                }
            })
        }


    }

    updateFloor(timer) {

        // Quake is about to start
        if (this.isQuake && !this.quakeHasStarted) {
            this.quakeHasStarted = true;
            this.quakeTimerStart = timer;
        }

        // Quake is running
        if (this.isQuake && this.quakeHasStarted) {

            if (timer - this.quakeTimerStart > this.quakeDuration) {
                if (STATE.isDebug) console.log("quake is over")
                this.isQuake = false;
            }
        }

        this.tileMap.forEach(row => {
            row.forEach(tile => {

                const x = tile.pos.x;
                const y = tile.pos.y;
                const el = tile.el;

                this.project(tile, x, y, timer);

                if (STATE.isPlayerTurn && STATE.isInteractive) {
                    const dist = this.distances[x][y];
                    const entity = this.getEntityAt(x, y);

                    // is the tile reachable by walking (pathfinder distance)
                    const isReachable = (
                        dist != Infinity &&
                        dist <= STATE.action &&
                        dist > 0);

                    //  combat related distances are Euclidean
                    const rawDist = distBetween(x, y, STATE.ppos.x, STATE.ppos.y);

                    if (!entity || entity.type == "chest") {
                        if (isReachable) {
                            // the tile is floor, and in reach
                            if (this.lootMap[x][y] != 0 &&
                                this.lootMap[x][y].type != 'door') {
                                // the loot tiles have a lighting effect
                                el.tileColor('glow-white');
                            } else {
                                el.tileColor('white');
                            }
                            el.setCostIndicator(dist);
                        } else {
                            // floor, but too far for current action points
                            el.hideTile();
                        }

                    } else if (entity.type == "enemy") {
                        // if the enemy is in attack range
                        const weapon = STATE.weapons[STATE.selectedWeaponID];
                        if (rawDist <= weapon.range) {
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
                    if (STATE.displayRange > 0) {
                        if (rawDist <= STATE.displayRange) {
                            el.tileColor('health');
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

                const loot = this.lootMap[r][c];
                if (loot != 0) {
                    this.project(loot, r, c, timer);
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

    removeLootAt(r, c) {
        this.lootMap[r][c] = 0;
    }

    getCostFor(x, y) {
        let projectedCost = 0;
        const entity = this.entityMap[x][y];

        if (!entity.type) {
            // the tile is empty, so cost is distance
            projectedCost = this.distances[x][y];

        } else if (entity.type == 'enemy') {
            // the tile is enemy, so the cost is weapon-based
            const dist = distBetween(x, y, STATE.ppos.x, STATE.ppos.y);
            const weapon = STATE.weapons[STATE.selectedWeaponID];
            projectedCost = weapon.cost;
        }
        return projectedCost;
    }

}
