/////////////////////
// I
class MRChargingStationI extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "tiles/battery-room/solarStation1-1.glb";
        this.el.style.pointerEvents = 'none';
    }
}
customElements.define('mr-charging-station-i', MRChargingStationI);

/////////////////////
// II
class MRChargingStationII extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "tiles/battery-room/solarStation1-2.glb";
        this.el.style.pointerEvents = 'none';
    }
}
customElements.define('mr-charging-station-ii', MRChargingStationII);

/////////////////////
// III
class MRChargingStationIII extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "tiles/battery-room/solarStation1-3.glb";
        this.el.style.pointerEvents = 'none';
    }
}
customElements.define('mr-charging-station-iii', MRChargingStationIII);

/////////////////////
// *IV
class MRChargingStationIV extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "tiles/battery-room/solarStation1-4.glb";
        this.el.style.pointerEvents = 'none';
    }

    updateBatteryLevel(value) {
        this.el.object3D.traverse(object => {
            if (object.isMesh && object.morphTargetInfluences) {
                object.morphTargetInfluences[0] = value;
            }
        })
    }
}
customElements.define('mr-charging-station-iv', MRChargingStationIV);
