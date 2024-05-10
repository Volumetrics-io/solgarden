/////////////////////
// I
class MRSpawnI extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/biomes/spawn/title-solar.glb";
        this.el.style.pointerEvents = 'none';
        this.el.dataset.rotation = '0 270 0';
    }
}
customElements.define('mr-spawn-i', MRSpawnI);

/////////////////////
// II
class MRSpawnII extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/biomes/spawn/title-shack.glb";
        this.el.style.pointerEvents = 'none';
        this.el.dataset.rotation = '0 270 0';
    }
}
customElements.define('mr-spawn-ii', MRSpawnII);

/////////////////////
// II
class MRSpawnRock extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/biomes/spawn/rock001.glb";
        this.el.style.pointerEvents = 'none';
        this.el.dataset.rotation = '0 270 0';
    }
}
customElements.define('mr-spawn-rock', MRSpawnRock);
