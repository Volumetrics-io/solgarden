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
                this.el.src = "assets/models/bolts1.glb";
                break;
            case "range":
                this.el.src = "assets/models/battery1.glb";
                break;
        }

        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';
    }

    applyEffect() {

        if (this.effect == 'health' &&
            State.health < State.maxHealth) {
            const healthDiff = State.maxHealth - State.health;
            State.health += Math.floor(healthDiff / 3);
        }
        if (this.effect == 'range' &&
            State.range < State.maxRange) {
            const rangeDiff = State.maxRange - State.range;
            State.range += Math.floor(rangeDiff / 3);
        }

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
