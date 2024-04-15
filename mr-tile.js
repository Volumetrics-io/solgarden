class MRTile extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
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

                    // console.log(object)
                    object.morphTargetInfluences[0] = Math.random()
                }
            })
        }

        // this.debug.onLoad = () => {
        //     this.debug.style.fontSize = "50px";
        //     this.debug.textContent = 'debug';
        // }
    }

    connected() {
        // console.log();

        this.appendChild(this.el);
        const tileset = this.dataset.tileset.split(',');
        const tilepath = this.dataset.tilepath;

        let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
        this.dataset.rotation = `0 ${randomRotation} 0`;

        let randomModel = tileset[Math.floor(Math.random() * tileset.length)];
        this.el.src = tilepath + randomModel;

        // the translucent colored tile
        // this.floorTile.dataset.position = "0 -0.3 0";
        this.floorTile.dataset.position = "0 0.1 0";
        let geometry = new THREE.BoxGeometry(0.8, 0.1, 0.8);
        this.floorMaterial = new THREE.MeshPhongMaterial({
            color: "#d3ceba",
            transparent: true,
            opacity: 0.75
        })

        let mesh = new THREE.Mesh(geometry, this.floorMaterial)
        this.floorTile.object3D.add(mesh);
        this.appendChild(this.floorTile);

        this.numberString.dataset.position = '-0.1 0.25 0'
        this.numberString.style.fontSize = "400px";
        this.numberContainer.appendChild(this.numberString);

        this.numberContainer.dataset.position = '0 0.15 0'
        this.numberContainer.dataset.rotation = `270 0 -${randomRotation}`
        Object.assign(this.numberContainer.style, {
            width: "300px",
            height: "300px",
        })

        this.appendChild(this.numberContainer);
    }
}

customElements.define('mr-tile', MRTile);
