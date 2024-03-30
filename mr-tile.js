class MRTile extends MREntity {

    constructor() {
        super()

        this.model = document.createElement("mr-model");
        this.prop = document.createElement("mr-model");
        this.floorTile = document.createElement("mr-model");
        this.player = document.createElement("mr-model");

        this.model.onLoad = () => {
            this.model.object3D.traverse(object => {
                if (object.isMesh) {
                    // Necessary for the single-faced
                    // grass texture to appear correctly
                    object.material.alphaTest = 0.5;
                    object.receiveShadow = true;
                    object.castShadow = true;
                    object.morphTargets = true;
                }
            })

            // Add a transparent box around the tile
            // let geometry = new THREE.BoxGeometry(1, 0.75, 1);
            // let material = new THREE.MeshPhongMaterial({
            //     color: 'orange',
            //     side: 2,
            //     transparent: true,
            //     opacity: 0.1,
            //     specular: '#fff'
            // })

            // let mesh = new THREE.Mesh(geometry, material)
            // this.model.object3D.add(mesh);

            this.model.addEventListener('click', event => {
                console.log("clicked")
            })
        }
    }

    connected() {
        this.model.src = this.dataset.model;
        this.appendChild(this.model);


        var isTop = this.dataset.isTop == "true" ? true : false
        if (isTop && Math.random() > 0.4) {
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

        var isPlayer = this.dataset.isPlayer == "true" ? true : false
        if (isPlayer) {
            this.player.src = "tiles/chess_castle_01.glb";
            Object.assign(this.player.style, {
                scale: 1,
            })
            this.appendChild(this.player);
        }

        // if (isTop) {
        //     this.floorTile.dataset.position = "0 0.07 0";
        //     var isBlack = this.dataset.isBlack == "true" ? true : false
        //     let tileColor = (isBlack) ? "white" : "black";
        //     let geometry = new THREE.BoxGeometry(0.92, 0.04, 0.92);
        //     let material = new THREE.MeshPhongMaterial({
        //         color: tileColor,
        //         side: 2,
        //         transparent: true,
        //         opacity: 0.8,
        //         specular: '#fff'
        //     })

        //     let mesh = new THREE.Mesh(geometry, material)
        //     this.floorTile.object3D.add(mesh);
        //     this.appendChild(this.floorTile);
        // }

    }
}

customElements.define('mr-tile', MRTile);
