class BoardSystem extends MRSystem {
    constructor() {
        super()
        this.scale = 0.05;
        this.levelId = 0;
        this.cycleId = 0;
        this.gameIsStarted = false;

        // TODO: package the sound into a simple Class
        // something like this.sound.play('doorHinge');
        this.sounds = {
            bgMusic: document.querySelector('#bg-music'),
            chessSound: document.querySelector('#chess-sound'),
            doorSound: document.querySelector('#door-sound'),
            analogSound: document.querySelector('#analog-sound'),
            clashSound: document.querySelector('#clash-sound'),
            nopeSound: document.querySelector('#nope-sound'),
            swooshSound: document.querySelector('#swoosh-sound')
        }

        this.playerStats = {
            health: 10,
            maxHealth: 10,
            actionPoints: 4,
            maxActionPoints: 4,
            projectedCost: 0
        };

        // container to store board object references
        this.container = document.createElement("mr-div");
        this.UILayer = document.createElement("mr-div");
        this.actionBalls = [];

        // debug
        document.addEventListener("keydown", (event) => {
            if (event.key === "d") {
                event.preventDefault();
                this.initialize();
            }

            if (event.key === "e") {
                event.preventDefault();
                this.endGame();
            }
        });

    }

    initialize() {
        console.clear();
        this.timer = 0;
        this.isPlayerTurn = true;
        this.playerStats.actionPoints = this.playerStats.maxActionPoints;

        // clear up the dom elements container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }

        // The room class generate all kind of arrays and dom elements
        // to represent a level, either hardcoded or randomly generated 
        if(this.levelId == 0) {
            // starting room
            this.room = new Room(this.container, {
                flrCount: 1,
                rowCount: 5,
                colCount: 5,
                biomeId: 0,
                enemyCount: 0,
                propCount: 0,
            });
        } else {
            this.room = new Room(this.container, {});
        }

        // the tile elements (the floor) own all the events handling
        this.room.tilemap.forEach(row => {
            row.forEach(tile => {
                tile.el.addEventListener("mouseover", () => {
                    switch (this.room.entityMap[tile.pos.x][tile.pos.y].type) {
                        case "prop":
                            break;
                        case "enemy":
                            if (this.distanceBetween(tile.pos.x, tile.pos.y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                this.playerStats.projectedCost = 2;
                                console.log("a weapon would be highlighted");
                            }
                            break;
                        case "chest":
                            // console.log("hovering a chest")
                            break;
                        case "loot":
                            console.log("the item will do something on pick up")
                            break;
                        case "door":
                            // console.log("go to the next room after killing all the enemies")
                            break;
                        default:
                            // console.log("here");
                            this.playerStats.projectedCost = this.room.distances[tile.pos.x][tile.pos.y];
                            // el.floorTile.object3D.children[0].material.opacity = 1;
                            tile.el.floorMaterial.opacity = 1;
                    }

                });

                tile.el.addEventListener("mouseout", () => {
                    this.playerStats.projectedCost = 0;
                    // el.floorTile.object3D.children[0].material.opacity = 0.75;
                    tile.el.floorMaterial.opacity = 0.75;
                });

                tile.el.addEventListener("touchstart", () => {
                    const targetEntity = this.room.entityMap[tile.pos.x][tile.pos.y];
                    switch (targetEntity.type) {
                        case "prop":
                            // TODO do something when a prop is touched?
                            // Play a sound, an animation?
                            // console.log("this is a prop.")
                            break;
                        case "enemy":
                            // console.log("would be combat, depending of the distance.")
                            if (this.distanceBetween(tile.pos.x, tile.pos.y, this.room.playerPos.x, this.room.playerPos.y) <= 2 && this.playerStats.actionPoints >= 2) {
                                this.playerStats.actionPoints -= 2;
                                this.attackEntity(targetEntity, tile.pos.x, tile.pos.y);
                            } else {
                                this.sounds.nopeSound.components.set('audio', {
                                    state: 'play'
                                });
                            }
                            break;
                        case "chest":
                            // console.log("that will open the chest and drop an item on the floor")
                            if (this.distanceBetween(tile.pos.x, tile.pos.y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                // console.log('open the chest')
                                this.container.removeChild(this.room.entityMap[tile.pos.x][tile.pos.y].el);
                                this.dropLoot(tile.pos.x, tile.pos.y);
                            } else {
                                this.sounds.nopeSound.components.set('audio', {
                                    state: 'play'
                                });
                            }
                            break;
                        case "loot":
                            if (this.distanceBetween(tile.pos.x, tile.pos.y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                this.container.removeChild(this.room.entityMap[tile.pos.x][tile.pos.y].el);
                                this.room.entityMap[tile.pos.x][tile.pos.y] = 0;

                                this.sounds.analogSound.components.set('audio', {
                                    state: 'play'
                                });

                                if (this.playerStats.health < this.playerStats.maxHealth) {
                                    this.playerStats.health++;
                                }
                                // console.log("You got loot!!");
                            } else {
                                this.sounds.nopeSound.components.set('audio', {
                                    state: 'play'
                                });
                            }
                            // console.log("the item will do something on pick up")
                            break;
                        case "door":
                            this.sounds.doorSound.components.set('audio', {
                                state: 'play'
                            });
                            this.initialize();
                            // console.log("go to the next room after killing all the enemies")
                            break;
                        default:
                            const moveCost = this.room.distances[tile.pos.x][tile.pos.y];

                            if (moveCost <= this.playerStats.actionPoints) {
                                this.playerStats.actionPoints -= moveCost;
                                this.sounds.chessSound.components.set('audio', {
                                    state: 'play'
                                })
                                this.room.moveEntity(this.room.playerPos.x, this.room.playerPos.y, tile.pos.x, tile.pos.y);
                                this.room.playerPos.x = tile.pos.x;
                                this.room.playerPos.y = tile.pos.y;
                            } else {
                                this.sounds.nopeSound.components.set('audio', {
                                    state: 'play'
                                });
                            }
                    }
                    if (this.playerStats.actionPoints == 0) {
                        this.endTurn();
                    }

                });
            })
        })

        this.room.checkForDoor(this.container);
        this.gameIsStarted = true;

        this.levelId++;
    }

    endTurn() {
        // console.log("turn ended")
        this.playerStats.actionPoints = this.playerStats.maxActionPoints;
        this.isPlayerTurn = false;
        this.combatQueue = [];

        for (let r = 0; r < this.room.rowCount; r++) {
            for (let c = 0; c < this.room.colCount; c++) {
                const entity = this.room.entityMap[r][c];
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
    }

    endGame() {
        console.log('you ded');

        this.playerStats.health = this.playerStats.maxHealth;
        this.levelId = 0;
        this.cycleId++;
        // TODO: display level and cycle count in the UI
        // TODO: store max cycle level in the localStorage?
        this.initialize();
    }

    opponentTurn() {
        // the combat is a queue
        // each enemy takes a turn
        if (this.combatQueue.length > 0) {
            const entry = this.combatQueue.pop();
            const entity = entry.entry;
            const r = entry.r;
            const c = entry.c;

            // TODO: plug a much better pathfinder algo

            const directionX = this.room.playerPos.x - r;
            const directionY = this.room.playerPos.y - c;

            let goalX = r;
            let goalY = c;

            if (directionX < 0) {
                goalX -= 1;
            } else if (directionX > 0) {
                goalX += 1;
            }

            if (directionY < 0) {
                goalY -= 1;
            } else if (directionY > 0) {
                goalY += 1;
            }

            if (goalX == this.room.playerPos.x && goalY == this.room.playerPos.y) {
                this.attackPlayer(entity, 1);
            } else {
                if (Math.random() < 0.75) {
                    this.room.moveEntity(r, c, goalX, goalY);
                }
            }

            setTimeout(() => {
                this.opponentTurn();
            }, 800)
        } else {
            this.isPlayerTurn = true;
        }
    }

    attackPlayer(attacker, damage) {
        // TODO: move the sound where the attacker is
        this.sounds.clashSound.components.set('audio', {
            state: 'play'
        });
        this.playerStats.health -= damage;

        if (this.playerStats.health <= 0) {
            this.endGame();
        }
    }

    attackEntity(entity, r, c) {
        // TODO: move the sound where the player is
        this.sounds.swooshSound.components.set('audio', {
            state: 'play'
        });
        entity.hp -= 1; // TODO: should be tied to the player attack power

        if (entity.hp <= 0) {
            this.container.removeChild(entity.el);
            this.dropLoot(r, c);

            this.room.checkForDoor(this.container);

        }
    }

    dropLoot(x, y) {
        const droppedLoot = document.createElement("mr-loot");
        this.container.appendChild(droppedLoot);

        const loot = {
            el: droppedLoot,
            type: 'loot',
            increaseHP: 1,
            increaseAP: 1,
        };

        this.room.entityMap[x][y] = loot;
    }

    distanceBetween(x1, y1, x2, y2) {
        var distX = x1 - x2;
        var distY = y1 - y2;
        return Math.sqrt(distX * distX + distY * distY);
    }

    update(deltaTime, frame) {

        if (this.gameIsStarted) {
            this.timer += deltaTime;

            ///// UI LAYER
            this.actionBalls.forEach((actionBall, index) => {
                const ballsize = 0.008;
                const margin = 0.01;
                const offsetX = ballsize + margin;
                actionBall.dataset.position = `${index * ballsize + index * margin + offsetX} ${this.scale / 2 + ballsize} 0`;

                if (index < this.playerStats.maxActionPoints) {
                    actionBall.style.visibility = "visible";
                    if (index < this.playerStats.actionPoints) {
                        actionBall.material.color.setStyle('#00ff55')
                        actionBall.material.opacity = 1;
                    } else {
                        actionBall.material.color.setStyle('#dddddd')
                        actionBall.material.opacity = 0.25;
                    }

                    // recolor the ball if it's a projected cost
                    if (index < this.playerStats.projectedCost) {
                        actionBall.material.color.setStyle('#875dff')
                    }
                } else {
                    actionBall.style.visibility = "hidden";
                }
            });

            this.healthBar.setHealth(this.playerStats.health / this.playerStats.maxHealth);

            const offsetX = -this.scale / 2;
            const offsetY = (this.room.rowCount / 2) * this.scale;

            this.UILayer.dataset.position = `${offsetX} 0 ${offsetY}`;
            // this.UILayer.dataset.rotation = `0 270 0`;

            this.room.calculateDistancesFromPlayer();
            this.room.tilemap.forEach(row => {
                row.forEach(tile => {

                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    this.room.project(tile, x, y, this.timer);

                    if (this.isPlayerTurn) {
                        const distance = this.room.distances[tile.pos.x][tile.pos.y];

                        if (distance != Infinity &&
                            distance <= this.playerStats.actionPoints &&
                            distance > 0 &&
                            this.room.entityMap[tile.pos.x][tile.pos.y] == 0) {

                            let offsetY = distance * 40;
                            let color = `hsl(${offsetY}, 80%, 60%)`;
                            tile.el.floorTile.style.visibility = "visible";
                            tile.el.floorMaterial.opacity = 0.75;
                            tile.el.floorMaterial.color.setStyle(color)

                            tile.el.numberString.innerText = distance;
                        } else {
                            tile.el.numberString.innerText = '';
                            tile.el.floorTile.style.visibility = "hidden";
                            switch (this.room.entityMap[tile.pos.x][tile.pos.y].type) {
                                case "prop":
                                    tile.el.floorTile.style.visibility = "hidden";
                                    break;
                                case "enemy":
                                    tile.el.floorTile.style.visibility = "visible";
                                    if (this.distanceBetween(x, y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                        tile.el.floorMaterial.color.setStyle("#f00")
                                    } else {
                                        tile.el.floorMaterial.color.setStyle("#888")
                                    }
                                    break;
                                case "chest":
                                    tile.el.floorTile.style.visibility = "visible";
                                    if (this.distanceBetween(x, y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                        tile.el.floorMaterial.color.setStyle("#0f0")
                                    } else {
                                        tile.el.floorMaterial.color.setStyle("#888")
                                    }
                                    break;
                                case "loot":
                                    tile.el.floorTile.style.visibility = "visible";
                                    if (this.distanceBetween(x, y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                        tile.el.floorMaterial.color.setStyle("#00ffd1")
                                    } else {
                                        tile.el.floorMaterial.color.setStyle("#888")
                                    }
                                    break;
                                case "door":
                                    tile.el.floorTile.style.visibility = "visible";
                                    if (this.distanceBetween(x, y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                        tile.el.floorMaterial.color.setStyle("#00ffd1")
                                    } else {
                                        tile.el.floorMaterial.color.setStyle("#888")
                                    }
                                    break;
                            }
                        }
                    } else {
                        tile.el.numberString.innerText = '';
                        tile.el.floorTile.style.visibility = "hidden";
                    }
                })
            })

            for (let r = 0; r < this.room.rowCount; r++) {
                for (let c = 0; c < this.room.colCount; c++) {
                    const entity = this.room.entityMap[r][c];
                    if (entity != 0) {
                        this.room.project(entity, r, c, this.timer);
                   }
                }
            }
        }
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);
        this.container.style.scale = this.scale;

        this.root.appendChild(this.UILayer);
        this.UILayer.object3D.add(new THREE.Mesh(
            new THREE.BoxGeometry(this.scale * 5, this.scale, this.scale),
            new THREE.MeshPhongMaterial({
                color: "hsl(35, 46%, 80%)",
                transparent: true,
                opacity: 1,
                receiveShadow: true,
                wireframe: false,
                // emissive: "#FFFFFF",
                // specular: "#FFFFFF",
                shininess: 200,
                reflectivity: 1,
            })));
        this.root.appendChild(this.UILayer);

        for (let i = 0; i < 7; i++) {
            let actionBall = document.createElement("mr-action-ball");
            this.actionBalls.push(actionBall);
            this.UILayer.appendChild(actionBall);
        }

        this.healthBar = document.createElement('mr-health-bar');
        this.UILayer.appendChild(this.healthBar);

        this.endTurnButton = document.createElement("mr-button");
        this.endTurnButton.className = 'end-turn';
        this.endTurnButton.innerText = "End turn";
        this.endTurnButton.style.fontSize = "10px";
        // this.endTurnButton.dataset.position = "0.085 0.027 0";
        this.endTurnButton.dataset.position = "0 0.027 0.01";
        this.endTurnButton.dataset.rotation = "270 0 0";
        this.UILayer.appendChild(this.endTurnButton);

        this.endTurnButton.addEventListener('click', () => {
            this.endTurn();
        });

        this.initialize();
    }
}

let boardsys = new BoardSystem()
