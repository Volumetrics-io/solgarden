class MRLoot extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);

        const effects = ["health", "range"]
        const rand = Math.floor(Math.random() * effects.length);
        this.effect = this.dataset.effect ?? effects[rand];

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
            State.health += Math.ceil(healthDiff / 3);
        }
        if (this.effect == 'range' &&
            State.range < State.maxRange) {
            const rangeDiff = State.maxRange - State.range;
            State.range += Math.ceil(rangeDiff / 3);
        }
    }

}

customElements.define('mr-loot', MRLoot);
