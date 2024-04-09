class MRTile extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        // this.prop = document.createElement("mr-model");
        this.floorTile = document.createElement("mr-model");

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

                    // console.log(object)
                    object.morphTargetInfluences[0] = Math.random()
                }
            })
        }
    }

    connected() {
        // console.log();

        this.appendChild(this.el);
        const tileset = this.dataset.tileset.split(',');

        let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
        this.dataset.rotation = `0 ${randomRotation} 0`;

        let randomModel = tileset[Math.floor(Math.random() * tileset.length)];
        this.el.src = `tiles/${randomModel}.glb`;

        // for (let r = 0; r < this.rowCount; r++) {
        //     for (let c = 0; c < this.colCount; c++) {
        //         const tile = this.tilemap[r][c];

        // let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
        // tile.el.el.dataset.rotation = `0 ${randomRotation} 0`;

        // let randomModel = tileset[Math.floor(Math.random() * tileset.length)];
        // tile.el.el.src = `tiles/${randomModel}.glb`;
        //         tile.el.elId = randomModel;
        //     }
        // }

        // let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
        // this.el.dataset.rotation = `0 ${randomRotation} 0`;

        // let randomModel = tileset[Math.floor(Math.random() * tileset.length)];
        // this.el.src = `tiles/${randomModel}.glb`;
        // this.elId = randomModel;

        // let randomModel = this.tileSets[Math.floor(Math.random() * this.tileSets.length)];
        // this.el.src = `tiles/${randomModel}.glb`;
        // this.elId = randomModel;

        // this.appendChild(this.prop);

        // 60 % chance of plant on top
        // if (Math.random() > 0.4) {
        //     const props = ["tiles/plant_01.glb", "tiles/plant_02.glb", "tiles/plant_03.glb", "tiles/plant_04.glb", "tiles/plant_05.glb"];
        //     const randomRotation = Math.random() * 360;
        //     const randomScale = Math.random() * 0.5 + 0.5;
        //     const YOffset = Math.random() * 0.2;
        //     const XJitter = Math.random() * 0.6 - 0.3;
        //     const ZJitter = Math.random() * 0.6 - 0.3;

        //     this.prop.src = props[Math.floor(Math.random() * props.length)];
        //     this.prop.dataset.rotation = `0 ${randomRotation} 0`;
        //     this.prop.dataset.position = `${XJitter} -${YOffset} ${ZJitter}`;
        //     this.prop.style.scale = randomScale;
        // }

        // the translucent colored tile
        // this.floorTile.dataset.position = "0 -0.3 0";
        this.floorTile.dataset.position = "0 0 0";
        let geometry = new THREE.BoxGeometry(0.92, 0.5, 0.92);
        let material = new THREE.MeshPhongMaterial({
            color: "#d3ceba",
            transparent: true,
            opacity: 0
        })

        let mesh = new THREE.Mesh(geometry, material)
        this.floorTile.object3D.add(mesh);
        this.appendChild(this.floorTile);
    }
}

customElements.define('mr-tile', MRTile);
