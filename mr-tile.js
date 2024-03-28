class MRTile extends MREntity {

    constructor() {
        super()
        this.model = document.createElement("mr-model");

        this.prop = document.createElement("mr-model");

        this.model.onLoad = () => {
            this.model.object3D.traverse(child => {
                if (child.isMesh) {
                    child.material.transparent = true;
                }
            })
        }
    }

    connected() {
        this.model.src = this.dataset.model;
        this.appendChild(this.model);

        if(Math.random() > 0.95) {
            this.prop.src = "tiles/plant_02.glb";
            Object.assign(this.prop.style, {
                scale: 0.2,
            })

            this.appendChild(this.prop);
        } else if(Math.random() > 0.95) {
            this.prop.src = "tiles/plant_01.glb";
            this.appendChild(this.prop);
        }

        
    }

}

customElements.define('mr-tile', MRTile);
