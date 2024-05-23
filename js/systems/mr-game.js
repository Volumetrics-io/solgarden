class GameSystem extends MRSystem {
    constructor() {
        super()
        this.gameIsStarted = false;
        this.cycle = localStorage.getItem('maxCycle') ?? 0;;

        // container to store board object references
        this.container = document.createElement("mr-div");
        this.dmgTile = document.querySelector("#damage-tile");

        // UI elements
        this.endTurnButton = document.querySelector("#end-turn-button");
        this.startWall = document.querySelector("#start-wall");
        this.disposedRobotsLabel = document.querySelector("#disposed-robots");
        this.farthestRoomLabel = document.querySelector("#farthest-room");

        this.hpProgress = document.querySelector('#hp-progress');
        this.hpLabel = document.querySelector('#hp-label');

        this.rangeProgress = document.querySelector('#range-progress');
        this.rangeLabel = document.querySelector('#range-label');

        this.uiActions = document.querySelector('#ui-actions');
        this.actionLabel = document.querySelector('#action-label');

        this.uiMelee = document.querySelector('#ui-melee');
        this.uiRange = document.querySelector('#ui-range');

        this.ui = document.querySelector("#ui");

        Object.assign(STATE, {
            maxHealth: 20,
            maxRange: 30,
            maxAction: 4,
            hoverMelee: false,
            hoverRange: false,
            needsUpdate: false
        })

        // Debug event listeners
        document.addEventListener("keydown", (event) => {

            // I for Initialize a new room
            if (event.key === "i") {
                event.preventDefault();
                this.initialize();
            }

            // E for End game
            if (event.key === "e") {
                event.preventDefault();
                this.endGame();
            }

            // S for STATE
            if (event.key === 's') {
                event.preventDefault();
                console.log(STATE);
            }

            // M for Map
            if (event.key === 'm') {
                event.preventDefault();
                printArray("this.board.heightMap", this.board.heightMap);
                printArray("this.board.entityMap", this.board.entityMap);
                printArray("this.board.lootMap", this.board.lootMap);
                printArray("this.board.propMap", this.board.propMap);
                printArray("this.board.distances", this.board.distances);
            }

            // U for Update
            if (event.key === "i") {
                event.preventDefault();
                STATE.needsUpdate = true;
                console.log('triggered an update')
            }

            // D for Debug
            if (event.key === "d") {
                event.preventDefault();
                STATE.isDebug = !STATE.isDebug;
                STATE.needsUpdate = true;
                console.log('isDebug is now ', STATE.isDebug);
            }

            // W for Weapon
            if (event.key === 'w') {
                event.preventDefault();
                this.board.dropWeaponAt(STATE.ppos.x, STATE.ppos.y);
                STATE.needsUpdate = true;
            }

            // L for Loot
            if (event.key === 'l') {
                event.preventDefault();

                const loot = document.createElement("mr-loot");
                this.container.appendChild(loot);

                const pos = this.board.addToLootMap({
                    el: loot,
                    type: 'loot',
                });
                console.log('Weapon dropped at ', pos);
                STATE.needsUpdate = true;
            }

            // C for Chest
            if (event.key === 'c') {
                event.preventDefault();
                const chest = document.createElement("mr-chest");
                this.container.appendChild(chest);
                this.board.addToMap({
                    el: chest,
                    type: 'chest',
                });
                STATE.needsUpdate = true;
            }

            // H for Health reset
            if (event.key === 'h') {
                event.preventDefault();
                Object.assign(STATE, DEFAULT_STATE);
                STATE.needsUpdate = true;
            }

            // P for projectiles
            if (event.key === 'p') {
                event.preventDefault();
                if (Math.random() < 0.5) {
                    this.board.projectileTo(STATE.ppos, STATE.dpos, 'arrow');
                } else {
                    this.board.projectileTo(STATE.ppos, STATE.dpos, 'stone');
                }
                STATE.needsUpdate = true;
            }

            // O for Open door
            if (event.key === 'o') {
                event.preventDefault();
                STATE.hasKey = true;
                // this.board.openDoor();
                this.board.doorEl.open();
            }

            // Q for Quake
            if (event.key === 'q') {
                event.preventDefault();
                this.board.startQuakeAt(STATE.ppos.x, STATE.ppos.y, 4, 15, 2);
            }
            if (event.key === 'a') {
                event.preventDefault();
                this.board.startQuakeAt(STATE.ppos.x, STATE.ppos.y, 1.2, 10, 0.5);
            }

            // Z for whatever (to reuse)
            if (event.key === "z") {
                event.preventDefault();
                // const player = this.board.entityMap[STATE.ppos.x][STATE.ppos.y];
                // player.el.playCombatAnimation();
                this.board.playerEl.playCombatAnimation();
            }

            // N for eNemy
            if (event.key === 'n') {
                event.preventDefault();

                const rand = Math.floor(Math.random() * ENEMY_SUBTYPES.length);
                const enemy = {
                    el: document.createElement("mr-enemy"),
                    type: 'enemy',
                    subtype: ENEMY_SUBTYPES[rand],
                    hp: 1,
                    attack: 0
                };

                enemy.el.dataset.subtype = enemy.subtype;
                this.container.appendChild(enemy.el);
                this.board.addToMap(enemy);
                STATE.needsUpdate = true;
            }

            // T for Toggle isInteractive
            if (event.key === 't') {
                event.preventDefault();

                if (STATE.isInteractive) {
                    STATE.isInteractive = false;
                    STATE.staticUntil = this.timer + 2;
                } else {
                    STATE.isInteractive = true;
                    STATE.staticUntil = 0;
                }

                STATE.needsUpdate = true;
            }

        });

    }

    initialize() {
        // console.clear();
        this.timer = 0;
        // const state = this.state.components.get('state');

        // a different approach: pushing the previous room down
        // if (this.container.firstChild) {
        //     const newContainer = document.createElement("mr-div");
        //     this.root.appendChild(newContainer);
        //     newContainer.style.scale = this.scale;
        //
        //     this.oldContainer = this.container;
        //     this.container = newContainer;
        //     const depth = -this.level / 10;
        //     this.oldContainer.dataset.position = `0 ${depth} 0`;
        //
        //     // TODO: remove the player?
        // }

        // clear up the dom elements container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }

        let params;
        // TODO: make the soundtrack part of the biome
        if (STATE.level == 0) {
            params = generateSpawnRoomParams();

        } else if (
            // TODO: need an infinite, procedural way to interleave
            // battery rooms with increased difficulty
            STATE.level == 3 ||
            STATE.level == 8 ||
            STATE.level == 13 ||
            STATE.level == 21 ||
            STATE.level == 34 ||
            STATE.level == 55) {

            params = generateBatteryRoomParams();
            STATE.hasKey = true;

        } else {
            params = {};
        }

        this.board = new Board(this.container, params);
        Sounds.background(this.board.biome.name);

        // the tile elements (the floor) own all the events handling
        this.board.tileMap.forEach(row => {
            row.forEach(tile => {

                // Mouse over tiles
                // Used to update the project cost of an action while hovering
                tile.el.addEventListener("mouseover", () => {
                    if (STATE.isInteractive) {
                        const x = tile.pos.x;
                        const y = tile.pos.y;

                        tile.el.sinkTile();
                        STATE.projectedCost = this.board.getCostFor(x, y);
                        STATE.needsUpdate = true;
                    }
                });

                // Mouse out, reset the projected cost to 0
                tile.el.addEventListener("mouseout", () => {
                    if (STATE.isInteractive) {
                        const x = tile.pos.x;
                        const y = tile.pos.y;

                        tile.el.raiseTile();
                        STATE.projectedCost = 0;
                        STATE.needsUpdate = true;
                    }
                });

                // Tap on a tile.
                // STATE machine based on what is tapped and what is the state
                tile.el.addEventListener("touchend", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    const entity = this.board.getEntityAt(x, y);
                    const cost = this.board.getCostFor(x, y);

                    if (STATE.isDebug) console.log("Tapped entity", entity);

                    if (STATE.isPlayerTurn && STATE.isInteractive) {
                        if (!entity) {
                            // there is nothing on the tile.
                            if (cost <= STATE.action) {
                                STATE.action -= cost;
                                const steps = this.board.movePlayer(x, y);
                                STATE.isInteractive = false;
                                STATE.staticUntil = this.timer + steps * 0.4;
                            } else {
                                Sounds.play('nopeSound');
                            }

                        } else {
                            // there is an entity on the tile
                            if (entity.type == "chest" &&
                                cost <= STATE.action &&
                                this.board.distances[x][y] <= STATE.action) {
                                entity.el.open();

                                // TODO: improve the chest opening animation
                                setTimeout(() => {
                                    this.board.dropWeaponAt(x, y);
                                    STATE.needsUpdate = true;
                                }, 500);

                                setTimeout(() => {
                                    this.container.removeChild(entity.el);
                                    this.board.removeEntityAt(x, y);
                                    STATE.needsUpdate = true;
                                }, 600);

                                STATE.isInteractive = false;
                                STATE.staticUntil = this.timer + 2;
                            }

                            // enemies
                            if (entity.type == "enemy") {
                                const dist = distBetween(x, y, STATE.ppos.x, STATE.ppos.y);
                                const weapon = STATE.weapons[STATE.selectedWeaponID];
                                const range = weapon.range;

                                if (dist <= range && cost <= STATE.action) {
                                    console.log(cost);
                                    STATE.action -= cost;
                                    this.attack(entity, x, y);
                                } else {
                                    Sounds.play('nopeSound');
                                }
                            }
                        }

                        // Automatically end the turn when the player
                        // runs out of action points
                        if (this.autoEndTurn && STATE.action == 0) {
                            setTimeout(() => {
                                this.endTurn();
                            }, 800);
                        }

                        STATE.needsUpdate = true;
                    }
                });
            })
        })

        STATE.level++;
        STATE.isPlayerTurn = true;
        STATE.staticUntil = this.timer;
        STATE.needsUpdate = true;

        this.gameIsStarted = true;

    }

    endTurn() {
        if (STATE.range > 1) {
            this.combatQueue = [];

            for (let r = 0; r < this.board.rowCount; r++) {
                for (let c = 0; c < this.board.colCount; c++) {
                    const entity = this.board.entityMap[r][c];
                    if (entity.type == 'enemy') {
                        this.combatQueue.push({
                            entity: entity,
                            r: r,
                            c: c,
                        });
                    }
                }
            }
            this.opponentTurn();

            // Dot still has battery left
            STATE.range--;
        } else {

            // Dot's battery is depleted
            this.endGame();
        }

        STATE.action = STATE.maxAction;
        STATE.isPlayerTurn = true;
        STATE.needsUpdate = true;
        Sounds.play('analogSound');

        if (STATE.isDebug) console.log("Combat queue", this.combatQueue);
    }

    endGame() {
        console.log('you ded');

        this.cycle++;
        Object.assign(STATE, DEFAULT_STATE);

        // TODO: display level and cycle count in the UI
        // TODO: store max cycle level in the localStorage?
        this.initialize();
    }

    opponentTurn() {
        // the combat is a queue
        // each enemy takes a turn

        if (this.combatQueue.length > 0) {
            STATE.isInteractive = false;
            STATE.staticUntil = this.timer + 1;

            const entry = this.combatQueue.pop();

            // console.log('entry',entry);
            const entity = entry.entity;
            const subtype = entity.subtype;
            const r = entry.r;
            const c = entry.c;
            const x = STATE.ppos.x;
            const y = STATE.ppos.y;

            let deltaX;
            let deltaY;

            // Movements for different enemy types
            if (subtype == 'aimless') {
                //  this unit wanders randomly
                let Moves = [];
                let PossibleMoves = [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ]

                PossibleMoves.forEach((move, i) => {
                    const x = r + move[0];
                    const y = c + move[1];
                    const cell = this.board.getEntityAt(x, y);
                    if (!cell && cell != "offmap") {
                        Moves.push(move);
                    }
                });

                if (Moves.length > 0) {
                    const rand = Math.floor(Math.random() * Moves.length);
                    const next = Moves[rand];

                    deltaX = - next[0];
                    deltaY = - next[1];

                    this.board.moveEntity(r, c, r + next[0], c + next[1]);
                }

            } else if (subtype == 'static') {
                // this unit doesn't move
                // this is a turet, or a tower

            } else if (subtype == 'homing') {
                // this unit follows the player
                // and always aim to get closer

                // the path finder needs an obstacle map
                // we can just copy the entity map
                const blockmap = this.board.entityMap.map(function(arr) {
                    return arr.slice();
                });
                // remove origin and target from copy
                // otherwise the pathfinding can't work
                blockmap[r][c] = 0;
                blockmap[x][y] = 0;

                const pf = new PathFinder(blockmap);
                const path = pf.findPath([r, c], [x, y]);

                // if path[1] is undefined, the path has no solution
                const nextMove = (!path[1]) ? [r, c] : path[1];

                deltaX = r - nextMove[0];
                deltaY = c - nextMove[1];

                this.board.moveEntity(r, c, nextMove[0], nextMove[1]);
            }

            // console.log(subtype, deltaX, deltaY);
            this.board.orientsTowards(entity.el, deltaX, deltaY);

            // after moving, attack if in range
            // TODO: different attacks based on enemy subtype
            if (distBetween(r, c, x, y) <= 2) {
                setTimeout(() => {
                    this.attackPlayer(entity, r, c);
                }, 300);
            }

            if (this.combatQueue.length > 0) {
                setTimeout(() => {
                    this.opponentTurn();
                }, 500)
            }

        } else {

            STATE.isInteractive = false;
            STATE.staticUntil = this.timer + 0.3;
            STATE.isPlayerTurn = true;
        }

        STATE.needsUpdate = true;
    }

    attackPlayer(attacker, r, c) {
        switch (attacker.subtype) {
            case "aimless":
                attacker.el.playSwoosh();
                break;
            case 'homing':
                attacker.el.playBowRelease();
                break;
            case 'static':
                attacker.el.playBowRelease();
                this.board.projectileTo({
                    x: r,
                    y: c
                }, STATE.ppos, 'stone');
                break;
            default:
                console.error('this enemy type is not handled')
        }

        // orient the player
        const deltaX = r - STATE.ppos.x;
        const deltaY = c - STATE.ppos.y;
        this.board.orientsTowards(attacker.el, deltaX, deltaY);

        this.board.showDamageAt(STATE.ppos.x, STATE.ppos.y, attacker.attack, COLORS.hover);
        this.board.startQuakeAt(STATE.ppos.x, STATE.ppos.y, 1, 10, 0.5);

        STATE.health -= attacker.attack;
        STATE.needsUpdate = true;

        if (STATE.health <= 0) {
            this.endGame();
        }
    }

    attack(entity, r, c) {
        if (STATE.isDebug) console.log(entity);

        STATE.isInteractive = false;
        STATE.staticUntil = this.timer + 1;

        const player = this.board.entityMap[STATE.ppos.x][STATE.ppos.y];
        const weapon = STATE.weapons[STATE.selectedWeaponID];

        // orient the player
        const deltaX = STATE.ppos.x - r;
        const deltaY = STATE.ppos.y - c;
        this.board.orientsTowards(this.board.playerEl, deltaX, deltaY);

        if (STATE.selectedWeaponID == 0) { // melee
            player.el.playSwoosh();
            player.el.playCombatAnimation();
        } else { // range
            this.board.projectileTo(STATE.ppos, {
                x: r,
                y: c
            }, STATE.weapons[1].ammoType);
            player.el.playBowRelease();
        }

        let damage;
        if (Math.random() < weapon.critChances) {
            damage = weapon.attack * weapon.critMultiplier;
            entity.el.playCrit();
            this.board.startQuakeAt(r, c, 4, 10, 2);
            this.board.showDamageAt(r, c, damage, COLORS.health);
        } else {
            damage = weapon.attack;
            this.board.startQuakeAt(r, c, 1.2, 10, 0.5);
            this.board.showDamageAt(r, c, damage, COLORS.hover);
        }

        entity.hp -= damage;
        entity.el.playPoof();

        if (entity.hp <= 0) {
            setTimeout(() => {
                this.container.removeChild(entity.el);
                this.board.removeEntityAt(r, c);
                this.board.dropLootAt(r, c);
                STATE.needsUpdate = true;
            }, 500)
        }
    }

    projectRoom() {
        this.board.updateDistances();
        this.board.updateFloor(this.timer);
        this.board.projectEverything(this.timer);

        // End turn button
        if (STATE.isInteractive) {
            if (STATE.action == 0) {
                this.endTurnButton.style.backgroundColor = COLORS.health;
            } else {
                this.endTurnButton.style.backgroundColor = COLORS.white;
            }
        } else {
            this.endTurnButton.style.backgroundColor = COLORS.neutral;
        }
    }

    update(deltaTime, frame) {
        if (this.gameIsStarted) {
            this.timer += deltaTime;

            if (STATE.needsUpdate || this.board.isQuake) {

                if (STATE.isDebug) console.log('updated at', this.timer);
                this.projectRoom();

                // position the floating damage tile at its position
                const dmgX = (this.dmgTile.pos.y - this.board.colCount / 2 + 0.5) * this.scale;
                const dmgY = 0.2;
                const dmgZ = (this.dmgTile.pos.x - this.board.rowCount / 2 + 0.5) * this.scale;
                this.dmgTile.dataset.position = `${dmgX} ${dmgY} ${dmgZ}`;

                // position the wall and interface alongside the board
                const offX = (this.board.colCount / 2 + 0.5) * this.scale;
                this.ui.dataset.position = `-${offX} ${this.tableOffset} 0`;
                this.startWall.dataset.position = `${offX} ${this.tableOffset} 0`;

                // The spawn wall
                const maxRoom = localStorage.getItem('maxRoom') ?? STATE.level;

                // Show and update the spawn wall if the first room
                if (STATE.level == 1) {
                    this.startWall.style.visibility = 'visible';
                    this.disposedRobotsLabel.innerText = `Disposed robots: ${this.cycle}`;
                    this.farthestRoomLabel.innerText = `Farthest room: ${maxRoom}`;
                    if (STATE.level > parseInt(maxRoom)) {
                        localStorage.setItem('maxRoom', STATE.level);
                    }
                } else {
                    this.startWall.style.visibility = 'hidden';
                }

                // UI health progress bar
                // TODO: should be a custom element like acton balls
                const healthRatio = STATE.health / STATE.maxHealth;
                this.hpProgress.object3D.traverse(object => {
                    if (object.isMesh && object.morphTargetInfluences) {
                        object.morphTargetInfluences[0] = healthRatio;
                    }
                })

                // UI range progress bar
                const rangeRatio = STATE.range / STATE.maxRange;
                this.rangeProgress.object3D.traverse(object => {
                    if (object.isMesh && object.morphTargetInfluences) {
                        object.morphTargetInfluences[0] = rangeRatio;
                    }
                })

                // Update the player with the right weapon
                this.board.playerEl.update();

                // Update all the UI
                this.hpLabel.innerText = "⊕ " + Math.ceil(STATE.health);
                this.rangeLabel.innerText = "⚡ " + Math.ceil(STATE.range);
                this.actionLabel.innerText = "● 0" + STATE.action;
                this.uiMelee.update(this.timer);
                this.uiRange.update(this.timer);
                this.uiActions.update(this.timer);
                STATE.needsUpdate = false;

                // If the player is at the door with the key
                if (this.board.lootMap[STATE.ppos.x][STATE.ppos.y].type == 'door' &&
                    STATE.hasKey) {

                    STATE.isPlayerTurn = true;
                    STATE.action = STATE.maxAction;
                    STATE.hasKey = false;

                    // TODO: introduce a pause here when staticUntil is back
                    STATE.isInteractive = false;
                    STATE.staticUntil = this.timer + 0.5;
                    setTimeout(() => {
                        this.initialize();
                    }, 500)
                }

                // Dot is in the battery room
                if (this.board.biome.name == 'battery') {
                    // the gauge that fills at it charges
                    const gaugeEl = this.board.entityMap[4][2].el;

                    // the charging pad on the floor,
                    // that Dot stands on.
                    const padEl = this.board.tileMap[4][1].el;

                    // Dot stands on the pad
                    if (STATE.ppos.x == 4 && STATE.ppos.y == 1) {
                        if (STATE.range < STATE.maxRange) {
                            // Dot is charging
                            STATE.range += 0.1;
                            gaugeEl.updateLevel(STATE.range / STATE.maxRange);
                            STATE.needsUpdate = true;
                        } else {
                            // Dot is charged
                            STATE.range = STATE.maxRange;
                            STATE.needsUpdate = false;
                        }
                    } else {
                        gaugeEl.updateLevel(0);

                    }
                }

                // Dot is in the spawn room
                if (this.board.biome.name == 'spawn') {

                    // the charging pad on the floor,
                    // that Dot stands on.
                    const padEl = this.board.tileMap[1][1].el;

                    // Dot stands on the pad
                    if (STATE.ppos.x == 1 && STATE.ppos.y == 1) {
                        if (STATE.range < STATE.maxRange) {
                            // Dot is charging
                            STATE.range += 0.1;

                        } else {
                            // Dot is charged
                            STATE.range = STATE.maxRange;
                            // STATE.needsUpdate = false;
                        }
                        STATE.needsUpdate = true;
                    }
                }
            }

            // Flip back isInteractive when the timer reaches staticUntil
            if (!STATE.isInteractive && STATE.staticUntil < this.timer) {
                STATE.needsUpdate = true;
                STATE.isInteractive = true;
                if (STATE.isDebug) console.log("isInteractive is true again");
            }

            this.board.projectAnimatedEntities(this.timer);
        }
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);

        // Game settings
        this.settings = this.root.components.get('game');
        this.autoEndTurn = this.settings.autoEndTurn ?? false;
        this.tableOffset = this.settings.tableOffset ?? 0;

        // Scale from CSS
        this.scale = mrjsUtils.css.getVarFromRoot('--scale') ?? 0.05;

        this.container.style.scale = this.scale;
        this.container.dataset.position = `0 ${this.tableOffset} 0`;

        this.dmgTile.style.scale = this.scale;

        this.endTurnButton.addEventListener('click', () => {
            if (STATE.isInteractive) {
                this.endTurn();
            }
        });

        this.initialize();
    }
}

// To be read with Mario's voice
let saGo = new GameSystem();
