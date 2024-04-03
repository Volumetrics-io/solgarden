class MRPlayer extends MREntity {

    constructor() {
        super()

        this.model = document.createElement("mr-model");

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
        }
    }

    connected() {
        this.appendChild(this.model);
        this.model.src = "tiles/chess_horse_01-white.glb";
    }

    moveTo(x,y) {
        let projected = this.parent.projectCoordinates(x, y, this.parent.heightMap[x][y]);
        this.dataset.position = `${projected.offsetRow} ${projected.offsetFloor} ${projected.offsetCol}`;
        // console.log(this.model.dataset.position)
        // this.dataset.position = position;
    }
}

customElements.define('mr-player', MRPlayer);
