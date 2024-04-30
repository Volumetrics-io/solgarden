class MRWeapon extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        const model = this.dataset.model ?? "shortsword";

        const weaponModels = {
            twig: "models/weapon-stick1-pickup.glb",
            shortsword: "models/weapon-shortSword1-pickup.glb",
            slingshot: "models/weapon-slingshot1-pickup.glb",
            bow: "models/weapon-bow1-pickup.glb",
        }

        this.el.src = weaponModels[model];
        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-weapon', MRWeapon);
