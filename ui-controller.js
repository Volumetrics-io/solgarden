class UIController {
    constructor(container, params) {
        // this.container = container;

        this.container = document.createElement("mr-div");
        this.boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.1, 1),
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
            }));
        this.container.object3D.add(this.boxMesh);
        container.appendChild(this.container);
        this.container.dataset.rotation = `0 0 30`

        this.actionBalls = [];


        // this.root.appendChild(this.UILayer);

        // for (let i = 0; i < 7; i++) {
        //     let actionBall = document.createElement("mr-action-ball");
        //     this.actionBalls.push(actionBall);
        //     this.UILayer.appendChild(actionBall);
        // }

        // this.healthBar = document.createElement('mr-health-bar');
        // this.container.appendChild(this.healthBar);

        this.healthBar = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 1),
            new THREE.MeshPhongMaterial({
                color: "#e72d75",
                transparent: true,
                opacity: 1
            }));
        this.container.object3D.add(this.healthBar);
        this.healthBar.position.x = 0.2;
        this.healthBar.position.y = 0.1;

        this.rangeBar = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 1),
            new THREE.MeshPhongMaterial({
                color: "#90ee90",
                transparent: true,
                opacity: 1
            }));
        this.container.object3D.add(this.rangeBar);
        this.rangeBar.position.x = -0.2;
        this.rangeBar.position.y = 0.1;

        // this.appendChild(this.el);

        // this.endTurnButton = document.createElement("mr-button");
        // this.endTurnButton.className = 'end-turn';
        // this.endTurnButton.innerText = "End turn";
        // this.endTurnButton.dataset.position = "0 0.027 0.01";
        // this.endTurnButton.dataset.rotation = "270 0 0";
        // this.UILayer.appendChild(this.endTurnButton);

        // this.labelContainer = document.createElement("mr-div");
        // this.labelContainer.dataset.position = "0 0 0.027";
        // this.labelContainer.className = 'label-container';
        // this.UILayer.appendChild(this.labelContainer);

        // this.levelCountLabel = document.createElement("mr-text");
        // this.levelCountLabel.className = 'text-label';
        // this.labelContainer.appendChild(this.levelCountLabel);

        // this.uiMeleeWeapon = document.createElement('mr-ui-melee-weapon');
        // this.uiMeleeWeapon.dataset.position = "0.1 0.03 0";
        // this.UILayer.appendChild(this.uiMeleeWeapon);

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
        this.healthBar.position.z = (healthRatio - 1) * rowCount / 2; // what controls left right
        this.healthBar.scale.set(1, 1, healthRatio * rowCount);

        const rangeRatio = stats.range / stats.maxRange;
        this.rangeBar.position.z = (rangeRatio - 1) * rowCount / 2; // what controls left right
        this.rangeBar.scale.set(1, 1, rangeRatio * rowCount);

        // console.log(healthRatio);

            // this.healthBar.setHealth(state.health / state.maxHealth);
            // this.levelCountLabel.innerText = `Battery: ${Math.round(this.playerStats.range)} Floor: ${this.levelId} Death: ${this.cycleId}`;
   
    }

}
