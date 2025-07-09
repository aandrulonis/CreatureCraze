const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");
const backgroundWidth = canvas.width;
const backgroundHeight = canvas.height;
const pongBackgroundImg = new Image();
pongBackgroundImg.src = 'images/pong/pongBackgroundImg.jpg';
const pongCityImg = new Image();
pongCityImg.src = 'images/pong/city.webp';
const pongSnowflakeImg = new Image();
pongSnowflakeImg.src = 'images/pong/snowflake.png';
const pongUmbrellaHandleImg = new Image();
pongUmbrellaHandleImg.src = 'images/pong/umbrella_handle.png';
const pongButton = document.getElementById("Pong-Button");
const modeButtons = document.getElementById("Mode-Selection");
const beginnerButton = document.getElementById("Beginner");
const intermediateButton = document.getElementById("Intermediate");
const advancedButton = document.getElementById("Advanced");
const frameDT = .2; // millisecond

const outcomes = { 
    IN_PROGRESS: "In Progress",
    WON: "Won",
    LOST: "Lost"
};
const modes = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced"
};
const PI = Math.PI;

class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    static getRandom() {
        return new Color(Math.random()*150+50, Math.random()*150+50, Math.random()*150+50);
    }
    static invert(otherCol) {
        return new Color(255-otherCol.r, 255-otherCol.g, 255-otherCol.b);
    }
    getStr() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
}

class PongProps {
    static barY = backgroundHeight * 3/4;
    static barHeight = 20;
    static scoreWidth = backgroundWidth / 10;
    static umbHandleWidth = backgroundWidth / 40;
    static umbHandleHeight = backgroundHeight / 10;
    keydownFunc = (evt) => {
        if (evt.key == "ArrowRight") this.barV = this.barSpeed;
        else if (evt.key == "ArrowLeft") this.barV = -this.barSpeed;   
        else return;
        removeEventListener('keydown', this.keydownFunc);
        addEventListener('keyup', this.keyupFunc);     
    };
    keyupFunc = (evt) => {
        const correctKey = this.barV < 0 ? "ArrowLeft" : "ArrowRight";
        if (evt.key == correctKey) {
            removeEventListener('keyup', this.keyupFunc);
            addEventListener('keydown', this.keydownFunc);
            this.barV = 0;
        }
    }
    constructor(mode) {
        switch (mode) {
            case modes.BEGINNER:
                this.barWidth = backgroundWidth / 2;
                this.ballR = backgroundWidth / 10;
                this.ballSpeed = 3;
                this.barSpeed = 3;
                this.numUmbreallaStripes = 13;
                break;
            case modes.INTERMEDIATE:
                this.barWidth = backgroundWidth / 5;
                this.ballR = backgroundWidth / 60;
                this.ballSpeed = 4;
                this.barSpeed = 5;
                this.numUmbreallaStripes = 9;
                break;
            case modes.ADVANCED:
                this.barWidth = backgroundWidth / 10;
                this.ballR = backgroundWidth / 45;
                this.ballSpeed = 5;
                this.barSpeed = 15;
                this.numUmbreallaStripes = 3;
        }
        this.mode  = mode;
        this.umbStripeSpacing = this.barWidth / (2*this.numUmbreallaStripes+1);
        this.barX = Math.random() * (backgroundWidth-this.barWidth);
        this.ballX = backgroundWidth / 2;
        this.ballY = backgroundHeight / 3;
        this.outcome = outcomes.IN_PROGRESS;
        this.barColor = Color.getRandom();
        this.stripeColor = Color.invert(this.barColor);
        this.ballTheta = (Math.floor(Math.random()*2))*PI/2+PI/12+(Math.random()*PI/3);
        this.barV = 0;
        this.currScore = 0;
        addEventListener('keydown', this.keydownFunc);
    }
}

class PacmanProps {
    static MAZE_WIDTH = 100;
    static MAZE_HEIGHT = 100;
    ghostModes = {
        NOT_RELEASED: "Not Released",
        SCATTER: "Scatter",
        CHASE: "Chase",
        FRIGHTENED: "Frightened"
    };
    directions = {
        UP: "Up",
        DOWN: "Down",
        LEFT: "Left",
        RIGHT: "Right"
    };
    Pos = class {
        static OFF_SCREEN_NE = new Pos(PacmanProps.MAZE_WIDTH + 1, -1);
        static OFF_SCREEN_NW = new Pos(-1, -1);
        static OFF_SCREEN_SE = new Pos(PacmanProps.MAZE_WIDTH + 1, PacmanProps.MAZE_HEIGHT + 1);
        static OFF_SCREEN_SW = new Pos(-1, PacmanProps.MAZE_HEIGHT + 1);
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    };
    static Node = class {
        static NUM_NODES = PacmanProps.MAZE_WIDTH * PacmanProps.MAZE_HEIGHT;
        static NEW_NODE_PROBABILITY = .7;
        constructor(index, neighborNodes) {
            this.index = index;
            this.neighborNodes = neighborNodes;
            this.tile = null;
        }

        advance(numTiles) {
            for (let i = 0; i < numTiles; i ++) {

            }
        }

        toString() {
            const neighborIndices = [];
            for (let i = 0; i < this.neighborNodes.length; i++) neighborIndices.push(this.neighborNodes[i].index);
            return neighborIndices.length > 0 ? `Node ${this.index} with neighbors ${neighborIndices} and tile ${this.tile}`
                                              : `Node ${this.index} with no neighbors and tile ${this.tile}`;
        }

        static connected(node1, node2) {
            return node1.neighborNodes.indexOf(node2) >= 0;
        }

        static oneBetween(node1, node2) {
            for (let i = 0; i < node2.neighborNodes.length; i++) {
                if (node1.neighborNodes.indexOf(node2.neighborNodes[i]) >= 0) return true;
            }
            return false;
        }

        static generateRandomGraph(numEndpoints) {
            const NUM_NODES = PacmanProps.MAZE_WIDTH * PacmanProps.MAZE_HEIGHT;
            const MAX_ADDITIONAL_EDGES = NUM_NODES / 10;
            const ADDITIONAL_EDGE_PROB = .5;
            const initialBranchCount = Math.ceil(Math.log(numEndpoints)/Math.log(2)) - 1;
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

        static generateTiles(headNode) {
            
        }
    }
    
    Tile = class {
        static PIXEL_WIDTH = Maze.PIXEL_WIDTH / Maze.TILE_WIDTH;
        static PIXEL_HEIGHT = Maze.PIXEL_HEIGHT / Maze.TILE_HEIGHT;
        static BACKGROUND_COLOR_STR = new Color(15, 15, 15).getStr();
        static POWERUP_COLOR_STR = new Color(245, 191, 243).getStr();
        static DOT_R = Tile.PIXEL_WIDTH / 8;
        static PELLET_R = Tile.PIXEL_WIDTH / 4;
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
            ctx.arc(this.xCenter, this.yCenter, this.powerup == powerups.DOT ? Tile.DOT_R : Tile.PELLET_R, 0, 2*PI);
            ctx.fill();
        }
    }
    Maze = class {
        static X_NW = backgroundWidth / 8;
        static Y_NW = backgroundHeight / 8;
        static PIXEL_WIDTH = backgroundWidth * 3 / 4;
        static PIXEL_HEIGHT = backgroundHeight * 3 / 4;
        static TILE_WIDTH = 100;
        static TILE_HEIGHT = 100;
        constructor(level) {
            this.level = level;
            this.headNode = Node.generateRandomGraph();
            this.pacman = new Pacman();
            this.inky = new Ghost("Inky");
            this.blinky = new Ghost("Blinky");
            this.pinky = new Ghost("Pinky");
            this.clyde = new Ghost("Clyde");
        }
    }
    Ghost = class {
        constructor (name, level) {
            this.grid = grid;
            switch (name) {
                case "Blinky":
                    this.targetChaseTileFunc = (pacmanNode) => pacmanNode;
                    this.targetScatterPos = pos.OFF_SCREEN_NE;
                    this.currNode = 
                    this.nextNode = 
                    this.mode = ghostModes.SCATTER;
                    break;
                case "Pinky":
                    this.targetChaseTileFunc = (pacmanNode) => pacmanNode.advance(2);
                    this.targetScatterPos = pos.OFF_SCREEN_NW;
                    this.currNode = 
                    this.nextNode = 
                    this.mode = ghostModes.NOT_RELEASED;
                    setTimeout(() => this.mode = ghostModes.SCATTER, this.releaseWait);
                    break;
                 case "Inky":
                    this.targetChaseTileFunc = (pacmanNode) => {
                        this.pacmanNode.advance(2).advance(2 * twoAway.distance())
                    };
                    this.targetScatterPos = pos.OFF_SCREEN_SE;
                    this.currNode = 
                    this.nextNode = 
                    this.mode = ghostModes.NOT_RELEASED;
                    setTimeout(() => this.mode = ghostModes.SCATTER, 2 * this.releaseWait);
                    break;
                 case "Clyde":
                    this.targetChaseTileFunc = (pacmanNode) => {

                    };
                    this.targetScatterPos = pos.OFF_SCREEN_SW;
                    this.currNode = 
                    this.nextNode = 
                    this.mode = ghostModes.NOT_RELEASED;
                    setTimeout(() => this.mode = ghostModes.SCATTER, 3 * this.releaseWait);
                    break;
            }
            
        }
    };
    constructor(level) {
        this.level = level;
        this.mode = 
        this.ghosts = [new PacmanProps.Ghost("Blinky"), new PacmanProps.Ghost("Pinky"), new PacmanProps.Ghost("Inky"), new PacmanProps.Ghost("Clyde")];
        
    }
    setGhostMode(mode) {
        for (let i = 0; i < 4; i++) {
            this.ghosts[i].mode = mode;
        }
    }
    Pacman = class {
        static START_POS = new Pos(Math.floor(Maze.TILE_WIDTH/2), Math.floor(Maze.TILE_HEIGHT/2));
        constructor() {
            this.curPos = START_POS;
            this.nextPos = new Pos(START_POS.x, START_POS.y - 1);
            this.direction = directions.UP
        }
        draw() {

        }
    }
}

PacmanProps.Node.generateRandomGraph(10)

pongButton.addEventListener('click', ()=> {
        ctx.font = `${backgroundWidth / 5}px arial`;
        pong(true);
});
pacmanButton.addEventListener('click', () => {
    ctx.font = `${backgroundWidth / 10}px arial`;
    pacman(true);
})

async function pong(pendingStart) {

    var props, frameCount, startTime;

    const startupPromise = new Promise((resolve) => {
        modeButtons.style.visibility = 'Visible';
        const beginnerFunc = () => func(modes.BEGINNER);
        const intermediateFunc = () => func(modes.INTERMEDIATE);
        const advancedFunc = () => func(modes.ADVANCED);
        const func = (mode) => {
            beginnerButton.removeEventListener('click', beginnerFunc);
            intermediateButton.removeEventListener('click', intermediateFunc);
            advancedButton.removeEventListener('click', advancedFunc);
            modeButtons.style.visibility = 'Hidden';
            frameCount = 0;
            startTime = Date.now();
            setTimeout(() => resolve(new PongProps(mode)), 1000);
        }
        beginnerButton.addEventListener('click', beginnerFunc);
        intermediateButton.addEventListener('click', intermediateFunc);
        advancedButton.addEventListener('click', advancedFunc);
    });
 
    async function mainFunc (timestamp) {

        // Draw everything
        ctx.clearRect(0, 0, backgroundWidth, backgroundHeight);
        if (props.mode != modes.ADVANCED || frameCount++ % Math.floor(20/frameDT) < 10/frameDT) {
            ctx.drawImage(pongBackgroundImg, 0, 0, backgroundWidth, backgroundHeight);
            ctx.drawImage(pongCityImg, 0, backgroundHeight*7/8, backgroundWidth, backgroundHeight/8);
            ctx.drawImage(pongUmbrellaHandleImg, props.barX+props.barWidth/2-PongProps.umbHandleWidth*2/3,PongProps.barY+PongProps.barHeight/2,PongProps.umbHandleWidth, PongProps.umbHandleHeight);
            ctx.beginPath();
            ctx.moveTo(props.barX, props.barY);
            ctx.fillStyle = props.barColor.getStr();
            ctx.fillRect(props.barX, PongProps.barY, props.barWidth, PongProps.barHeight);
            ctx.fill();
            ctx.fillStyle = props.stripeColor.getStr();
            for (let i = 0; i < props.numUmbreallaStripes; i++) {
                ctx.beginPath();
               // ctx.moveTo(props.barX, props.barY);
                ctx.fillRect(props.barX+(2*i+1)*props.umbStripeSpacing,PongProps.barY, props.umbStripeSpacing, PongProps.barHeight);
                ctx.fill();
            }
            ctx.drawImage(pongSnowflakeImg, props.ballX - props.ballR, props.ballY - props.ballR, 2*props.ballR, 2*props.ballR);
            ctx.strokeText(props.currScore, backgroundWidth / 2 - PongProps.scoreWidth / 2, backgroundHeight / 5, PongProps.scoreWidth)
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, backgroundWidth, backgroundHeight);
        }

        // Update positions
        props.ballX += props.ballSpeed * Math.cos(props.ballTheta);
        props.ballY -= props.ballSpeed * Math.sin(props.ballTheta);
        if ((props.barV < 0 && props.barX >= 0) || (props.barV > 0 && props.barX <= backgroundWidth - props.barWidth)) props.barX += props.barV;

        // Check for collisions
        if (props.ballY + props.ballR > PongProps.barY && 
            Math.abs(props.ballX - (props.barX + props.barWidth / 2)) < props.barWidth/2
            && props.ballY < PongProps.barY + PongProps.barHeight / 4
            && Math.sin(props.ballTheta) < 0) {
            // ball / bar collision
            props.ballTheta = 2*PI - props.ballTheta; 
            props.currScore ++; 
        }
        else if (props.ballX - props.ballR < 0 || props.ballX + props.ballR > backgroundWidth) {
                props.ballTheta = PI - props.ballTheta; // ball / LR wall
        }
        // } else if ((Math.abs(props.ballY-PongProps.barY)<=PongProps.barY/2&&props.ballX + props.ballR > props.barX && Math.cos(props.ballTheta) > 0)
        //            || (Math.abs(props.ballY-PongProps.barY)<=PongProps.barY/2&&props.ballX - props.ballR < props.barX + props.barWidth && Math.cos(props.ballTheta) < 0)) {
        //      // ball / side of bar
        //     props.ballTheta = 2*PI - props.ballTheta;
        //     if (Math.abs(props.ballSpeed*cos()) < props.barSpeed) {
        //         props.ballTheta = props.barSpeed 
        //     }
        // } 
        else if (props.ballY - props.ballR < 0) props.ballTheta *= -1; // bar / upper wall collision
        
        // Check for death
        if (props.ballY - props.ballR > backgroundHeight) {
            props.outcome = outcomes.LOST;
            removeEventListener('keydown', props.keydownFunc);
            ctx.font = `${backgroundWidth/8}px sans-serif`
        } else {  
            if (Date.now() - startTime < timestamp + frameDT) await setTimeout(()=>{}, timestamp + frameDT - (Date.now()-startTime));
            requestAnimationFrame(mainFunc);
        } 
    }

    // After game is over
    const loseFunc = () => {
        ctx.clearRect(0,0,backgroundWidth,backgroundHeight);
        ctx.drawImage(pongBackgroundImg,0,0,backgroundWidth,backgroundHeight);
        ctx.fillStyle = props.barColor.getStr();
        ctx.font = props.stripeColor.getStr();
        ctx.roundRect(backgroundWidth/4, backgroundHeight/4, backgroundWidth/2, backgroundHeight/2,backgroundWidth/20);
        ctx.fill();
        ctx.strokeText(`Youre score\n was ${props.currScore}!`, 3*backgroundWidth/8, 3*backgroundHeight/8, backgroundWidth/4);
    }

    if (pendingStart) {
        props = await startupPromise;
        pendingStart = false;
    }
    if (props.outcome == outcomes.IN_PROGRESS) mainFunc();
    else if (props.outcome == LOST) loseFunc();
    else return;
}
