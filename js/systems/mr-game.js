class GameSystem extends MRSystem {
    constructor() {
        super()
        this.gameIsStarted = false;
        this.cycle = 0;

        // container to store board object references
        this.container = document.createElement("mr-div");
        this.ui = document.querySelector("#interface");
        this.dmgTile = document.querySelector("#damage-tile");
        this.endTurnButton = document.createElement("mr-button");

        Object.assign(State, {
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

            // S for State
            if (event.key === 's') {
                event.preventDefault();
                console.log(State);
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
                State.needsUpdate = true;
                console.log('triggered an update')
            }

            // D for Debug
            if (event.key === "d") {
                event.preventDefault();
                State.isDebug = !State.isDebug;
                State.needsUpdate = true;
                console.log('isDebug is now ', State.isDebug);
            }

            // W for Weapon
            if (event.key === 'w') {
                event.preventDefault();

                const twig = document.createElement("mr-weapon");
                twig.dataset.model = "twig";
                this.container.appendChild(twig);

                const pos = this.board.addToLootMap({
                    el: twig,
                    type: 'weapon',
                    subtype: 'melee',
                    name: 'twig',
                    range: 10,
                    attack: 10
                });
                console.log('Weapon dropped at ', pos);
                State.needsUpdate = true;
            }

            // R for Range
            if (event.key === 'r') {
                event.preventDefault();

                const range = document.createElement("mr-weapon");
                range.dataset.model = "slingshot";
                this.container.appendChild(range);

                const pos = this.board.addToLootMap({
                    el: range,
                    type: 'weapon',
                    subtype: 'range',
                    name: 'slingshot',
                    range: 3,
                    attack: 3
                });
                console.log('Weapon dropped at ', pos);
                State.needsUpdate = true;
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
                State.needsUpdate = true;
            }

            // C for Chest
            if (event.key === 'c') {
                event.preventDefault();

                const chest = document.createElement("mr-chest");
                this.container.appendChild(chest);

                const pos = this.board.addToMap({
                    el: chest,
                    type: 'chest',
                }, this.board.entityMap);
                console.log('Chest dropped at ', pos);
                State.needsUpdate = true;
            }

            // H for Health reset
            if (event.key === 'h') {
                event.preventDefault();
                Object.assign(State, DefaultState);
                State.needsUpdate = true;
            }

            // P for projectiles
            if (event.key === 'p') {
                event.preventDefault();
                this.board.projectileTo(this.board.playerPos, this.board.doorPos);
                State.needsUpdate = true;
            }

            // O for Open door
            if (event.key === 'o') {
                event.preventDefault();
                State.hasKey = true;
                this.board.openDoor();
            }

            // Q for Quake
            if (event.key === 'q') {
                event.preventDefault();
                this.board.startQuakeAt(
                    this.board.playerPos.x,
                    this.board.playerPos.y, 4, 15, 2);
            }
            if (event.key === 'a') {
                event.preventDefault();
                this.board.startQuakeAt(
                    this.board.playerPos.x,
                    this.board.playerPos.y, 1.2, 10, 0.5);
            }

            // N for eNemy
            if (event.key === 'n') {
                event.preventDefault();

                const rand = Math.floor(Math.random() * EnemySubtypes.length);
                const enemy = {
                    el: document.createElement("mr-enemy"),
                    type: 'enemy',
                    subtype: EnemySubtypes[rand],
                    hp: 20,
                    attack: 0
                };

                enemy.el.dataset.subtype = enemy.subtype;
                this.container.appendChild(enemy.el);
                this.board.addToMap(enemy, this.board.entityMap);
                State.needsUpdate = true;
            }

            // T for Toggle isInteractive
            if (event.key === 't') {
                event.preventDefault();

                if (State.isInteractive) {
                    State.isInteractive = false;
                    State.staticUntil = this.timer + 2;
                } else {
                    State.isInteractive = true;
                    State.staticUntil = 0;
                }

                State.needsUpdate = true;
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
        if (State.level == 0) {
            params = SpawnRoomParams();

        } else if (
            // TODO: need an infinite, procedural way to interleave
            // battery rooms with increased difficulty
            State.level == 3 ||
            State.level == 8 ||
            State.level == 13 ||
            State.level == 21 ||
            State.level == 34 ||
            State.level == 55) {

            params = BatteryRoomParams();
            State.hasKey = true;

        } else {
            params = {};
        }

        // params.isDebug = State.isDebug;
        this.board = new Board(this.container, params);
        Sounds.background(this.board.biome.name);

        // the tile elements (the floor) own all the events handling
        this.board.tileMap.forEach(row => {
            row.forEach(tile => {

                // Mouse over tiles
                // Used to update the project cost of an action while hovering
                tile.el.addEventListener("mouseover", () => {
                    if (State.isInteractive) {
                        const x = tile.pos.x;
                        const y = tile.pos.y;

                        // TODO: GROSS
                        tile.el.borderContainer.dataset.position = "0 0.15 0";

                        State.projectedCost = this.board.getCostFor(x, y);
                        State.needsUpdate = true;
                    }
                });

                // Mouse out, reset the projected cost to 0
                tile.el.addEventListener("mouseout", () => {
                    if (State.isInteractive) {
                        const x = tile.pos.x;
                        const y = tile.pos.y;

                        // TODO: GROSS
                        tile.el.borderContainer.dataset.position = "0 0.2 0";

                        State.projectedCost = 0;
                        State.needsUpdate = true;
                    }
                });

                // Tap on a tile.
                // State machine based on what is tapped and what is the state
                tile.el.addEventListener("touchend", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    const entity = this.board.getEntityAt(x, y);
                    const cost = this.board.getCostFor(x, y);

                    if (State.isDebug) console.log("Tapped entity", entity);

                    if (State.isPlayerTurn && State.isInteractive) {
                        if (!entity) {
                            // there is nothing on the tile.
                            if (cost <= State.action) {
                                State.action -= cost;
                                const steps = this.board.movePlayer(x, y);
                                State.isInteractive = false;
                                State.staticUntil = this.timer + steps * 0.3;
                            } else {
                                Sounds.play('nopeSound');
                            }

                        } else {
                            // there is an entity on the tile
                            if (cost <= State.action &&
                                this.board.distances[x][y] <= State.action &&
                                entity.type == "chest"
                            ) {
                                State.isInteractive = false;
                                State.staticUntil = this.timer + 2;

                                entity.el.open();

                                setTimeout(() => {
                                    this.board.dropWeaponAt(x, y);
                                    State.needsUpdate = true;
                                }, 500);

                                setTimeout(() => {
                                    this.container.removeChild(entity.el);
                                    this.board.removeEntityAt(x, y);
                                    State.needsUpdate = true;
                                }, 2000)
                            }

                            // enemies
                            if (entity.type == "enemy") {
                                const ppos = this.board.playerPos;
                                const dist = distBetween(x, y, ppos.x, ppos.y);
                                const type = State.selectedWeapon;
                                let range = this.getWeaponRange();

                                console.log('enemy', ppos, dist, type, range)

                                if (dist <= range && cost <= State.action) {
                                    State.action -= cost;
                                    this.attack(entity, x, y);
                                } else {
                                    Sounds.play('nopeSound');
                                }
                            }
                        }

                        // Automatically end the turn when the player
                        // runs out of action points
                        if (this.autoEndTurn && State.action == 0) {
                            setTimeout(() => {
                                this.endTurn();
                            }, 800);
                        }

                        State.needsUpdate = true;
                    }
                });
            })
        })

        State.level++;
        State.isPlayerTurn = true;
        State.staticUntil = this.timer;
        State.needsUpdate = true;

        this.gameIsStarted = true;

    }

    getWeaponRange() {
        if (State.selectedWeapon == 'melee') {
            return State.meleeRange;
        } else if (State.selectedWeapon == 'range') {
            return State.rangeRange;
        } else {
            console.error('its not a valid selected weapon');
        }
    }

    getWeaponDamage() {
        if (State.selectedWeapon == 'melee') {
            return State.meleeAttack;
        } else if (State.selectedWeapon == 'range') {
            return State.rangeAttack;
        } else {
            console.error('its not a valid selected weapon');
        }
    }

    endTurn() {
        if (State.range > 1) {
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
            State.range--;
        } else {

            // Dot's battery is depleted
            this.endGame();
        }

        State.action = State.maxAction;
        State.isPlayerTurn = true;
        State.needsUpdate = true;
        Sounds.play('analogSound');

        if (State.isDebug) console.log("Combat queue", this.combatQueue);
    }

    endGame() {
        console.log('you ded');

        this.cycle++;
        Object.assign(State, DefaultState);

        // TODO: display level and cycle count in the UI
        // TODO: store max cycle level in the localStorage?
        this.initialize();
    }

    opponentTurn() {
        // the combat is a queue
        // each enemy takes a turn

        if (this.combatQueue.length > 0) {
            State.isInteractive = false;
            State.staticUntil = this.timer + 1;

            const entry = this.combatQueue.pop();

            // console.log('entry',entry);
            const entity = entry.entity;
            const subtype = entity.subtype;
            const r = entry.r;
            const c = entry.c;
            const x = this.board.playerPos.x;
            const y = this.board.playerPos.y;

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

                    deltaX = next[0];
                    deltaY = next[1];

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

            if (deltaX == -1) {
                entity.el.dataset.rotation = `0 0 0`;
            } else if (deltaX == 1) {
                entity.el.dataset.rotation = `0 180 0`;
            } else if (deltaY == -1) {
                entity.el.dataset.rotation = `0 90 0`;
            } else if (deltaY == 1) {
                entity.el.dataset.rotation = `0 270 0`;
            }

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
            State.isInteractive = false;
            State.staticUntil = this.timer + 0.3;
            State.isPlayerTurn = true;
        }

        State.needsUpdate = true;
    }

    attackPlayer(attacker, r, c) {
        const pos = this.board.playerPos;

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
                }, pos);
                break;
            default:
                console.error('this enemy type is not handled')
        }

        this.board.showDamageAt(pos.x, pos.y, attacker.attack, Colors.hover);
        this.board.startQuakeAt(pos.x, pos.y, 1, 10, 0.5);

        State.health -= attacker.attack;
        State.needsUpdate = true;

        if (State.health <= 0) {
            this.endGame();
        }
    }

    attack(entity, r, c) {
        if (State.isDebug) console.log(entity);

        State.isInteractive = false;
        State.staticUntil = this.timer + 1;

        const ppos = this.board.playerPos;
        const player = this.board.entityMap[ppos.x][ppos.y];
        let damage;

        if (State.selectedWeapon == 'range') {
            // TODO: assign the projectile particle based on subtype
            this.board.projectileTo(this.board.playerPos, {
                x: r,
                y: c
            });
            damage = State.rangeAttack;
            player.el.playBowRelease();

        } else if (State.selectedWeapon == "melee") {
            damage = State.meleeAttack;
            player.el.playSwoosh();
            player.el.playCombatAnimation();
        } else {
            console.error('invalid value for selectedWeapon')
        }

        // 10% chance of critical hits
        // TODO: should be based on the weapon
        if (Math.random() < 0.1) {
            const critMultiplier = 3;
            damage = damage * critMultiplier;
            entity.el.playCrit();
            player.el.showCritSpikes();

            this.board.startQuakeAt(r, c, 4, 10, 2);
            this.board.showDamageAt(r, c, damage, Colors.health);
        } else {
            this.board.startQuakeAt(r, c, 1.2, 10, 0.5);
            this.board.showDamageAt(r, c, damage, Colors.hover);
        }

        entity.hp -= damage;
        entity.el.playPoof();

        if (entity.hp <= 0) {
            setTimeout(() => {
                this.container.removeChild(entity.el);
                this.board.removeEntityAt(r, c);
                this.board.dropLootAt(r, c);
                State.needsUpdate = true;
            }, 500)
        }
    }

    projectRoom() {
        this.board.calcDistFromPlayer();
        this.board.updateFloor(this.timer);
        this.board.projectEverything(this.timer);

        // End turn button
        if (State.isInteractive) {
            if (State.action == 0) {
                this.endTurnButton.style.backgroundColor = Colors.hover;
            } else {
                this.endTurnButton.style.backgroundColor = Colors.health;
            }
        } else {
            this.endTurnButton.style.backgroundColor = Colors.neutral;
        }
    }

    update(deltaTime, frame) {
        if (this.gameIsStarted) {
            this.timer += deltaTime;
            const pos = this.board.playerPos;

            if (State.needsUpdate || this.board.isQuake) {

                if (State.isDebug) {
                    console.log('updated at', this.timer);
                }

                this.ui.update(this.timer);
                this.projectRoom();

                // position the floating damage tile at its position
                const dmgX = (this.dmgTile.pos.y - this.board.colCount / 2 + 0.5) * this.scale;
                const dmgY = 0.2;
                const dmgZ = (this.dmgTile.pos.x - this.board.rowCount / 2 + 0.5) * this.scale;
                this.dmgTile.dataset.position = `${dmgX} ${dmgY} ${dmgZ}`;

                // position the interface alongside the board
                const offX = (this.board.colCount / 2 + 0.5) * this.scale;
                this.ui.dataset.position = `-${offX} ${this.tableOffset} 0`;

                this.needsUpdate = false;
                State.needsUpdate = false;

                // If the player is at the door with the key
                if (this.board.lootMap[pos.x][pos.y].type == 'door' &&
                    State.hasKey) {

                    State.isPlayerTurn = true;
                    State.action = State.maxAction;
                    State.hasKey = false;

                    // TODO: introduce a pause here when staticUntil is back
                    this.initialize();
                }

                // Dot is in the battery room
                if (this.board.biome.name == 'battery') {
                    // the gauge that fills at it charges
                    const gaugeEl = this.board.entityMap[4][2].el;

                    // the charging pad on the floor,
                    // that Dot stands on.
                    const padEl = this.board.tileMap[4][1].el;

                    // Dot stands on the pad
                    if (pos.x == 4 && pos.y == 1) {
                        if (State.range < State.maxRange) {
                            // Dot is charging
                            State.range += 0.1;
                            gaugeEl.updateLevel(State.range / State.maxRange);
                            this.needsUpdate = true;
                            State.needsUpdate = true;
                        } else {
                            // Dot is charged
                            State.range = State.maxRange;
                            this.needsUpdate = false;
                            State.needsUpdate = false;
                        }
                    } else {
                        gaugeEl.updateLevel(0);

                    }
                }
            }

            // Flip back isInteractive when the timer reaches staticUntil
            if (!State.isInteractive && State.staticUntil < this.timer) {
                State.needsUpdate = true;
                State.isInteractive = true;
                if (State.isDebug) console.log("isInteractive is true again");
            }

            this.board.projectAnimatedEntities(this.timer);
        }
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);

        this.settings = this.root.components.get('game');
        this.autoEndTurn = this.settings.autoEndTurn ?? false;
        this.scale = this.settings.scale ?? 0.05;
        this.tableOffset = this.settings.tableOffset ?? 0;

        this.container.style.scale = this.scale;
        this.container.dataset.position = `0 ${this.tableOffset} 0`;

        this.ui.style.scale = this.scale;
        this.ui.dataset.rotation = `0 0 30`;

        this.dmgTile.style.scale = this.scale;

        this.endTurnButton.className = 'end-turn';
        this.endTurnButton.innerText = "End";
        this.endTurnButton.dataset.position = "0 0.08 2";
        this.endTurnButton.dataset.rotation = "270 0 270";
        this.ui.appendChild(this.endTurnButton);

        this.endTurnButton.addEventListener('click', () => {
            if (State.isInteractive) {
                this.endTurn();
            }
        });

        this.initialize();
    }
}

// To be read with Mario's voice
let saGo = new GameSystem();
