class MRMeleeWeapon extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.name = this.dataset.name ?? "short-sword";

        console.log(this.name);

        switch(this.name) {
            case "short-sword":
                this.el.src = "models/weapon-shortSword01.glb";
                break;
            case "twig":
                this.el.src = "models/weapon-stick1.glb";
                break;
        }


        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-melee-weapon', MRMeleeWeapon);
