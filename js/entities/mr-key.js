class MRKey extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/models/key1.glb";
        // this.el.src = "assets/models/boneTest1.glb";
        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-key', MRKey);
