class MRLoot extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.effect = this.dataset.effect ?? "health";

        switch (this.effect) {
            case "health":
                this.el.src = "tiles/loot-health.glb";
                break;
            case "range":
                this.el.src = "tiles/loot-range.glb";
                break;
        }

        this.el.style.pointerEvents = 'none';
    }

    applyEffect(state) {
        // TODO: should the effect be applied here?
        // let state = state;
        // console.log(state)
        //
        // switch (this.effect) {
        //     case "health":
        //         if (state.health < state.maxHealth) {
        //             state.health++;
        //         }
        //         console.log("increased health");
        //         break;
        //     case "range":
        //         if (state.range < state.maxRange) {
        //             state.range++;
        //         }
        //         console.log("increased range");
        //         break;
        // }
        //
        // return state;
    }

}

customElements.define('mr-loot', MRLoot);
