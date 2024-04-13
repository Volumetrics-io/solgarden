class MRLoot extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "tiles/loot.glb";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-loot', MRLoot);
