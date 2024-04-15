class MRChargingStation extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "tiles/charging-station.glb";
        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-charging-station', MRChargingStation);
