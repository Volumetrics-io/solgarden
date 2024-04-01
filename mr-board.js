class BoardSystem extends MRSystem {
    constructor() {
        super()

        this.tilemap = [];
        this.timer = 0;
    }

    update(deltaTime, frame) {
        // this.timer += deltaTime * 2;

        // for (let f = 0; f < this.tilemap.length; f++) {
        //     for (let r = 0; r < this.tilemap[f].length; r++) {
        //         for (let c = 0; c < this.tilemap[f][r].length; c++) {
        //             const tile = this.tilemap[f][r][c];
        //             const tempPosition = tile.dataset.position.split(" ");
        //             const deltaY = Math.sin(this.timer + f / 1.5 + r / 1.5 + c / 1.5) / 100;
        //             const positionY = parseFloat(tile.dataset.offsetFloor) + deltaY;
        //             tile.dataset.position = `${tempPosition[0]} ${positionY} ${tempPosition[2]}`;
        //         }
        //     }
        // }
    }

    attachedComponent(entity) {
        let comp = entity.components.get('board')
        const models = [
            "tilegrass001",
            "tilegrass002",
            "tilegrass003"];
        const rotations = [0, 90, 180, 270];
        const scale = 0.1;

        // Generate the height map using smoothNoise
        let heightMap = Array.from({ length: comp.rows }, (_, x) =>
            Array.from({ length: comp.cols }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * comp.floors))
        );

        let goal = {
            x: Math.floor(Math.random() * comp.rows),
            y: Math.floor(Math.random() * comp.cols)
        }

        let spawnX = Math.floor(Math.random() * comp.rows);
        let spawnY = Math.floor(Math.random() * comp.cols);

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

                    let offsetRow = r * scale - (comp.rows * scale) / 2;
                    let offsetCol = c * scale - (comp.cols * scale) / 2;
                    let offsetFloor = f * scale * 0.75 + 0.1;

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

                        // if (isTop) {
                        tile.dataset.model = randomModel;

                        // } else {
                        //     tile.dataset.model = models[0];
                        // }


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

            this.tilemap.push(floor);
        }
    }
}

let boardsys = new BoardSystem()

