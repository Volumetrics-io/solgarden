class Room {
    constructor(params) {
        this.minRowCount = params.minRowCount || 4;
        this.minColCount = params.minColCount || 4;
        this.minFlrCount = params.minFlrCount || 1;
        this.maxRowCount = params.maxRowCount || 10;
        this.maxColCount = params.maxColCount || 10;
        this.maxFlrCount = params.maxFlrCount || 4;

        this.biomes = params.biomes || [{
                name: "plains",
                path: "tiles/biome_plains/",
                tiles: ["tilegrass001.glb", "tilegrass002.glb", "tilegrass003.glb"],
                props: ["plant_01.glb", "plant_02.glb", "plant_03.glb", "plant_04.glb", "plant_05.glb", "rock001.glb"]
            },
            {
                name: "deserts",
                path: "tiles/biome_deserts/",
                tiles: ["tiledesert001.glb", "tiledesert002.glb", "tiledesert003.glb"],
                props: ["rockdesert001.glb", "rockdesert002.glb", "plant_05_to_test.glb"]
            }
        ]


        // read the params
        this.flrCount = params.flrCount || Math.floor(Math.random() * (this.maxFlrCount - this.minFlrCount) + this.minFlrCount);
        this.rowCount = params.rowCount || Math.floor(Math.random() * (this.maxRowCount - this.minRowCount) + this.minRowCount);
        this.colCount = params.colCount || Math.floor(Math.random() * (this.maxColCount - this.minColCount) + this.minColCount);
        this.heightMap = params.heightMap || Array.from({
                length: this.rowCount
            }, (_, x) =>
            Array.from({
                length: this.colCount
            }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.flrCount))
        );
        this.entityMap = params.entityMap || Array.from({
            length: this.rowCount
        }, () => Array(this.colCount).fill(0));

        this.biome = params.biome || {};
        this.tilemap = params.tilemap || [];

        const numberOfAvailableSpots = this.rowCount * this.colCount;

        console.log(`Floor: ${this.flrCount}; Rows: ${this.rowCount}; Cols: ${this.colCount}`)


        // Randomly generate tilemap
        this.tilemap = [];
        const randomBiome = this.biomes[Math.floor(Math.random() * this.biomes.length)];

    }
}




// const

// const

// const

// console.log(findPath(1, 3, 6, 6));
