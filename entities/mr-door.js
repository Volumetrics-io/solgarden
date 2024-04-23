class MRDoor extends MREntity {

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
        this.el.src = "models/door_01.glb";
        this.el.style.pointerEvents = 'none';

        this.dataset.rotation = `0 180 0`
        // this.el.dataset.compAnimation = "clip: 0; action: play;";
    }

}

customElements.define('mr-door', MRDoor);
