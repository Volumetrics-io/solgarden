class MRTile extends MREntity {

    constructor() {
        super()
    }

    connectedCallback() {
        let model = document.createElement("mr-model");
        model.setAttribute("src", this.dataset.model);
        Object.assign(model.style, {
            scale: 0.1
        })
        model.dataset.rotation = this.dataset.rotation;
        model.dataset.position = this.dataset.position;
        this.append(model);
    }

}

customElements.define('mr-tile', MRTile);
