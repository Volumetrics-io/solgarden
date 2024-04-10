class MRActionBall extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
    }

    connected() {

        this.el.dataset.position = "0 0 0";
        let geometry = new THREE.BoxGeometry(1, 0.2, 0.2);
        let material = new THREE.MeshPhongMaterial({
            color: "#00ff55",
            transparent: true,
            opacity: 1
        })

        let mesh = new THREE.Mesh(geometry, material)
        this.el.object3D.add(mesh);
        this.appendChild(this.el);
    }
}

customElements.define('mr-action-ball', MRActionBall);
