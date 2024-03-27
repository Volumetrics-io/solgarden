class MRBoard extends MREntity {

    constructor() {
        super()
    }

    connectedCallback() {
        const models = ["tiles/0.glb", "tiles/1.glb", "tiles/2.glb"];
        const rotations = [0, 90, 180, 270];
        const scale = 0.1;
        const rows = 8;
        const columns = 8;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                let offsetRow = r * scale;
                let offsetCol = c * scale;
                let randomModel = models[Math.floor(Math.random() * models.length)];
                let randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

                let tile = document.createElement("mr-model");
                tile.dataset.rotation = `0 ${randomRotation} 0`;
                tile.dataset.position = `${offsetRow} 0 ${offsetCol}`;
                tile.src = randomModel;
                this.parentElement.appendChild(tile);

                Object.assign(tile.style, {
                    scale: scale,
                    opacity: 1
                })



            }
        }
    }
}

customElements.define('mr-board', MRBoard);
