/////////////////////
// I
class MRBatteryI extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "biomes/battery-room/solarStation1-1.glb";
        this.el.style.pointerEvents = 'none';
    }
}
customElements.define('mr-battery-i', MRBatteryI);

/////////////////////
// II
class MRBatteryII extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "biomes/battery-room/solarStation1-2.glb";
        this.el.style.pointerEvents = 'none';
    }
}
customElements.define('mr-battery-ii', MRBatteryII);

/////////////////////
// III
class MRBatteryIII extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "biomes/battery-room/solarStation1-3.glb";
        this.el.style.pointerEvents = 'none';
    }
}
customElements.define('mr-battery-iii', MRBatteryIII);

/////////////////////
// *IV
class MRBatteryIV extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "biomes/battery-room/solarStation1-4.glb";
        this.el.style.pointerEvents = 'none';
    }

    updateLevel(value) {
        this.el.object3D.traverse(object => {
            if (object.isMesh && object.morphTargetInfluences) {
                object.morphTargetInfluences[0] = value;
            }
        })
    }
}
customElements.define('mr-battery-iv', MRBatteryIV);
