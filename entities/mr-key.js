class MRKey extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");

        // this.el.onLoad = () => {
        //     this.el.object3D.traverse(object => {
        //         if (object.isMesh) {
        //             // Necessary for the single-faced
        //             // grass texture to appear correctly
        //             object.material.alphaTest = 0.5;
        //             object.receiveShadow = true;
        //             object.castShadow = true;
        //             object.morphTargets = true;
        //         }
        //     })
        // }
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "models/key_01.glb";
        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-key', MRKey);
