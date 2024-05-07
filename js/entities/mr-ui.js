class MRUI extends MREntity {

    constructor() {
        super()

        this.container = document.createElement("mr-entity");
        this.container.id = 'ui-container'; // for DOM debugging

        this.meleeContainer = document.createElement("mr-entity");
        this.rangeContainer = document.createElement("mr-entity");

        // melee weapon
        this.meleeAttackValueEl = document.createElement("mr-text");
        this.meleeWeapons = [{
                name: "twig",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-stick1-UI.glb",
            },
            {
                name: "shortsword",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-shortSword1-UI.glb",
            },
        ];

        // range weapon
        this.rangeAttackValueEl = document.createElement("mr-text");
        this.rangeWeapons = [{
                name: "slingshot",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-slingshot1-UI.glb",
            },
            {
                name: "bow",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-bow1-UI.glb",
            },
        ]

        this.healthValueEl = document.createElement("mr-text");
        this.rangeValueEl = document.createElement("mr-text");
    }

    connected() {

        this.appendChild(this.container);

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
                    color: COLORS.movement,
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
                color: COLORS.health,
                transparent: true,
                opacity: 1
            }));

        // position the object
        this.healthBar.position.z = -0.5;
        this.container.object3D.add(this.healthBar);

        this.container.appendChild(this.healthValueEl);
        this.healthValueEl.innerText = "99";
        this.healthValueEl.style.fontSize = '200px';
        this.healthValueEl.style.color = '#000';
        this.healthValueEl.dataset.rotation = "270 0 270";
        this.healthValueEl.dataset.position = "0.28 0.08 -0.65";

        this.container.appendChild(this.rangeValueEl);
        this.rangeValueEl.innerText = "99";
        this.rangeValueEl.style.fontSize = '200px';
        this.rangeValueEl.style.color = '#000';
        this.rangeValueEl.dataset.rotation = "270 0 270";
        this.rangeValueEl.dataset.position = "0.03 0.08 -0.65";

        // range bar
        const rangeBarGeo = new THREE.BoxGeometry(0.2, 0.1, 1);
        rangeBarGeo.translate(0, 0.05, 0.5);
        this.rangeBar = new THREE.Mesh(
            rangeBarGeo,
            new THREE.MeshPhongMaterial({
                color: COLORS.range,
                transparent: true,
                opacity: 1
            }));
        this.rangeBar.position.z = -0.5;
        this.container.object3D.add(this.rangeBar);

        this.meleeContainer.addEventListener('touchend', () => {
            if (State.isInteractive) {
                State.selectedWeapon = 'melee';
                State.needsUpdate = true;
            }
        })

        this.meleeContainer.addEventListener('mouseover', () => {
            if (State.isInteractive) {
                State.hoverMelee = true;
                State.needsUpdate = true;
            }
        })

        this.meleeContainer.addEventListener('mouseout', () => {
            if (State.isInteractive) {
                State.hoverMelee = false;
                State.needsUpdate = true;
            }
        });

        this.rangeContainer.addEventListener('touchend', () => {
            if (State.isInteractive) {
                State.selectedWeapon = 'range';
                State.needsUpdate = true;
            }
        });

        this.rangeContainer.addEventListener('mouseover', () => {
            if (State.isInteractive) {
                State.hoverRange = true;
                State.needsUpdate = true;
            }
        })

        this.rangeContainer.addEventListener('mouseout', () => {
            if (State.isInteractive) {
                State.hoverRange = false;
                State.needsUpdate = true;
            }
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
        });

        this.meleeSelection = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.2, 0.8),
            new THREE.MeshPhongMaterial({
                color: COLORS.objects,
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
        });

        this.rangeSelection = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.2, 0.8),
            new THREE.MeshPhongMaterial({
                color: COLORS.objects,
                transparent: true,
                opacity: 0.5
            }));
        this.rangeContainer.object3D.add(this.rangeSelection);
    }

    update(timer) {
        this.actionBalls.forEach((actionBall, i) => {
            if (i < State.maxAction) {
                actionBall.visible = true;
                if (i < State.action) {
                    actionBall.material.color.setStyle(COLORS.movement)
                    actionBall.material.opacity = 1;
                } else {
                    actionBall.material.color.setStyle(COLORS.neutral)
                    actionBall.material.opacity = 0.25;
                }

                // recolor the ball if it's a projected cost
                if (i < State.projectedCost) {
                    actionBall.material.color.setStyle(COLORS.hover)
                } else if (State.projectedCost == Infinity) {
                    actionBall.material.color.setStyle(COLORS.neutral)
                }
            } else {
                actionBall.visible = false;
            }
        });

        const healthRatio = State.health / State.maxHealth;
        this.healthBar.scale.set(1, 1, healthRatio * this.barLength);
        this.healthValueEl.innerText = Math.round(State.health);

        const rangeRatio = State.range / State.maxRange;
        this.rangeBar.scale.set(1, 1, rangeRatio * this.barLength);
        this.rangeValueEl.innerText = Math.round(State.range);

        this.meleeWeapons.forEach((weapon, i) => {
            if (weapon.name == State.meleeName) {
                weapon.el.style.visibility = "visible";
            } else {
                weapon.el.style.visibility = "hidden";
            }
        });
        if (State.meleeName) {
            this.meleeAttackValueEl.innerText = State.meleeAttack;
        } else {
            this.meleeAttackValueEl.innerText = "";
        }

        this.rangeWeapons.forEach((weapon, i) => {
            if (weapon.name == State.rangeName) {
                weapon.el.style.visibility = "visible";
            } else {
                weapon.el.style.visibility = "hidden";
            }
        });
        if (State.rangeName) {
            this.rangeAttackValueEl.innerText = State.rangeAttack;
        } else {
            this.rangeAttackValueEl.innerText = '';
        }

        // TODO: ew
        if (State.isInteractive) {
            this.meleeSelection.material.color.setStyle(COLORS.objects);
            this.rangeSelection.material.color.setStyle(COLORS.objects);

            if (State.selectedWeapon == 'melee' && State.meleeName) {
                this.meleeSelection.material.opacity = 0.5;
                this.rangeSelection.material.opacity = 0;
            } else if (State.selectedWeapon == 'range' && State.rangeName) {
                this.meleeSelection.material.opacity = 0;
                this.rangeSelection.material.opacity = 0.5;
            } else {
                this.meleeSelection.material.opacity = 0;
                this.rangeSelection.material.opacity = 0;
            }
        } else {
            this.meleeSelection.material.color.setStyle(COLORS.neutral);
            this.rangeSelection.material.color.setStyle(COLORS.neutral);

            if (State.selectedWeapon == 'melee' && State.meleeName) {
                this.meleeSelection.material.opacity = 0.5;
                this.rangeSelection.material.opacity = 0;
            } else if (State.selectedWeapon == 'range' && State.rangeName) {
                this.meleeSelection.material.opacity = 0;
                this.rangeSelection.material.opacity = 0.5;
            } else {
                this.meleeSelection.material.opacity = 0;
                this.rangeSelection.material.opacity = 0;
            }
        }
    }
}

customElements.define('mr-ui', MRUI);
