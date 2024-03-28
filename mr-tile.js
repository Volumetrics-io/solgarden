class MRTile extends MREntity {

    constructor() {
        super()
        this.model = document.createElement("mr-model");
        this.prop = document.createElement("mr-model");

        this.model.onLoad = () => {
            this.model.object3D.traverse(object => {
                if (object.isMesh) {
                    object.material.alphaTest = 0.5;
                }
            })
        }
    }

    connected() {
        this.model.src = this.dataset.model;
        this.appendChild(this.model);

        const props = ["tiles/plant_01.glb", "tiles/plant_02.glb"];
        if(Math.random() > 0.95) {
            this.prop.src = props[Math.floor(Math.random() * props.length)];
            Object.assign(this.prop.style, {
                scale: 0.85,
            })
            this.appendChild(this.prop);
        }

    }

}

customElements.define('mr-tile', MRTile);
