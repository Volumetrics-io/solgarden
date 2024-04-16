class PathFinder {
    constructor(map) {
        this.map = map;
        this.dataGraph = [];
        this.createDataGraph();


        console.log(this.dataGraph);
    }

    createDataGraph() {
        for (let x = 0; x < this.map.length; x++) {
            for (let y = 0; y < this.map[0].length; y++) {
                if (!this.map[x][y]) {
                    let surrounds = [];
                    this.addToSurroundings(surrounds, x - 1, y);
                    this.addToSurroundings(surrounds, x, y - 1);
                    this.addToSurroundings(surrounds, x + 1, y);
                    this.addToSurroundings(surrounds, x, y + 1);
                    this.dataGraph.push({
                        coord: [x, y],
                        surrounds: surrounds
                    });
                }
            }
        }
    }

    addToSurroundings(surrounds, x, y) {
        if (
            x >= 0 &&
            x < this.map.length &&
            y >= 0 &&
            y < this.map[0].length &&
            !this.map[x][y]
        ) {
            surrounds.push([x, y]);
        }
    }

    findPath(initial, final) {

        this.initial = initial;
        this.final = final;

        console.log(
            `from: [${this.initial[0]},${this.initial[1]}] - to: [${this.final[0]},${final[1]}]`
        );
        if (
            !this.initial ||
            !this.final ||
            this.initial[0] < 0 ||
            this.initial[1] < 0 ||
            this.final[0] > this.map.length ||
            this.final[1] > this.map[0].length
        ) {
            console.error(
                "check your parameters bounds exceeded, or missing initial or final coords"
            );
            return;
        } else {
            console.log("Searching please wait (it may take a while)");

            this.graph = new PathFinder.Graph();

            for (var i = 0; i < this.dataGraph.length; i++) {
                var coord = this.dataGraph[i].coord;
                var surrounds = this.dataGraph[i].surrounds;
                var coordNode = new PathFinder.Node(coord);
                this.graph.addNode(coordNode);

                for (var j = 0; j < surrounds.length; j++) {
                    var surround = surrounds[j];
                    var surroundNode = this.graph.getNode(surround);
                    if (surroundNode == undefined) {
                        surroundNode = new PathFinder.Node(surround);
                    }
                    this.graph.addNode(surroundNode);
                    coordNode.addEdge(surroundNode);
                }
            }
            
            return this.bfs();
        }
    }

    bfs() {
        this.graph.reset();
        let start = this.graph.setStart(this.initial);
        let end = this.graph.setEnd(this.final);
        this.queue = [];
        start.searched = true;
        this.queue.push(start);

        while (this.queue.length > 0) {
            let current = this.queue.shift();
            if (current == end) {
                console.log("Valid End Point Found In Map: " + current.value);
                break;
            }
            let edges = current.edges;
            for (let i = 0; i < edges.length; i++) {
                var neighbor = edges[i];
                if (!neighbor.searched) {
                    neighbor.searched = true;
                    neighbor.parent = current;
                    this.queue.push(neighbor);
                }
            }
        }

        const path = [];
        const simplePath = [];
        path.push(end);

        if (typeof end !== "undefined") {
            simplePath.push(end);
        }

        let next = end.parent;
        while (next != null) {
            path.push(next);
            simplePath.push(next.value);
            next = next.parent;
        }
        simplePath.reverse();

        // let output = `generated path from: \n[${this.initial[0]},${this.initial[1]}] - to: [${this.final[0]},${this.final[1]}]: \n`;

        // console.log("generated path:", { ...simplePath });

        // console.log(simplePath);
        // for (let i = 0; i < simplePath.length; i++) {
        //     let reverse = i - simplePath.length;
        //     var myobj = simplePath[i];
        //     if (myobj && myobj.value) {
        //         myobj = myobj.value + "<-Yey";
        //     }
        //     output += `step #${i}: ${myobj} \n`;
        // }

        return simplePath;

        // document.body.innerHTML = output;
    }

}

PathFinder.Node = class {
    constructor(value) {
        this.value = value;
        this.edges = [];
        this.searched = false;
        this.parent = null;
    }

    addEdge = function (neighbor) {
        this.edges.push(neighbor);
        // Both directions!
        neighbor.edges.push(this);
    };
}

PathFinder.Graph = class {
    constructor() {
        this.nodes = [];
        this.graph = {};
        this.end = null;
        this.start = null;
    }

    reset() {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].searched = false;
            this.nodes[i].parent = null;
        }
    }

    setStart(coords) {
        this.start = this.graph[String(coords)];
        return this.start;
    }

    setEnd(coords) {
        this.end = this.graph[String(coords)];
        return this.end;
    }

    addNode(n) {
        this.nodes.push(n);
        var title = String(n.value);
        this.graph[title] = n;
    }

    getNode(coords) {
        var n = this.graph[coords];
        return n;
    }
}
