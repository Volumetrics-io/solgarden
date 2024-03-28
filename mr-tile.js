class MRTile extends MREntity {

    constructor() {
        super()
        this.model = document.createElement("mr-model");

        this.prop = document.createElement("mr-model");

        // this.model.onLoad = () => {
        //     this.model.object3D.traverse(child => {
        //         if (child.isMesh) {
        //             child.material.transparent = true;
        //             child.material.depthWrite = false;
        //         }
        //     })
        // }
    }

    connected() {
        this.model.src = this.dataset.model;
        this.appendChild(this.model);

        // const props = ["tiles/plant_01.glb", "tiles/plant_02.glb"];
        // if(Math.random() > 0.95) {
        //     this.prop.src = props[Math.floor(Math.random() * props.length)];
        //     Object.assign(this.prop.style, {
        //         scale: 0.2,
        //     })
        //     this.appendChild(this.prop);
        // }

    }

}

customElements.define('mr-tile', MRTile);
