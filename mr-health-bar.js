class MRHealthBar extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-entity");
    }

    connected() {
        this.geometry = new THREE.BoxGeometry(0.1, 0.01, 0.01);
        this.material = new THREE.MeshPhongMaterial({
            color: "#e72d75",
            transparent: true,
            opacity: 1
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.el.object3D.add(this.mesh);
        this.appendChild(this.el);

        this.el.dataset.position = "0 0.05 0";
    }

    setHealth(health) {
        // that's supposed to work
        // this.el.object3D.scale.set(0.1 * health, 0, 0);

        // that works
        //  TODO: figure out why the other version doesn't work
        this.mesh.geometry.dispose()
        this.mesh.geometry = new THREE.BoxGeometry(0.1 * health, 0.005, 0.015);

        // const offsetX = - health * 0.1;
        // this.el.dataset.position = `${offsetX / 2} 0.035 -0.015`;

        // console.log(health);
    }
}

customElements.define('mr-health-bar', MRHealthBar);
