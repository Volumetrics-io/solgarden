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


        // There is a prop above the tile
        if (Math.random() > 0.75) {
            const props = ["tiles/plant_01.glb", "tiles/plant_02.glb"];
            const randomRotation = Math.random() * 360;
            const randomScale = Math.random() * 0.3 + 0.5;
            const randomYOffset =  Math.random() * 0.2;
            const randomXJitter = Math.random() * 0.2 - 0.1;
            const randomZJitter = Math.random() * 0.2 - 0.1;

            this.prop.src = props[Math.floor(Math.random() * props.length)];
            this.prop.dataset.rotation = `0 ${randomRotation} 0`;
            this.prop.dataset.position = `${randomXJitter} -${randomYOffset} ${randomZJitter}`;
            Object.assign(this.prop.style, {
                scale: randomScale,
            })
            this.appendChild(this.prop);
        }

    }

}

customElements.define('mr-tile', MRTile);
