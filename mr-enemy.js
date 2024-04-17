class MREnemy extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.damageContainer = document.createElement("mr-div")
        this.damageValue = document.createElement("mr-text");

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
        this.el.style.pointerEvents = 'none';

        this.appendChild(this.damageContainer);
        this.damageContainer.dataset.position = '0 2.5 0';
        this.damageContainer.style.scale = 1 / 0.05; // will be fixed soon in MRjs
        Object.assign(this.damageContainer.style, {
            padding: "5px 10px",
            width: "auto",
            borderRadius: "5px",
            backgroundColor: '#e72d75',
            visibility: 'hidden'
        });

        this.damageContainer.appendChild(this.damageValue);
        this.damageValue.innerText = '3';
        this.damageValue.style.fontSize = '20px';
        this.damageValue.style.color = 'white';
        this.damageValue.textObj.position.setX((-this.damageValue.width / 2) / 0.005);
    }

    showDamage(string) {
        this.damageValue.innerText = string;
        this.damageContainer.style.visibility = "visible";

        setTimeout(event => {
            this.damageContainer.style.visibility = "hidden";
        }, 500);
    }
}

customElements.define('mr-enemy', MREnemy);
