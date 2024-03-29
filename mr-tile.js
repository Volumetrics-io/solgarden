class MRTile extends MREntity {

    constructor() {
        super()
        this.model = document.createElement("mr-model");
        this.prop = document.createElement("mr-model");

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: 'white',
            side: 2,
            transparent: true,
            opacity: 0.2,
            specular: '#7989c4'
        })

        this.mesh = new THREE.Mesh(geometry, material)
        this.object3D.add(this.mesh)

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

        if (Math.random() > 0.7 && this.dataset.isTop) {
            // There is a plant above the tile

            // const props = ["tiles/plant_01.glb", "tiles/plant_02.glb", "tiles/plant_03.glb", "tiles/plant_04.glb", "tiles/plant_05.glb"];
            const props = ["tiles/plant_01.glb"];
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

        this.move = () => {

        }

        this.model.addEventListener('mouseover', event => {
            // this.model.position.y = 0.4;
            this.model.traverseObjects(object => {
                if (object.isMesh) {
                    console.log("here")
                    object.material.opacity = 0.3;
                }
            });
        })

        this.model.addEventListener('mouseout', event => {
            console.log("mouseout");
        })
    }
}

customElements.define('mr-tile', MRTile);
