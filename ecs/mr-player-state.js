class StateSystem extends MRSystem {
    constructor() {
        super()
        this.container = document.createElement("mr-div");
        this.container.id = 'ui-container'; // for DOM debugging
        this.isAttached = false;

        // melee weapon
        this.meleeAttackValueEl = document.createElement("mr-text");
        this.meleeWeapons = [{
                name: "twig",
                el: document.createElement("mr-model"),
                src: "models/weapon-stick1.glb",
            },
            {
                name: "short-sword",
                el: document.createElement("mr-model"),
                src: "models/weapon-shortSword1-UI.glb",
            },
        ]

        // range weapon
        this.rangeAttackValueEl = document.createElement("mr-text");
        this.rangeWeapons = [{
                name: "slingshot",
                el: document.createElement("mr-model"),
                src: "models/weapon-slingshot-temp.glb",
            },
            {
                name: "short-bow",
                el: document.createElement("mr-model"),
                src: "models/weapon-shortSword01.glb",
            },
        ]
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);

        this.state = entity.components.get('state');

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
            this.container.object3D.add(actionBall);
            this.actionBalls.push(actionBall);
        }

        // healthbar
        const healthBarGeo = new THREE.BoxGeometry(0.2, 0.1, 1);
        // place the original so it scales to the right
        healthBarGeo.translate(0.3, 0.1, 0.5);
        this.healthBar = new THREE.Mesh(
            healthBarGeo,
            new THREE.MeshPhongMaterial({
                color: "#e72d75",
                transparent: true,
                opacity: 1
            }));
        // position the object
        this.healthBar.position.z = -0.5;
        this.container.object3D.add(this.healthBar);

        // range bar
        const rangeBarGeo = new THREE.BoxGeometry(0.2, 0.1, 1);
        rangeBarGeo.translate(0, 0.1, 0.5);
        this.rangeBar = new THREE.Mesh(
            rangeBarGeo,
            new THREE.MeshPhongMaterial({
                color: "#90ee90",
                transparent: true,
                opacity: 1
            }));
        this.rangeBar.position.z = -0.5;
        this.container.object3D.add(this.rangeBar);

        // melee weapons
        this.container.appendChild(this.meleeAttackValueEl);
        this.meleeAttackValueEl.style.fontSize = '400px';
        this.meleeAttackValueEl.style.color = '#000';
        this.meleeAttackValueEl.textObj.position.setX((-this.meleeAttackValueEl.width / 2) / 0.005);
        this.meleeAttackValueEl.dataset.rotation = "270 0 270";
        this.meleeAttackValueEl.dataset.position = "0 0.15 -2";

        this.meleeWeapons.forEach((weapon, i) => {
            this.container.appendChild(weapon.el);
            weapon.el.setAttribute('src', weapon.src);
            weapon.el.dataset.position = "0 0.05 -2";
            // weapon.el.style.pointerEvents = 'none';
        });

        // range weapons
        this.container.appendChild(this.rangeAttackValueEl);
        this.rangeAttackValueEl.style.fontSize = '400px';
        this.rangeAttackValueEl.style.color = '#000';
        this.rangeAttackValueEl.textObj.position.setX((-this.rangeAttackValueEl.width / 2) / 0.005);
        this.rangeAttackValueEl.dataset.rotation = "270 0 270";
        this.rangeAttackValueEl.dataset.position = "0 0.15 -1.2";

        this.rangeWeapons.forEach((weapon, i) => {
            this.container.appendChild(weapon.el);
            weapon.el.setAttribute('src', weapon.src);
            weapon.el.dataset.position = "0 0.05 -1.2";
            // weapon.el.style.pointerEvents = 'none';
        });

        this.isAttached = true;
    }

    update(deltaTime, frame) {
        if (this.isAttached) {
            const state = this.root.components.get('state');

            if (state.needsUpdate) {
                this.actionBalls.forEach((actionBall, i) => {
                    if (i < state.maxActionPoints) {
                        actionBall.visible = true;
                        if (i < state.actionPoints) {
                            actionBall.material.color.setStyle(Colors.movement)
                            actionBall.material.opacity = 1;
                        } else {
                            actionBall.material.color.setStyle(Colors.neutral)
                            actionBall.material.opacity = 0.25;
                        }

                        // recolor the ball if it's a projected cost
                        if (i < state.projectedCost) {
                            actionBall.material.color.setStyle(Colors.hover)
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
                    if (weapon.name == state.meleeWeaponName) {
                        weapon.el.style.visibility = "visible";
                    } else {
                        weapon.el.style.visibility = "hidden";
                    }
                });
                this.meleeAttackValueEl.innerText = state.meleeWeaponAttack;

                this.rangeWeapons.forEach((weapon, i) => {
                    if (weapon.name == state.rangeWeaponName) {
                        weapon.el.style.visibility = "visible";
                    } else {
                        weapon.el.style.visibility = "hidden";
                    }
                });
                this.rangeAttackValueEl.innerText = state.rangeWeaponAttack;

                // state.needsUpdate = false;
                this.root.components.set('stats', {
                    needsUpdate: false
                });
            }


        }
    }

}

let state = new StateSystem();
