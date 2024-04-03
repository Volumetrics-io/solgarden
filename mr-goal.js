class MRGoal extends MREntity {

    constructor() {
        super()

        this.model = document.createElement("mr-model");

        this.model.onLoad = () => {
            this.model.object3D.traverse(object => {
                if (object.isMesh) {
                    // Necessary for the single-faced
                    // grass texture to appear correctly
                    object.material.alphaTest = 0.5;
                    object.receiveShadow = true;
                    object.castShadow = true;
                    object.morphTargets = true;
                }
            })
        }
    }

    connected() {
        this.appendChild(this.model);
        this.model.src = "tiles/goal1.glb";
        this.model.dataset.compAnimation = "clip: 0; action: play;";
    }

}

customElements.define('mr-goal', MRGoal);
