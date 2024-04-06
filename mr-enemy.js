class MREnemy extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");

        this.el.onLoad = () => {
            this.el.object3D.traverse(object => {
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
        this.appendChild(this.el);
        this.el.src = "tiles/enemy_temp.glb";
    }

    // moveTo(x,y) {
    //     let projected = this.parent.projectCoordinates(x, y, this.parent.heightMap[x][y]);
    //     this.dataset.position = `${projected.offsetRow} ${projected.offsetFloor} ${projected.offsetCol}`;
    //     // console.log(this.el.dataset.position)
    //     // this.dataset.position = position;
    // }
}

customElements.define('mr-enemy', MREnemy);
