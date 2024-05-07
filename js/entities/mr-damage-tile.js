class MRDamageTile extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-entity");
        this.el.id = 'damage-tile-container'; // for DOM debugging

        this.damageContainer = document.createElement("mr-div")
        this.damageValue = document.createElement("mr-text");
    }

    connected() {
        this.appendChild(this.el);

        this.pos = {
            x: 0,
            y: 0
        }

        // Damage display
        this.el.appendChild(this.damageContainer);
        Object.assign(this.damageContainer.style, {
            padding: "5px 10px",
            width: "auto",
            borderRadius: "5px",
            backgroundColor: COLORS.health,
            visibility: 'hidden'
        });
        this.boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.8, 0.1),
            new THREE.MeshPhongMaterial({
                color: COLORS.health,
            }));
        this.damageContainer.object3D.add(this.boxMesh);
        this.damageContainer.dataset.rotation = '270 0 270';

        // The text value
        this.damageContainer.appendChild(this.damageValue);
        this.damageValue.innerText = "99";
        this.damageValue.style.fontSize = '400px';
        this.damageValue.style.color = 'white';
        this.damageValue.dataset.position = `0.01 0.03 0.1`;
    }

    showDamage(string, color) {
        this.damageValue.innerText = string;
        this.damageContainer.style.visibility = "visible";

        this.boxMesh.material.color.setStyle(color);

        setTimeout(event => {
            this.damageValue.innerText = "";
            this.damageContainer.style.visibility = "hidden";
        }, 500);
    }
}

customElements.define('mr-damage-tile', MRDamageTile);
