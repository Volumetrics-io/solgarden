class MRTile extends MREntity {

    constructor() {
        super()

        this.model = document.createElement("mr-model");
        this.prop = document.createElement("mr-model");
        this.floorTile = document.createElement("mr-model");

        // console.log(this.rowID);
        // this.player = document.createElement("mr-model");

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

            this.model.object3D.getObjectByName(this.modelId).morphTargetInfluences[0] = Math.random();

            // Add a transparent box around the tile
            // let geometry = new THREE.BoxGeometry(1, 0.75, 1);
            // let material = new THREE.MeshPhongMaterial({
            //     color: 'turquoise',
            //     side: 2,
            //     transparent: true,
            //     opacity: 0.2,
            //     specular: '#fff'
            // })

            // let mesh = new THREE.Mesh(geometry, material)
            // this.model.object3D.add(mesh);

            // this.model.addEventListener('hoverstart', event => {
            //     console.log("touched")
            // })

            // this.model.addEventListener('click', event => {
            //     // console.log("clicked")
            //     this.parent.movePlayer(this.position);
            // })
        }
    }

    connected() {
        this.modelId = this.dataset.model;
        this.appendChild(this.model);

        this.model.src = `tiles/${this.dataset.model}.glb`;


        // var isTop = this.dataset.isTop == "true" ? true : false
        if (Math.random() > 0.4) {
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

        // if (isTop) {
            this.floorTile.dataset.position = "0 0.07 0";
            let geometry = new THREE.BoxGeometry(0.92, 0.25, 0.92);
            let material = new THREE.MeshPhongMaterial({
                color: "#d3ceba",
                // side: 2,
                transparent: true,
                opacity: 0.2,
                // specular: '#fff'
            })


            let mesh = new THREE.Mesh(geometry, material)
            this.floorTile.object3D.add(mesh);
            this.appendChild(this.floorTile);
            // this.floorTile.object3D.children[0].material.opacity = 1;

            // this.floorTile.addEventListener("mouseover", () => {
            //     // works
            //     console.log('mouseover');

            //     const r = parseInt(this.dataset.rowId);
            //     const c = parseInt(this.dataset.columnId);

            //     const px = this.parent.playerPos.x;
            //     const py = this.parent.playerPos.y;

            //     let canMove = false;
            //     if (r + 1 == px && c + 2 == py ||
            //         r + 2 == px && c + 1 == py ||
            //         r + 2 == px && c - 1 == py ||
            //         r + 1 == px && c - 2 == py ||
            //         r - 1 == px && c - 2 == py ||
            //         r - 2 == px && c - 1 == py ||
            //         r - 2 == px && c + 1 == py ||
            //         r - 1 == px && c + 2 == py
            //     ) {
            //         canMove = true;
            //     }

            //     if (canMove) {
            //         this.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
            //             color: "#00ff00",
            //             transparent: true,
            //             opacity: 0.75
            //         });
            //     } else {
            //         this.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
            //             color: "#ff0000",
            //             transparent: true,
            //             opacity: 0.75,
            //         });
            //     }

            // })

            // this.floorTile.addEventListener("mouseenter", () => {
            //     // doesn't works
            //     console.log('mouseenter');
            // })

            // this.floorTile.addEventListener("mouseout", () => {
            //     // doesn't work
            //     console.log('mouseout');
            // })

            // this.floorTile.addEventListener("mouseleave", () => {
            //     this.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
            //         color: "#d3ceba",
            //         transparent: true,
            //         opacity: 0.2,
            //     });

            //     console.log('mouseleave');
            // })

            // this.floorTile.addEventListener("hoverend", () => {
            //     console.log('hoverend');
            // })

            // this.floorTile.addEventListener("touchend", () => {
            //     console.log('touchend');
            // })

            // this.floorTile.addEventListener("selectend", () => {
            //     console.log('selectend');
            // })

            // this.floorTile.addEventListener("click", () => {
            //     console.log('click');

            //     const r = parseInt(this.dataset.rowId);
            //     const c = parseInt(this.dataset.columnId);

            //     const px = this.parent.playerPos.x;
            //     const py = this.parent.playerPos.y;

            //     let canMove = false;
            //     if (r + 1 == px && c + 2 == py ||
            //         r + 2 == px && c + 1 == py ||
            //         r + 2 == px && c - 1 == py ||
            //         r + 1 == px && c - 2 == py ||
            //         r - 1 == px && c - 2 == py ||
            //         r - 2 == px && c - 1 == py ||
            //         r - 2 == px && c + 1 == py ||
            //         r - 1 == px && c + 2 == py
            //     ) {
            //         canMove = true;
            //     }

            //     if (canMove) {
            //         this.parent.movePlayer(parseInt(this.dataset.rowId), parseInt(this.dataset.columnId));

            //         this.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
            //             color: "#d3ceba",
            //             transparent: true,
            //             opacity: 0.2
            //         });
            //     }
            // })
        // }

    }
}

customElements.define('mr-tile', MRTile);
