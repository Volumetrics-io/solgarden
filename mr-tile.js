class MRTile extends MREntity {

    constructor() {
        super()
        this.model = document.createElement("mr-model");
        this.prop = document.createElement("mr-model");

        // This is necessary for the
        // single-faced grass texture
        // to appear correctly
        this.model.onLoad = this.prop.onLoad = () => {
            this.model.object3D.traverse(object => {
                if (object.isMesh) {
                    object.material.alphaTest = 0.5;
                    object.receiveShadow = true;
                    object.castShadow = true;
                }
            })
        }
    }

    connected() {
        this.model.src = this.dataset.model;
        this.appendChild(this.model);

        // console.log(this.dataset.isTop)

        if (Math.random() > 0.7 && this.dataset.isTop) {
            // There is a plant above the tile

            const props = ["tiles/plant_01.glb", "tiles/plant_02.glb", "tiles/plant_03.glb", "tiles/plant_04.glb", "tiles/plant_05.glb"];
            const randomRotation = Math.random() * 360;
            const randomScale = Math.random() * 0.3 + 0.7;
            const YOffset = Math.random() * 0.1;
            const XJitter = Math.random() * 0.2 - 0.1;
            const ZJitter = Math.random() * 0.2 - 0.1;

            this.prop.src = props[Math.floor(Math.random() * props.length)];
            this.prop.dataset.rotation = `0 ${randomRotation} 0`;
            this.prop.dataset.position = `${XJitter} -${YOffset} ${ZJitter}`;
            Object.assign(this.prop.style, {
                scale: randomScale,
            })
            this.appendChild(this.prop);
        }

        this.addEventListener('hoverstart', (event) => {
            console.log(event);
        })
    }
}

customElements.define('mr-tile', MRTile);
