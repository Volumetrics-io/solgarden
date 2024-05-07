class MRStartWall extends MREntity {

    constructor() {
        super()

        // this.container = document.createElement("mr-entity");
        // this.container.id = 'start-screen'; // for DOM debugging

        // this.logo = document.createElement("mr-model");

        // this.chapeau = document.createElement('mr-text');
    }

    connected() {
        // this.appendChild(this.container);

        // this.container.appendChild(this.chapeau);

        // this.container.appendChild(this.logo);
        // this.logo.src = './assets/models/solgarden.glb';
        // this.logo.style.scale = 10;
        // this.logo.dataset.rotation = `0 270 0`;
        // this.logo.dataset.position = `-0.42 1.7 -1.7`;

        const wallGeo = new THREE.BoxGeometry(0.1, 3, 6);
        wallGeo.translate(-0.5, 1.25, 0);

        this.boxMesh = new THREE.Mesh(
            wallGeo,
            new THREE.MeshPhongMaterial({
                color: "hsl(35, 46%, 80%)",
            }));
        this.object3D.add(this.boxMesh);
    }

    update(timer) {
        // console.log(timer)
    }
}

customElements.define('mr-start-wall', MRStartWall);
