var  PI, outcomes, modes, Color, canvas, ctx, backgroundWidth, backgroundHeight;
// TODO : make Pacman be able to eat ghosts in power pellet mode & do some color washing of background in that mode perhaps
class PacmanProps {
    static ghostModes = {
        NOT_RELEASED: "Not Released",
        SCATTER: "Scatter",
        CHASE: "Chase",
        FRIGHTENED: "Frightened"
    };
    static directions = {
        UP: "Up",
        DOWN: "Down",
        LEFT: "Left",
        RIGHT: "Right"
    };
    static powerups = {
        EMPTY: "Empty",
        DOT: "Dot",
        POWER_PELLET: "Power Pellet"
    };
    static Pos = class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    };
    static NodeListQueue = class {
        // Circular array-backed queue

        constructor() {
            this.backingArray = new Array<Array<PacmanProps.Node>>(10);
            this.start = 0;
            this.size = 0;
        }

        add(nodeList) {
            if (this.size >= this.backingArray.size) resizeBackingArray();
            backingArray[mod(--this.start, this.backingArray.length)] = nodeList;
            this.size++;
        }

        remove() {
            const nodeList = backingArray[mod(this.start + --this.size, this.backingArray.length)];
            return nodeList;
        }

        resizeBackingArray() {
            const ogLength = this.backingArray.length;
            const newBackingArray = new Array<Array<PacmanProps.Node>>(ogLength * 2 + 1);
            for (let i = 0; i < this.size; i++) newBackingArray[i] = this.backingArray[mod(i + this.start, ogLength)];
            this.backingArray = newBackingArray;
            this.start = 0;
        }

        mod(dividend, divisor) {
            let mod = dividend % divisor;
            while (mod < 0) mod += divisor;
            return mod;
        }

        isEmpty() { return this.size == 0; }
    }
    static Node = class {
        constructor(index, neighborNodes) {
            this.index = index;
            this.neighborNodes = neighborNodes; // map of directions : Node
            this.tile = null;
        }

        advance(numTiles) {
            for (let i = 0; i < numTiles; i ++) {

            }
        }

        toString() {
            const neighborIndices = [];
            this.neighborNodes.entries().forEach((en) => neighborIndices.push(en[1].index));
            return neighborIndices.length > 0 ? `Node ${this.index} with neighbors ${neighborIndices} and tile ${this.tile}`
                                              : `Node ${this.index} with no neighbors and tile ${this.tile}`;
        }

        static connected(node1, node2) {
            node1.neighborNodes.entries().forEach((en) => {
                if (en[1] == node2) return true;
            });
            return false;
        }

        static oneBetween(node1, node2) {
            node1.neighborNodes.entries().forEach((en) => {
                if (this.connected(en[1], node2)) return true;
            });
            return false;
        }

        // Modified BFS
        static shortestPath(start, end, totalVertices) {
            const queue = new PacmanProps.NodeListQueue();
            const visitedSet = new Set();
            queue.add([start]);
            while (!queue.isEmpty() && visitedSet.size() < totalVertices) {
                const nodeList = queue.remove();
                const lastNode = nodeList[nodeList.size() - 1];
                visitedSet.add(lastNode);
                if (lastNode == end) return nodeList;
                lastNode.neighborNodes.entries().forEach((en) => {
                    if (!visitedSet.contains(en[1])) {
                        queue.add(nodeList.add(en[1]));
                    }
                });
            }
            return [];
        }

        static generateRandomGraph(numEndpoints) {
            const NUM_NODES = PacmanProps.MAZE_WIDTH * PacmanProps.MAZE_HEIGHT;
            const MAX_ADDITIONAL_EDGES = NUM_NODES / 10;
            const ADDITIONAL_EDGE_PROB = .5;
            const initialBranchCount = Math.ceil(Math.log(numEndpoints)/Math.log(2)) - 1;
            console.assert(1 + 4*initialBranchCount <= PacmanProps.MAZE_WIDTH, "Maze overflow");
            console.assert(1 + 4*initialBranchCount <= PacmanProps.MAZE_HEIGHT, "Maze overflow");
            const headNode = new PacmanProps.Node(0, []);
            let currEndpoints = [ headNode ];
            let allNodes =  [ headNode ];

            // Recursive function to create custom number of endpoints
            // Each parent gets two children. Each child get an additional endpoint only attached to itself.
            // Returns a list of the endpoints
            const newChildren = (parent, branchesLeft, startInd) => {
                if (branchesLeft < 0) return [parent];
                let child1 = new PacmanProps.Node(startInd, [parent]);
                let child2 = new PacmanProps.Node(startInd + 1, [parent]);
                parent.neighborNodes.push(child1, child2);
                let child3 = new PacmanProps.Node(startInd + 2, [child1]);
                let child4 = new PacmanProps.Node(startInd + 3, [child2]);
                allNodes.push(child1, child2, child3, child4);
                child1.neighborNodes.push(child3);
                child2.neighborNodes.push(child4);
                let children1 = newChildren(child3, branchesLeft - 1, startInd + 4);
                let children2 = newChildren(child4, branchesLeft - 1, startInd + 4 + 4*(Math.pow(2, branchesLeft - 1) - 1));
                return children1.concat(children2);
            }
            currEndpoints = newChildren(headNode, initialBranchCount, 1);
            const remainingNodeIndices = [];
            const endpointsToRemove = currEndpoints.length - numEndpoints;
            for (let i = allNodes.length; i < NUM_NODES; i++) remainingNodeIndices.push(i);
            for (let i = 0; i < endpointsToRemove; i++) {
                const toRemove = currEndpoints[i];
                allNodes.splice(toRemove.index - i, 1);
                remainingNodeIndices.push(toRemove.index);
                toRemove.neighborNodes[0].neighborNodes.pop();
                currEndpoints.splice(i, 1);
            }
            let nodeCount = NUM_NODES - remainingNodeIndices.length;
            let numAdditionalEdges = 0;

            while (true) {
                let nextEndpoints = [];
                for (let i = 0; i < currEndpoints.length; i++) {
                    const thisNode = currEndpoints[i];
                    const thisParent = thisNode.neighborNodes[0];
                    const additionalEdge = numAdditionalEdges < MAX_ADDITIONAL_EDGES && Math.random() < ADDITIONAL_EDGE_PROB;
                    if (additionalEdge) {
                        let connectTo = allNodes[Math.floor(Math.random()*(nodeCount-2)) + 1];
                        if (connectTo.neighborNodes.length < 4 && !PacmanProps.Node.connected(thisParent, connectTo) && !PacmanProps.Node.oneBetween(thisParent, connectTo)) {
                            numAdditionalEdges ++;
                            thisNode.neighborNodes.push(connectTo);
                            connectTo.neighborNodes.push(thisNode);
                        }
                    }
                    const nextNode = new PacmanProps.Node(nodeCount++, [thisNode]);
                    thisNode.neighborNodes.push(nextNode);
                    allNodes.push(nextNode);
                    nextEndpoints.push(nextNode);
                }  
                currEndpoints = nextEndpoints;
                if (nodeCount >= NUM_NODES) break;
            }
            return headNode;
        }
    }

    static Maze = class {
        constructor(level) {
            this.headNode = PacmanProps.Node.generateRandomGraph(PacmanProps.MAX_LEVEL - level);
        }
    }
    static Tile = class {
        constructor(pos, powerup) {
            this.pos = pos;
            this.xNW = PacmanProps.X_NEW + pos.x * Tile.PIXEL_WIDTH;
            this.yNW = PacmanProps.Y_NEW + pos.y * Tile.PIXEL_HEIGHT;
            this.xCenter = this.xNW + PacmanProps.TILE_WIDTH / 2;
            this.yCenter = this.yNW + PacmanProps.TILE_HEIGHT / 2;
            this.powerup = powerup;
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.xNW, this.yNW);
            ctx.fillStyle = Tile.BACKGROUND_COLOR_STR;
            ctx.fillRect(this.xNW, this.yNW, Tile.PIXEL_WIDTH, Tile.PIXEL_HEIGHT);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(this.xCenter, this.yCenter);
            ctx.fillStyle = Tile.POWERUP_COLOR_STR;
            ctx.arc(this.xCenter, this.yCenter, this.powerup == PacmanProps.powerups.DOT ? Tile.DOT_R : Tile.PELLET_R, 0, 2*PI);
            ctx.fill();
        }
    }
    static Ghost = class {
        constructor (name, level) {
            this.releaseWait = PacmanProps.MAX_GHOST_RELEASE_DELAY * Math.pow(1/level, .4);
            this.img = new Image();
            switch (name) {
                case "Blinky":
                    this.targetChaseTileFunc = (pacmanNode) => pacmanNode;
                    this.targetScatterPos = PacmanProps.OFF_SCREEN_NE;
                    // this.currNode = 
                    // this.nextNode = 
                    this.mode = PacmanProps.ghostModes.SCATTER;
                    this.img.src = PacmanProps.BLINKY_IMAGE_SRC;
                    break;
                case "Pinky":
                    this.targetChaseTileFunc = (pacmanNode) => pacmanNode.advance(2);
                    this.targetScatterPos = PacmanProps.OFF_SCREEN_NW;
                    // this.currNode = 
                    // this.nextNode = 
                    this.mode = PacmanProps.ghostModes.NOT_RELEASED;
                    this.img.src = PacmanProps.PINKY_IMG_SRC;
                    setTimeout(() => this.mode = PacmanProps.ghostModes.SCATTER, this.releaseWait);
                    break;
                 case "Inky":
                    this.targetChaseTileFunc = (pacmanNode) => {
                        pacmanNode.advance(2).advance(2 * twoAway.distance())
                    };
                    this.targetScatterPos = PacmanProps.OFF_SCREEN_SE;
                    // this.currNode = 
                    // this.nextNode = 
                    this.mode = PacmanProps.ghostModes.NOT_RELEASED;
                    this.img.src = PacmanProps.INKY_IMAGE_SRC;
                    setTimeout(() => this.mode = PacmanProps.ghostModes.SCATTER, 2 * this.releaseWait);
                    break;
                 case "Clyde":
                    this.targetChaseTileFunc = (pacmanNode) => {

                    };
                    this.targetScatterPos = PacmanProps.OFF_SCREEN_SW;
                    // this.currNode = 
                    // this.nextNode = 
                    this.mode = PacmanProps.ghostModes.NOT_RELEASED;
                    this.normalImageSrc = PacmanProps.CLYDE_IMAGE_SRC;
                    this.frightenedImgSrc = PacmanProps.CLYDE_FRIGHTENED_IMAGE_SRC; 
                    setTimeout(() => this.mode = PacmanProps.ghostModes.SCATTER, 3 * this.releaseWait);
                    break;
            }
        }
        setMode(mode) {
            switch (mode) {
                case PacmanProps.ghostModes.SCATTER:
                    this.nextTileFunc = () => this.targetScatterTile;
                case PacmanProps.ghostModes.FRIGHTENED:
                    // this.nextTileFunc = (p, g1, g2) => ;
                    this.img.src = this.frightenedImgSrc;
                    setTimeout(() => { this.img.src = this.normalImageSrc; this.setMode(this.mode); }, this.frightenedPeriod);
                    break;
                case PacmanProps.ghostModes.NOT_RELEASED:
                    this.nextTileFunc = () => null;
                    break;
                case PacmanProps.ghostModes.CHASE:
                    this.nextTileFunc = this.targetChaseTileFunc;
                    break;
            }
            this.mode = mode;
        }
        draw() {
            ctx.drawImage(this.img, this.currNode.tile.xNW, this.currNode.tile.yNW, PacmanProps.TILE_PIXEL_WIDTH, PacmanProps.TILE_PIXEL_HEIGHT);
        }
        advance(otherGhost1, otherGhost2) {
            if (this.nextNode) {
                this.currNode = this.nextNode;
                this.nextNode = this.nextTileFunc(otherGhost1, otherGhost2);
            }
            thisdraw();
        }
    };
    static Pacman = class {
        constructor(level, livesRemaining) {
            this.currNode = PacmanProps.PACMAN_START_NODE;
            // this.nextNode = new PacmanProps.Pos(this.curPos.x, this.curPos.y - 1);
            this.direction = PacmanProps.directions.RIGHT;
            this.speed = PacmanProps.PACMAN_MAX_SPEEDv* Math.sqrt(level / PacmanProps.MAX_LEVEL);
            this.livesRemaining = livesRemaining;
            this.color = PacmanProps.PACMAN_COLOR;
            this.img = new Image();
            this.img.src = PacmanProps.MOUTH_CLOSED_PACMAN_SRC;
            this.dead = false;
            setTimeout(() => this.chomp(), PacmanProps.CHOMP_INTERVAL);
        }
        chomp() {
            this.img.src = this.img.src == this.dead ? 
                (PacmanProps.MOUTH_OPEN_DEAD_PACMAN_SRC ? PacmanProps.MOUTH_CLOSED_PACMAN_DEAD_SRC : PacmanProps.MOUTH_OPEN_DEAD_PACMAN_SRC) :
                (PacmanProps.MOUTH_OPEN_PACMAN_SRC ? PacmanProps.MOUTH_CLOSED_PACMAN_SRC : PacmanProps.MOUTH_OPEN_PACMAN_SRC);
            setTimeout(() => this.chomp(), PacmanProps.CHOMP_INTERVAL)
        }
        draw() {
            ctx.drawImage(this.currNode.tile.xNW, this.currNode.tile.yNW, PacmanProps.TILE_PIXEL_WIDTH, PacmanProps.TILE_PIXEL_HEIGHT);
            // TODO : add rotation
        }
        advance(ghosts) {
            this.currNode = this.nextNode;
            // this.nextNode = 
            if (ghosts) for (let i = 0; i < 4; i ++) {
                if (ghosts[i].pos == this.pos) {
                    this.dead = true;
                    setTimeout(() => this.dead = false, PacmanProps.PACMAN_DEAD_TIME);
                    pacman.livesRemaining -= 1;
                }
            }
            pacman.draw();
            if (this.currNode.powerup != PacmanProps.powerups.EMPTY) {
                if (this.currNode.power == PacmanProps.powerups.POWER_PELLET) {
                    for (let i = 0; i < ghosts.length; i ++) ghosts[i].setMode(PacmanProps.mode.FRIGHTENED);
                }
                this.currNode.powerup = PacmanProps.powerups.EMPTY;
                return -1;
            }
            return 0;
        }
    }
    
    // General fields
    static MAX_LEVEL = 50;

    // Maze fields
    static MAZE_WIDTH = 100;
    static MAZE_HEIGHT = 100;
    static MAZE_X_NW = backgroundWidth / 8;
    static MAZE_Y_NW = backgroundHeight / 8;
    static MAZE_PIXEL_WIDTH = backgroundWidth * 3 / 4;
    static MAZE_PIXEL_HEIGHT = backgroundHeight * 3 / 4;
    static MAZE_TILE_WIDTH = 100;
    static MAZE_TILE_HEIGHT = 100;

    // Pos fields    
    static OFF_SCREEN_NE = new PacmanProps.Pos(PacmanProps.MAZE_WIDTH + 1, -1);
    static OFF_SCREEN_NW = new PacmanProps.Pos(-1, -1);
    static OFF_SCREEN_SE = new PacmanProps.Pos(PacmanProps.MAZE_WIDTH + 1, PacmanProps.MAZE_HEIGHT + 1);
    static OFF_SCREEN_SW = new PacmanProps.Pos(-1, PacmanProps.MAZE_HEIGHT + 1);

    // Node fields
    static NUM_NODES = PacmanProps.MAZE_WIDTH * PacmanProps.MAZE_HEIGHT;

    // Tile fields
    static TILE_PIXEL_WIDTH = PacmanProps.MAZE_PIXEL_WIDTH / PacmanProps.MAZE_TILE_WIDTH;
    static TILE_PIXEL_HEIGHT = PacmanProps.MAZE_PIXEL_HEIGHT / PacmanProps.MAZE_TILE_HEIGHT;
    static TILE_BACKGROUND_COLOR_STR = new Color(15, 15, 15).getStr();
    static TILE_POWERUP_COLOR_STR = new Color(245, 191, 243).getStr();
    static TILE_DOT_R = PacmanProps.TILE_PIXEL_WIDTH / 8;
    static TILE_PELLET_R = PacmanProps.TILE_PIXEL_WIDTH / 4;

    // Ghost fields
    static MAX_GHOST_RELEASE_DELAY = 2000; // milliseconds between each ghost being released

    // Pacman fields
    static PACMAN_START_POS = new PacmanProps.Pos(Math.floor(PacmanProps.MAZE_TILE_WIDTH/2), Math.floor(PacmanProps.MAZE_TILE_HEIGHT/2));
    static PACMAN_MAX_SPEED = 4e-3; // tiles per millisecond
    static MOUTH_OPEN_PACMAN_SRC = './images/pacman/mouth_open_pacman';
    static MOUTH_CLOSED_PACMAN_SRC = './images/pacman/mout_closed_pacman';
    static MOUTH_CLOSED_PACMAN_DEAD_SRC = './images/pacman/mouth_open_dead_pacman';
    static MOUTH_OPEN_PACMAN_DEAD_SRC = './iamges/pacman/mouth_closed_dead_pacman';
    static PACMAN_DEAD_TIME = 2000; // milliseconds
    
    constructor(level, livesRemaining) {
        this.level = level;
        this.pacman = new PacmanProps.Pacman(this.level, livesRemaining);
        this.ghosts = [new PacmanProps.Ghost("Inky"), new PacmanProps.Ghost("Blinky"), new PacmanProps.Ghost("Pinky"), new PacmanProps.Ghost("Clyde")];
        this.maze = new PacmanProps.Maze(this.level);
    }
    advance() {
        this.maze.draw();
        for (let i = 0; i < 4; i++) {
            this.ghosts[i].advance(1);
        }
        this.pelletsRemaining += pacman.advance(this.ghosts, 1);
        this.livesRemaining = pacman.livesRemaining();
    }
}

async function runPacman(utils) {
    canvas = document.getElementById("Canvas");
    ctx = canvas.getContext("2d");
    backgroundWidth = canvas.width;
    backgroundHeight = canvas.height;

    PI = utils.PI;
    outcomes = utils.outcomes;
    modes = utils.modes;
    Color = utils.Color;

    let pendingStart = true;
    let currLevel = 1;
    let livesRemaining = 3;
    ctx.font = `${backgroundWidth / 10}px arial`;

    while (currLevel < PacmanProps.MAX_LEVEL && livesRemaining > 0) {
        props = await betweenLevels(currLevel++, livesRemaining);
        livesRemaining = await mainFunc(props);
        if (livesRemaining == 0) loseFunc(currLevel - 2);
    }

    function betweenLevels(nextLevel) {
        PongProps.START_BUTTON.style.visibility = 'Visible';
        return new Promise((resolve) => {
            ctx.beginPath();
            ctx.moveTo(backgroundWidth/4, backgroundHeight/4);
            ctx.roundRect(backgroundWidth/4, backgroundHeight/4, backgroundWidth/2, backgroundHeight/2, backgroundWidth/20);
            func = () => {
                PongProps.START_BUTTON.style.visibility = 'Hidden';
                PongProps.START_BUTTON.removeEventListener('click', func);
                setTimeout(() => resolve(new PacmanProps(nextLevel, livesRemaining)), 500);
            }
            PongProps.START_BUTTON.addEventListener('click', func);
        });
    }

    async function mainFunc(props) {
        props.drawMaze();
        startTime = Date.now();
        requestAnimationFrame(animate);
        async function animate (timeStamp) {
            if (props.maze.pelletsRemaining > 0 && props.livesRemaining > 0) {
                if (Date.now() - startTime < timeStamp + frameDT) await setTimeout(()=>{}, timestamp + frameDT - (Date.now()-startTime));
                requestAnimationFrame(animate);
            } else {
                return props.livesRemaining;
            }
        }
    }

    function loseFunc(levelsCompleted) {
        
    }
}

export { runPacman };