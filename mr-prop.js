class MRProp extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");

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
                    // object.morphTargetInfluences[0] = Math.random()
                }
            })
        }
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
    }
}

customElements.define('mr-prop', MRProp);
