class MRActionBall extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-entity");
    }

    connected() {
        this.geometry = new THREE.SphereGeometry(0.008);
        this.material = new THREE.MeshPhongMaterial({
            color: "#00ff55",
            transparent: true,
            opacity: 1
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.el.object3D.add(this.mesh);
        this.appendChild(this.el);

        this.el.dataset.position = "0 0 -0.015";
    }
}

customElements.define('mr-action-ball', MRActionBall);
