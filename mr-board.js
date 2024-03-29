class BoardSystem extends MRSystem {
    constructor() {
        super()

        this.grid = [];
        this.timer = 0;
    }

    update(deltaTime, frame) {
        // this.timer += deltaTime / 3;

        // for (let i = 0; i < this.grid.length; i++) {
        //     for (let j = 0; j < this.grid[i].length; j++) {
        //         const tile = this.grid[i][j];
        //         const tempPosition = tile.dataset.position.split(" ");
        //         const positionY = Math.sin(this.timer + i / 1.5 + j / 1.5) / 20;
        //         tile.dataset.position = `${tempPosition[0]} ${positionY} ${tempPosition[2]}`;
        //     }
        // }
    }

    attachedComponent(entity) {
        let comp = entity.components.get('board')
        const models = ["tiles/tile_grass_01.glb", "tiles/tile_grass_02.glb", "tiles/tile_grass_03.glb"];
        const rotations = [0, 90, 180, 270];
        const scale = 0.1;

        // entity.addEventListener("anchored", () => {
        //     console.log(entity.plane)
        // })

        // Generate the height map using smoothNoise
        let heightMap = Array.from({ length: comp.rows }, (_, x) =>
            Array.from({ length: comp.cols }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * comp.floors))
        );

        for (let f = 0; f < comp.floors; f++) {
            const floor = [];

            for (let r = 0; r < comp.rows; r++) {
                const row = [];

                for (let c = 0; c < comp.cols; c++) {

                    const desktopFix = true;

                    // fix a bug that scale in headset is twice the scale in 2d
                    let ratio = (desktopFix) ? 2 : 1;
                    let offsetRow = r * scale / ratio - comp.rows * scale / (ratio * 2);
                    let offsetCol = c * scale / ratio - comp.cols * scale / (ratio * 2);
                    let offsetFloor = f * scale / ratio / 2;

                    let randomModel = models[Math.floor(Math.random() * models.length)];
                    let randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

                    if(f <= heightMap[r][c]) {
                    // if (f <= perlin.get(r, c)) {
                        let tile = document.createElement("mr-tile");
                        tile.dataset.isTop = (f == heightMap[r][c]) ? true : false;
                        tile.dataset.rotation = `0 ${randomRotation} 0`;
                        tile.dataset.position = `${offsetRow} ${offsetFloor} ${offsetCol}`;
                        tile.dataset.scale = scale;
                        tile.dataset.model = randomModel;
                        entity.appendChild(tile);

                        Object.assign(tile.style, {
                            scale: scale,
                            opacity: 1
                        })

                        row.push(tile);
                    }

                }

                floor.push(row);
            }

            this.grid.push(floor);
        }
    }
}

let boardsys = new BoardSystem()

