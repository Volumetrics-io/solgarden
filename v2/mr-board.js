class BoardSystem extends MRSystem {
    constructor() {
        super()
    }

    update(deltaTime, frame) {
        for (const entity of this.registry) {
            entity.childNodes.forEach(child => {
                // console.log(deltaTime, child);
            });
        }
    }

    // Called when an orbit component is attached
    attachedComponent(entity) {
        let comp = entity.components.get('board') // entity.dataset.compBoard == ""
        const models = ["tiles/0.glb", "tiles/1.glb", "tiles/2.glb"];
        const rotations = [0, 90, 180, 270];
        const scale = 0.1;

        for (let r = 0; r < comp.rows; r++) {
            for (let c = 0; c < comp.cols; c++) {
                let offsetRow = r * scale;
                let offsetCol = c * scale;
                let randomModel = models[Math.floor(Math.random() * models.length)];
                let randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

                let tile = document.createElement("mr-model");
                tile.dataset.rotation = `0 ${randomRotation} 0`;
                tile.dataset.position = `${offsetRow} 0 ${offsetCol}`;
                tile.src = randomModel;
                entity.appendChild(tile);

                Object.assign(tile.style, {
                    scale: scale,
                    opacity: 1
                })

            }
        }
    }


    // do something when an orbit component is updated
    updatedComponent(entity, oldData) {
        //...
    }

    // do something when an orbit component is detached
    detachedComponent(entity) {
        //...
    }
}

let boardsys = new BoardSystem()

