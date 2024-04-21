class UIController {
    constructor(container, params) {
        this.barLength = 2;
        this.actionBallCount = 7;

        this.container = document.createElement("mr-div");
        this.boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.1, 1),
            new THREE.MeshPhongMaterial({
                color: "hsl(35, 46%, 80%)",
                transparent: true,
                opacity: 1,
                receiveShadow: true,
                wireframe: false,
                shininess: 200,
                reflectivity: 1,
            }));
        this.container.object3D.add(this.boxMesh);
        container.appendChild(this.container);
        this.container.dataset.rotation = `0 0 30`

        // action balls
        this.actionBalls = [];
        for (let i = 0; i < this.actionBallCount; i++) {
            const ballGeo = new THREE.SphereGeometry(0.1);
            ballGeo.translate(-0.3, 0.1, i * 0.3 + 0.1);
            let actionBall = new THREE.Mesh(
                ballGeo,
                new THREE.MeshPhongMaterial({
                    color: "#00ffd1",
                    transparent: true,
                    opacity: 1
                }));
            this.container.object3D.add(actionBall);
            this.actionBalls.push(actionBall);
        }

        // healthbar
        const healthBarGeo = new THREE.BoxGeometry(0.2, 0.1, 1);
        healthBarGeo.translate(0.3, 0.1, 0.5);
        this.healthBar = new THREE.Mesh(
            healthBarGeo,
            new THREE.MeshPhongMaterial({
                color: "#e72d75",
                transparent: true,
                opacity: 1
            }));
        // this.healthBar.position.z = -0.5;
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
        // this.rangeBar.position.z = -0.5;
        this.container.object3D.add(this.rangeBar);

        // this.endTurnButton = document.createElement("mr-button");
        // this.endTurnButton.className = 'end-turn';
        // this.endTurnButton.innerText = "End turn";
        // this.endTurnButton.dataset.position = "0 0.027 0.01";
        // this.endTurnButton.dataset.rotation = "270 0 0";
        // this.UILayer.appendChild(this.endTurnButton);

        this.uiMeleeWeapon = document.createElement('mr-ui-melee-weapon');
        this.uiMeleeWeapon.dataset.position = "0 0 0";
        this.container.appendChild(this.uiMeleeWeapon);

        // this.endTurnButton.addEventListener('click', () => {
        //     this.endTurn();
        // });
    }

    project(rowCount, colCount) {
        // this.actionBalls.forEach((actionBall, index) => {
        //     const ballsize = 0.008;
        //     const margin = 0.01;
        //     const offsetX = ballsize + margin;
        //     actionBall.dataset.position = `${index * ballsize + index * margin + offsetX} ${this.scale / 2 + ballsize} 0`;
        // });

        this.boxMesh.scale.set(1, 1, rowCount);

        const offsetX = colCount / 2 + 0.5;
        this.container.dataset.position = `-${offsetX} 0 0`;

        // const offsetX = -scale / 2;
        // const offsetY = (this.room.rowCount / 2) * this.scale;

        // this.el.dataset.position = `${offsetX} 0 ${offsetY}`;
    }

    update(stats, rowCount, colCount) {

        // const state = {
        //     health: 50,
        //     maxHealth: 50
        // }

        // this.actionBalls.forEach((actionBall, index) => {
        //     if (index < this.playerStats.maxActionPoints) {
        //         actionBall.style.visibility = "visible";
        //         if (index < this.playerStats.actionPoints) {
        //             actionBall.material.color.setStyle('#00d2d2')
        //             actionBall.material.opacity = 1;
        //         } else {
        //             actionBall.material.color.setStyle('#dddddd')
        //             actionBall.material.opacity = 0.25;
        //         }

        //         // recolor the ball if it's a projected cost
        //         if (index < this.playerStats.projectedCost) {
        //             actionBall.material.color.setStyle('#875dff')
        //         }
        //     } else {
        //         actionBall.style.visibility = "hidden";
        //     }
        // });


        // TODO: shouldn't be done at each frame
        // if (this.playerStats.inventory.meleeWeapon) {
        //     this.uiMeleeWeapon.setWeapon(this.playerStats.inventory.meleeWeapon.name);
        //     this.uiMeleeWeapon.setAttackValue(this.playerStats.inventory.meleeWeapon.attack);
        // }

        // console.log(stats.health, stats.maxHealth);



        const healthRatio = stats.health / stats.maxHealth;
        // this.healthBar.position.z = (healthRatio - 1) * rowCount / 2; // what controls left right
        this.healthBar.scale.set(1, 1, healthRatio * this.barLength);

        const rangeRatio = stats.range / stats.maxRange;
        // this.rangeBar.position.z = (rangeRatio - 1) * rowCount / 2; // what controls left right
        this.rangeBar.scale.set(1, 1, rangeRatio * this.barLength);

        this.actionBalls.forEach((actionBall, index) => {
            if (index < stats.maxActionPoints) {
                actionBall.visible = true;
                if (index < stats.actionPoints) {
                    actionBall.material.color.setStyle('#00d2d2')
                    actionBall.material.opacity = 1;
                } else {
                    actionBall.material.color.setStyle('#dddddd')
                    actionBall.material.opacity = 0.25;
                }

                // recolor the ball if it's a projected cost
                if (index < stats.projectedCost) {
                    actionBall.material.color.setStyle('#875dff')
                }
            } else {
                actionBall.visible = false;
                // actionBall.style.visibility = "hidden";
            }
        });

        // console.log(healthRatio);

        // this.healthBar.setHealth(state.health / state.maxHealth);
        // this.levelCountLabel.innerText = `Battery: ${Math.round(this.playerStats.range)} Floor: ${this.levelId} Death: ${this.cycleId}`;

    }

}
