class MRTile extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");

        this.border = document.createElement("mr-model");
        this.borderObjects = document.createElement("mr-model");
        this.borderEnemies = document.createElement("mr-model");
        this.borderEnemiesNope = document.createElement("mr-model");

        // this.prop = document.createElement("mr-model");
        this.floorTile = document.createElement("mr-entity");

        this.numberContainer = document.createElement("mr-div");
        this.numberString = document.createElement("mr-text");

        this.rotationCollection = [0, 90, 180, 270];

        this.el.onLoad = () => {
            this.el.object3D.traverse(object => {
                if (object.isMesh && object.morphTargetInfluences) {
                    // Necessary for the single-faced
                    // grass texture to appear correctly
                    object.material.alphaTest = 0.5;
                    object.receiveShadow = true;
                    object.castShadow = true;
                    object.morphTargets = true;
                    object.morphTargetInfluences[0] = Math.random()
                }
            })
        }
    }

    connected() {
        // console.log(this.dataset);
        // console.log();

        this.appendChild(this.border);
        this.border.src = '/ui-models/borderObject-white.glb';
        this.border.dataset.position = "0 0.2 0";
        this.border.style.visibility = "hidden";

        this.appendChild(this.borderObjects);
        this.borderObjects.src = '/ui-models/borderObject-objects.glb';
        this.borderObjects.dataset.position = "0 0.2 0";
        this.borderObjects.style.visibility = "hidden";

        this.appendChild(this.borderEnemies);
        this.borderEnemies.src = '/ui-models/borderObject-health.glb';
        this.borderEnemies.dataset.position = "0 0.2 0";
        this.borderEnemies.style.visibility = "hidden";

        this.appendChild(this.borderEnemiesNope);
        this.borderEnemiesNope.src = '/ui-models/borderObject-neutral.glb';
        this.borderEnemiesNope.dataset.position = "0 0.2 0";
        this.borderEnemiesNope.style.visibility = "hidden";

        this.appendChild(this.el);
        const tileset = this.dataset.tileset.split(',');
        const tilepath = this.dataset.tilepath;

        let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
        this.dataset.rotation = `0 ${randomRotation} 0`;

        let randomModel = tileset[Math.floor(Math.random() * tileset.length)];
        this.el.src = tilepath + randomModel;

        // the translucent colored tile
        // this.floorTile.dataset.position = "0 -0.3 0";
        // this.floorTile.dataset.position = "0 0.1 0";
        // let geometry = new THREE.BoxGeometry(0.93, 0.1, 0.93);
        // this.floorMaterial = new THREE.MeshPhongMaterial({
        //     transparent: true,
        //     opacity: 0
        // })

        // let mesh = new THREE.Mesh(geometry, this.floorMaterial)
        // this.floorTile.object3D.add(mesh);
        // this.appendChild(this.floorTile);

        // this.numberString.dataset.position = '-0.08 0.2 0';
        this.numberString.dataset.position = '0.2 0.32 0';
        this.numberString.style.fontSize = "200px";
        this.numberContainer.appendChild(this.numberString);

        this.numberContainer.dataset.position = '0 0.2 0'
        this.numberContainer.dataset.rotation = `270 0 -${randomRotation + 90}`
        // this.numberContainer.dataset.rotation = `270 0 0`;
        Object.assign(this.numberContainer.style, {
            width: "300px",
            height: "300px",
        })

        this.appendChild(this.numberContainer);
    }

    hideTile() {
        this.border.style.visibility = "hidden";
        this.borderObjects.style.visibility = "hidden";
        this.borderEnemies.style.visibility = "hidden";
        this.borderEnemiesNope.style.visibility = "hidden";
        // this.floorTile.style.visibility = "hidden";
    }

    showTile(entityType) {
        this.hideTile();

        if (entityType == "loot" ||
            entityType == "lore" ||
            entityType == "key" ||
            entityType == "weapon" ||
            entityType == "chest" ||
            entityType == "door"
        ) {
            //
            this.borderObjects.style.visibility = "visible";
            this.numberString.style.color = Colors.objects;

            // tile.el.showTile(entity.type);

        } else if (entityType == 'enemy') {

            this.borderEnemies.style.visibility = "visible";
            this.numberString.style.color = Colors.enemies;

            // TODO: check if Dot can attack
            // this.borderEnemiesNope.style.visibility = "hidden";

            // tile.el.showTile(entity.type);
            // tile.el.setCostIndicator("");

        } else if (entityType == 'enemy-nope') {
            this.borderEnemiesNope.style.visibility = "visible";
            this.numberString.style.color = Colors.neutral;
        } else {
            this.border.style.visibility = "visible";

            // this.border.object3D.material.baseColorFactor = [0, 0, 0, 1]

            this.numberString.style.color = "#ffffff";
            // tile.el.hideTile();
            // tile.el.setTileColor(Colors.neutral)
        }
        // console.log(entityType);
        // if(entityType == '') {
        //
        // }
        // this.border.style.visibility = "visible";
        // this.borderObjects.style.visibility = "visible";

        // this.floorTile.style.visibility = "visible";
    }

    // setTileColor(color) {
    //     this.floorMaterial.color.setStyle(color);
    // }

    // setTileOpacity(opacity) {
    //     this.border.object3D.opacity = opacity;
    // }

    setCostIndicator(number) {
        this.numberString.innerText = number;
    }
}

customElements.define('mr-tile', MRTile);
