class BoardSystem extends MRSystem {
    constructor() {
        super()

        this.grid = [];
        this.timer = 0;
    }

    update(deltaTime, frame) {
        this.timer += deltaTime;

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                const tile = this.grid[i][j];
                const tempPosition = tile.dataset.position.split(" ");
                const positionY = Math.sin(this.timer + i / 5 + j / 5) / 40;
                tile.dataset.position = `${tempPosition[0]} ${positionY} ${tempPosition[2]}`;
            }
        }
    }

    attachedComponent(entity) {
        let comp = entity.components.get('board')
        const models = ["tiles/tile_grass_01.glb", "tiles/tile_grass_02.glb", "tiles/tile_grass_03.glb"];
        // const models = ["tiles/0.glb", "tiles/1.glb", "tiles/2.glb"];
        const rotations = [0, 90, 180, 270];
        const scale = 0.1;

        entity.addEventListener("anchored", () => {
            console.log(entity.plane)
        })

        for (let r = 0; r < comp.rows; r++) {
            const row = [];

            for (let c = 0; c < comp.cols; c++) {

                // fix a bug that scale in headset is twice the scale in 2d
                let ratio = (false) ? 2 : 1;
                let offsetRow = r * scale / ratio - comp.rows * scale / (ratio * 2);
                let offsetCol = c * scale / ratio - comp.cols * scale / (ratio * 2);

                let randomModel = models[Math.floor(Math.random() * models.length)];
                let randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

                let tile = document.createElement("mr-tile");
                tile.dataset.rotation = `0 ${randomRotation} 0`;
                tile.dataset.position = `${offsetRow} 0 ${offsetCol}`;
                tile.dataset.scale = scale;
                tile.dataset.model = randomModel;
                entity.appendChild(tile);

                Object.assign(tile.style, {
                    scale: scale,
                    opacity: 1
                })

                row.push(tile);
            }

            this.grid.push(row);
        }

        // console.log(this.grid);
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

