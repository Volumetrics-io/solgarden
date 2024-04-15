class MRLoot extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.effect = this.dataset.effect ?? "health";

        switch(this.effect) {
            case "health":
                this.el.src = "tiles/loot-health.glb";
                break;
            case "range":
                this.el.src = "tiles/loot-range.glb";
                break;
        }


        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-loot', MRLoot);
