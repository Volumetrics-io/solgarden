class MRWeapon extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        const subtype = this.dataset.model ?? "twig";

        WEAPONS.forEach((type, i) => {
            type.forEach((weapon, i) => {
                if(weapon.subtype === subtype) {
                    this.el.src = weapon.gameModel;
                }
            });
        });

        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-weapon', MRWeapon);
