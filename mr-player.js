class MRPlayer extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.light = document.createElement("mr-light");

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
        }
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "tiles/player.glb";
        this.el.style.pointerEvents = 'none';

        this.appendChild(this.light);
        this.light.setAttribute('color', "#ffffff")
        this.light.setAttribute('intensity', 0.03)

        // this.light.intensity = 2;
        this.light.dataset.position = `0 1 0`;
    }
}

customElements.define('mr-player', MRPlayer);
