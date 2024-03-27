class MRTile extends MREntity {

    constructor() {
        super()
        this.model = document.createElement("mr-model");
    }

    connected() {
        this.model.src = this.dataset.model;
        this.appendChild(this.model);
    }

}

customElements.define('mr-tile', MRTile);
