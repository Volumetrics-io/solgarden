class MRGoal extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");

    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/models/goal1.glb";
        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-goal', MRGoal);
