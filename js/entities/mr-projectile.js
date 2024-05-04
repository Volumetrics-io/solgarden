class MRProjectile extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/models/projectile.glb";
        // this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-projectile', MRProjectile);
