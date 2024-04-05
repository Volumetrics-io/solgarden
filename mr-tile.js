class MRTile extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.prop = document.createElement("mr-model");
        this.floorTile = document.createElement("mr-model");

        this.rotationCollection = [0, 90, 180, 270];
        this.modelCollection = ["tilegrass001", "tilegrass002", "tilegrass003"];

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

            // this.el.object3D.getObjectByName(this.elId).morphTargetInfluences[0] = Math.random();
        }
    }

    connected() {
        this.appendChild(this.el);

        let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
        this.el.dataset.rotation = `0 ${randomRotation} 0`;

        let randomModel = this.modelCollection[Math.floor(Math.random() * this.modelCollection.length)];
        this.el.src = `tiles/${randomModel}.glb`;

        this.appendChild(this.prop);

        // the translucent colored tile
        this.floorTile.dataset.position = "0 -0.3 0";
        let geometry = new THREE.BoxGeometry(0.92, 0.5, 0.92);
        let material = new THREE.MeshPhongMaterial({
            color: "#d3ceba",
            transparent: true,
            opacity: 0,
        })

        let mesh = new THREE.Mesh(geometry, material)
        this.floorTile.object3D.add(mesh);
        this.appendChild(this.floorTile);
    }
}

customElements.define('mr-tile', MRTile);
