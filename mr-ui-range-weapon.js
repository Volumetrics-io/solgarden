class MRUIRangeWeapon extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.type = this.dataset.effect ?? "short-sword";

        switch(this.type) {
            case "short-sword":
                this.el.src = "models/weapon-shortSword01.glb";
                break;
        }


        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-ui-range-weapon', MRUIRangeWeapon);
