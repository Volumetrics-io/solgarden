class MRChargingStation extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "tiles/battery-room/solarStation1-4.glb";
        this.el.style.pointerEvents = 'none';

        this.dataset.rotation = `0 90 0`;
    }

    updateBatteryLevel(value) {
        this.el.object3D.traverse(object => {
            if (object.isMesh && object.morphTargetInfluences) {
                object.morphTargetInfluences[0] = value;
            }
        })
    }
}

customElements.define('mr-charging-station', MRChargingStation);
