class BoardSystem extends MRSystem {
    constructor() {
        super()

        this.grid = [];
        this.timer = 0;
    }

    update(deltaTime, frame) {
        this.timer += deltaTime * 2;

        for (let f = 0; f < this.grid.length; f++) {
            for (let r = 0; r < this.grid[f].length; r++) {
                for (let c = 0; c < this.grid[f][r].length; c++) {
                    const tile = this.grid[f][r][c];
                    const tempPosition = tile.dataset.position.split(" ");
                    const deltaY = Math.sin(this.timer + f / 1.5 + r / 1.5 + c / 1.5) / 100;
                    const positionY = parseFloat(tile.dataset.offsetFloor) + deltaY;
                    tile.dataset.position = `${tempPosition[0]} ${positionY} ${tempPosition[2]}`;
                }
            }
        }
    }

    attachedComponent(entity) {
        let comp = entity.components.get('board')
        const models = [
            "tiles/old/tile_grass_01.glb",
            "tiles/old/tile_grass_02.glb",
            "tiles/old/tile_grass_03.glb"];
        // const models = ["tiles/tile_grass_01.glb"];
        // const models = ["tiles/0.glb", "tiles/1.glb", "tiles/2.glb"];
        const rotations = [0, 90, 180, 270];
        const scale = 0.1;

        // Generate the height map using smoothNoise
        let heightMap = Array.from({ length: comp.rows }, (_, x) =>
            Array.from({ length: comp.cols }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * comp.floors))
        );

        let spawnX = Math.floor(Math.random() * comp.rows);
        let spawnY = Math.floor(Math.random() * comp.cols);

        // console.log(spawnX, spawnY);

        // console.log(heightMap);

        // const heightMap = [
        //     [1, 1, 0, 0],
        //     [2, 1, 0, 1],
        //     [2, 1, 0, 0],
        //     [1, 1, 0, 0]];

        for (let f = 0; f < comp.floors; f++) {
            const floor = [];

            for (let r = 0; r < comp.rows; r++) {
                const row = [];

                for (let c = 0; c < comp.cols; c++) {

                    // fix a bug that scale in headset is twice the scale in 2d
                    const desktopFix = false;
                    const ratio = (desktopFix) ? 2 : 1;


                    let offsetRow = r * scale / ratio - (comp.rows * scale) / 2 / ratio;
                    let offsetCol = c * scale / ratio - (comp.cols * scale) / 2 / ratio;
                    let offsetFloor = f * scale / ratio * 0.75;

                    let randomModel = models[Math.floor(Math.random() * models.length)];
                    let randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

                    let isTop = (f === heightMap[r][c]);
                    // console.log(`row ${r} - column ${c} - floor ${f} - isTop: ${isTop}`);

                    if (f <= heightMap[r][c]) {
                        let tile = document.createElement("mr-tile");
                        // Is the tile at the top of the column?
                        // We only want to add plant at the top
                        tile.dataset.isTop = isTop;
                        tile.dataset.offsetFloor = offsetFloor;
                        tile.dataset.rotation = `0 ${randomRotation} 0`;
                        tile.dataset.position = `${offsetRow} ${offsetFloor} ${offsetCol}`;
                        tile.dataset.scale = scale;

                        if(isTop) {
                            tile.dataset.model = randomModel;
                        } else {
                            tile.dataset.model = models[0];
                        }
                        

                        // player position
                        if (r == spawnX && c == spawnY && isTop) {
                            tile.dataset.isPlayer = true;
                        } else {
                            tile.dataset.isPlayer = false;
                        }

                        if (r % 2 && c % 2 || !(r % 2) && !(c % 2)) {
                            tile.dataset.isBlack = true;
                        } else {
                            tile.dataset.isBlack = false;
                        }

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

        // console.log(this.grid)
    }
}

let boardsys = new BoardSystem()

