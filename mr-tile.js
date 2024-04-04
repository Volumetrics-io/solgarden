class MRTile extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.prop = document.createElement("mr-model");
        this.floorTile = document.createElement("mr-model");

        this.rotationCollection = [0, 90, 180, 270];

        this.randomize();

        this.el.onLoad = () => {
            this.el.object3D.traverse(object => {
                if (object.isMesh) {
                    // Necessary for the single-faced
                    // grass texture to appear correctly
                    object.material.alphaTest = 0.5;
                    object.receiveShadow = true;
                    object.castShadow = true;
                    object.morphTargets = true;
                }
            })

            this.el.object3D.getObjectByName(this.elId).morphTargetInfluences[0] = Math.random();
        }
    }

    connected() {
        this.elId = this.dataset.model;
        this.appendChild(this.el);
        this.el.src = `tiles/${this.dataset.model}.glb`;

        // 60% chance of plant on top
        if (Math.random() > 0.6) {
            const props = ["tiles/plant_01.glb", "tiles/plant_02.glb", "tiles/plant_03.glb", "tiles/plant_04.glb", "tiles/plant_05.glb"];
            const randomRotation = Math.random() * 360;
            const randomScale = Math.random() * 0.3 + 0.7;
            const YOffset = Math.random() * 0.1;
            const XJitter = Math.random() * 0.6 - 0.3;
            const ZJitter = Math.random() * 0.6 - 0.3;

            this.prop.src = props[Math.floor(Math.random() * props.length)];
            this.prop.dataset.rotation = `0 ${randomRotation} 0`;
            this.prop.dataset.position = `${XJitter} -${YOffset} ${ZJitter}`;
            Object.assign(this.prop.style, {
                scale: randomScale,
            })
            this.appendChild(this.prop);
        }

        // the translucent colored tile
        this.floorTile.dataset.position = "0 0.07 0";
        let geometry = new THREE.BoxGeometry(0.92, 0.25, 0.92);
        let material = new THREE.MeshPhongMaterial({
            color: "#d3ceba",
            transparent: true,
            opacity: 0.2,
        })

        let mesh = new THREE.Mesh(geometry, material)
        this.floorTile.object3D.add(mesh);
        this.appendChild(this.floorTile);
    }

    randomize() {
        let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
        this.el.dataset.rotation = `0 ${randomRotation} 0`;
    }
}

customElements.define('mr-tile', MRTile);
