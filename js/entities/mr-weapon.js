class MRWeapon extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        const model = this.dataset.model ?? "shortsword";

        this.el.src = WeaponModels[model];
        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-weapon', MRWeapon);
