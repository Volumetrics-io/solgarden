class MRProjectile extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {

        this.type = this.dataset.type ?? "stone";

        console.log(this.dataset.type)

        this.appendChild(this.el);

        switch(this.type) {
            case 'stone':
                this.el.src = "assets/models/weaponProjectile-Stone1.glb";
                break;
            case 'arrow':
                this.el.src = "assets/models/weaponProjectile-Arrow1.glb";
                break;
            default:
                console.error('unhandled projectile type')
        }
        // this.el.src = "assets/models/weaponProjectile-Arrow1.glb";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-projectile', MRProjectile);
