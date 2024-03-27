class MRBoard extends MREntity {

    constructor() {
        super()

        //// DEBUG
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.25);
        const material = new THREE.MeshPhongMaterial({
            color: '#0235ff',
            side: 2,
            transparent: true,
            opacity: 0.2,
            specular: '#7989c4',
            clipping: true
        })

        this.mesh = new THREE.Mesh(geometry, material)
        this.object3D.add(this.mesh)
        //// DEBUG
    }

    connectedCallback() {
        this.generateGridElements(8, 8);
    }

    generateGridElements(n, m) {
        const models = ["/tiles/0.glb", "/tiles/1.glb", "/tiles/2.glb"];
        const rotations = [0, 90, 180, 270];
        const scale = 0.1;

        for (let x = 0; x < n; x++) {
            for (let y = 0; y < m; y++) {
                const offsetX = x * scale;
                const offsetY = y * scale;

                let tile = document.createElement("mr-tile");
                tile.dataset.model = models[Math.floor(Math.random() * models.length)];
                tile.dataset.scale = scale;
                tile.dataset.rotation = "0 0 " + rotations[Math.floor(Math.random() * rotations.length)];
                tile.dataset.position = `${offsetX} 0 ${offsetY}`;
                this.append(tile);
            }
        }
    }
}

customElements.define('mr-board', MRBoard);
