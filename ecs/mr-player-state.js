class StateSystem extends MRSystem {
    constructor() {
        super()
        this.isAttached = false;
        this.container = document.createElement("mr-div");
        this.container.id = 'ui-container'; // for DOM debugging
        this.meleeContainer = document.createElement("mr-entity");
        this.rangeContainer = document.createElement("mr-entity");

        // melee weapon
        this.meleeAttackValueEl = document.createElement("mr-text");
        this.meleeWeapons = [{
                name: "twig",
                el: document.createElement("mr-model"),
                src: "models/weapon-stick1-UI.glb",
            },
            {
                name: "shortsword",
                el: document.createElement("mr-model"),
                src: "models/weapon-shortSword1-UI.glb",
            },
        ];

        // range weapon
        this.rangeAttackValueEl = document.createElement("mr-text");
        this.rangeWeapons = [{
                name: "slingshot",
                el: document.createElement("mr-model"),
                src: "models/weapon-slingshot1-UI.glb",
            },
            {
                name: "bow",
                el: document.createElement("mr-model"),
                src: "models/weapon-bow1-UI.glb",
            },
        ]

        // TODO: add a keyholder similar to range and melee
        // with 2 preset, key and no key
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);

        this.root.needsUpdate = true;

        // this.state = this.root.components.get('state');

        this.barLength = 2;
        this.actionBallCount = 7;

        this.boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.1, 5),
            new THREE.MeshPhongMaterial({
                color: "hsl(35, 46%, 80%)",
            }));
        this.container.object3D.add(this.boxMesh);

        // action balls
        this.actionBalls = [];
        for (let i = 0; i < this.actionBallCount; i++) {
            const ballGeo = new THREE.SphereGeometry(0.1);
            ballGeo.translate(-0.3, 0.1, i * 0.3 + 0.1);
            let actionBall = new THREE.Mesh(
                ballGeo,
                new THREE.MeshPhongMaterial({
                    color: Colors.movement,
                    transparent: true,
                    opacity: 1
                }));
            actionBall.position.z = -0.5;
            this.container.object3D.add(actionBall);
            this.actionBalls.push(actionBall);
        }

        // healthbar
        const healthBarGeo = new THREE.BoxGeometry(0.2, 0.1, 1);
        // move origin point so it scales only to the right
        healthBarGeo.translate(0.25, 0.05, 0.5);
        this.healthBar = new THREE.Mesh(
            healthBarGeo,
            new THREE.MeshPhongMaterial({
                color: Colors.health,
                transparent: true,
                opacity: 1
            }));
        // position the object
        this.healthBar.position.z = -0.5;
        this.container.object3D.add(this.healthBar);

        // range bar
        const rangeBarGeo = new THREE.BoxGeometry(0.2, 0.1, 1);
        rangeBarGeo.translate(0, 0.05, 0.5);
        this.rangeBar = new THREE.Mesh(
            rangeBarGeo,
            new THREE.MeshPhongMaterial({
                color: Colors.range,
                transparent: true,
                opacity: 1
            }));
        this.rangeBar.position.z = -0.5;
        this.container.object3D.add(this.rangeBar);

        this.meleeContainer.addEventListener('touchend', () => {
            this.root.components.set('state', {
                selectedWeapon: 'melee',
                hoverMelee: false,
            });
            this.root.needsUpdate = true;
        })

        this.meleeContainer.addEventListener('mouseover', () => {
            this.root.components.set('state', {
                hoverMelee: true,
            });
            this.root.needsUpdate = true;
        })

        this.meleeContainer.addEventListener('mouseout', () => {
            this.root.components.set('state', {
                hoverMelee: false,
            });
            this.root.needsUpdate = true;
        })


        this.rangeContainer.addEventListener('touchend', () => {
            this.root.components.set('state', {
                selectedWeapon: 'range',
            });
            this.root.needsUpdate = true;
        });

        this.rangeContainer.addEventListener('mouseover', () => {
            this.root.components.set('state', {
                hoverRange: true,
            });
            this.root.needsUpdate = true;
        })

        this.rangeContainer.addEventListener('mouseout', () => {
            this.root.components.set('state', {
                hoverRange: false,
            });
            this.root.needsUpdate = true;
        })

        // melee weapons
        this.container.appendChild(this.meleeContainer);
        this.meleeContainer.dataset.position = "0 0 -2";
        this.meleeContainer.appendChild(this.meleeAttackValueEl);

        this.meleeAttackValueEl.style.fontSize = '300px';
        this.meleeAttackValueEl.style.color = '#000';
        this.meleeAttackValueEl.textObj.position.setX((-this.meleeAttackValueEl.width / 2) / 0.005);
        this.meleeAttackValueEl.dataset.rotation = "270 0 270";
        this.meleeAttackValueEl.dataset.position = "0 0.15 0";
        this.meleeWeapons.forEach((weapon, i) => {
            this.meleeContainer.appendChild(weapon.el);
            weapon.el.setAttribute('src', weapon.src);
            weapon.el.dataset.position = "0 0.05 0";
            // weapon.el.style.pointerEvents = 'none';
        });

        this.meleeSelection = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.2, 0.8),
            new THREE.MeshPhongMaterial({
                color: Colors.objects,
                transparent: true,
                opacity: 0.5
            }));
        this.meleeContainer.object3D.add(this.meleeSelection);


        // range weapons
        this.container.appendChild(this.rangeContainer);
        this.rangeContainer.dataset.position = "0 0 -1.2";
        this.rangeContainer.appendChild(this.rangeAttackValueEl);
        this.rangeAttackValueEl.style.fontSize = '300px';
        this.rangeAttackValueEl.style.color = '#000';
        this.rangeAttackValueEl.textObj.position.setX((-this.rangeAttackValueEl.width / 2) / 0.005);
        this.rangeAttackValueEl.dataset.rotation = "270 0 270";
        this.rangeAttackValueEl.dataset.position = "0 0.15 0";

        this.rangeWeapons.forEach((weapon, i) => {
            this.rangeContainer.appendChild(weapon.el);
            weapon.el.setAttribute('src', weapon.src);
            weapon.el.dataset.position = "0 0.05 0";
            // weapon.el.style.pointerEvents = 'none';
        });

        this.rangeSelection = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.2, 0.8),
            new THREE.MeshPhongMaterial({
                color: Colors.objects,
                transparent: true,
                opacity: 0.5
            }));
        this.rangeContainer.object3D.add(this.rangeSelection);

        this.isAttached = true;
    }

    update(deltaTime, frame) {
        if (this.isAttached) {
            if (this.root.needsUpdate) {
                const state = this.root.components.get('state');

                this.actionBalls.forEach((actionBall, i) => {
                    if (i < state.maxAction) {
                        actionBall.visible = true;
                        if (i < state.action) {
                            actionBall.material.color.setStyle(Colors.movement)
                            actionBall.material.opacity = 1;
                        } else {
                            actionBall.material.color.setStyle(Colors.neutral)
                            actionBall.material.opacity = 0.25;
                        }

                        // recolor the ball if it's a projected cost
                        if (i < state.projectedCost) {
                            actionBall.material.color.setStyle(Colors.hover)
                        } else if (state.projectedCost == Infinity) {
                            actionBall.material.color.setStyle(Colors.neutral)
                        }
                    } else {
                        actionBall.visible = false;
                    }
                });

                const healthRatio = state.health / state.maxHealth;
                this.healthBar.scale.set(1, 1, healthRatio * this.barLength);
                //
                const rangeRatio = state.range / state.maxRange;
                this.rangeBar.scale.set(1, 1, rangeRatio * this.barLength);

                this.meleeWeapons.forEach((weapon, i) => {
                    if (weapon.name == state.meleeName) {
                        weapon.el.style.visibility = "visible";
                    } else {
                        weapon.el.style.visibility = "hidden";
                    }
                });
                if (state.meleeName) {
                    this.meleeAttackValueEl.innerText = state.meleeAttack;
                }

                this.rangeWeapons.forEach((weapon, i) => {
                    if (weapon.name == state.rangeName) {
                        weapon.el.style.visibility = "visible";
                    } else {
                        weapon.el.style.visibility = "hidden";
                    }
                });
                if (state.rangeName) {
                    this.rangeAttackValueEl.innerText = state.rangeAttack;
                }

                if (state.selectedWeapon == 'melee' && state.meleeName) {
                    this.meleeSelection.material.opacity = 0.5;
                    this.rangeSelection.material.opacity = 0;
                } else if (state.selectedWeapon == 'range' && state.rangeName) {
                    this.meleeSelection.material.opacity = 0;
                    this.rangeSelection.material.opacity = 0.5;
                } else {
                    this.meleeSelection.material.opacity = 0;
                    this.rangeSelection.material.opacity = 0;
                }
            }

        }
    }

}

let state = new StateSystem();
