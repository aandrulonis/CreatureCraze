const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");
const backgroundWidth = canvas.width;
const backgroundHeight = canvas.height;
const pongButton = document.getElementById("Pong-Button");
const pacmanButton = document.getElementById("Pacman-Button");
const spaceInvadersButton = document.getElementById("Space-Invaders-Button");
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
    static START_BUTTON = document.getElementById('Pong-Start-Button');
    static barY = backgroundHeight * 3/4;
    static scoreWidth = backgroundWidth / 10;
    static meteroidImg = new Image();
    static cityImg = new Image();
    static unicornImg = new Image();
    static backgroundImg = new Image();
    
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
        this.barHeight = this.barWidth / 2;
        this.barX = Math.random() * (backgroundWidth-this.barWidth);
        this.ballX = backgroundWidth / 2;
        this.ballY = backgroundHeight / 3;
        this.outcome = outcomes.IN_PROGRESS;
        this.ballTheta = (Math.floor(Math.random()*2))*PI/2+PI/12+(Math.random()*PI/3);
        this.barV = 0;
        this.currScore = 0;
        addEventListener('keydown', this.keydownFunc);
        if (!PongProps.cityImg.src) PongProps.cityImg.src = "./images/pong/city_transparent.png";
        if (!PongProps.unicornImg.src) PongProps.unicornImg.src = "./images/pong/unicorn_transparent.png";
        if (!PongProps.meteroidImg.src) PongProps.meteroidImg.src = "./images/pong/meteroid_transparent.png";
        if (!PongProps.backgroundImg.src) PongProps.backgroundImg.src = "./images/pong/backgroundImg.jpg"; 
    }
}

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
    static Node = class {
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
            this.img.src = PacmanProps.MOUTH_CLOSED_PACMAN;
            setTimeout(() => this.chomp(), PacmanProps.CHOMP_INTERVAL);
        }
        chomp() {
            this.img.src = this.img.src == PacmanProps.MOUTH_OPEN_PACMAN ? PacmanProps.MOUTH_CLOSED_PACMAN : PacmanProps.MOUTH_OPEN_PACMAN;
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
                    pacman.color = PacmanProps.PACMAN_DEAD_COLOR;
                    setTimeout(() => pacman.color = PacmanProps.PACMAN_COLOR, PacmanProps.PACMAN_DEAD_TIME);
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
    static TILE_PIXEL_WIDTH = PacmanProps.Maze.PIXEL_WIDTH / PacmanProps.Maze.TILE_WIDTH;
    static TILE_PIXEL_HEIGHT = PacmanProps.Maze.PIXEL_HEIGHT / PacmanProps.Maze.TILE_HEIGHT;
    static TILE_BACKGROUND_COLOR_STR = new Color(15, 15, 15).getStr();
    static TILE_POWERUP_COLOR_STR = new Color(245, 191, 243).getStr();
    static TILE_DOT_R = PacmanProps.TILE_PIXEL_WIDTH / 8;
    static TILE_PELLET_R = PacmanProps.TILE_PIXEL_WIDTH / 4;

    // Ghost fields
    static MAX_GHOST_RELEASE_DELAY = 2000; // milliseconds between each ghost being released

    // Pacman fields
    static PACMAN_START_POS = new PacmanProps.Pos(Math.floor(PacmanProps.MAZE_TILE_WIDTH/2), Math.floor(PacmanProps.MAZE_TILE_HEIGHT/2));
    static PACMAN_MAX_SPEED = 4e-3; // tiles per millisecond
    
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

class SpaceInvaderProps {
    static MAX_LEVEL = 50;
    static ENEMY_ROWS = 10;
    static ENEMY_COLS = 4;
    static ENEMY_WIDTH = backgroundWidth/20;
    static ENEMY_HEIGHT = backgroundHeight/20;
    static ENEMY_X_NW = backgroundWidth/4;
    static ENEMY_Y_NW = backgroundHeight/8;
    static ENEMY_SPACING_X = backgroundWidth/10;
    static ENEMY_SPACING_Y = backgroundHeight/15;
    static ENEMY_IMG_SRC = './images/space_invaders/alien_transparent.png';
    static HERO_IMG_SRC = './images/space_invaders/monkey_transparent.png';
    static DYING_HERO_IMG_SRC = './images/space_invaders/monkey_dying_transparent.png'
    static ARROW_IMG_SRC = './images/space_invaders/arrow_transparent.png';
    static MAX_ATTACKER_DELAY = 2000; // milliseconds
    static LASER_SPEED = 20; // pixels per millisecond
    static LASER_WIDTH = backgroundWidth/100;
    static LASER_HEIGHT = backgroundHeight/20;
    static LASER_COLOR = new Color(255,0,0);
    static ARROW_SPEED = 20;
    static ARROW_HEIGHT = backgroundHeight/20;
    static HERO_Y = backgroundHeight*9/10;
    static HERO_SPEED = backgroundWidth/100; // pixels per millisecond
    static HERO_WIDTH = backgroundWidth/10;
    static HERO_HEIGHT = backgroundHeight/10;
    static ARROW_WIDTH = backgroundWidth/50;
    static DYING_TIME = 1000;
    static Laser = class {
        constructor(shooter, speed) {
            this.x = shooter.x+SpaceInvaderProps.ENEMY_WIDTH/2-SpaceInvaderProps.LASER_WIDTH/2;
            this.y = shooter.y+SpaceInvaderProps.ENEMY_HEIGHT;
            this.speed = speed;
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.fillStyle = SpaceInvaderProps.LASER_COLOR.getStr();
            ctx.fillRect(this.x,this.y,SpaceInvaderProps.LASER_WIDTH,SpaceInvaderProps.LASER_HEIGHT);
            this.y += SpaceInvaderProps.LASER_SPEED * frameDT;
        }
    }
    static Arrow = class {
        constructor(x, speed) {
            this.x = x;
            this.speed = speed;
            this.y = SpaceInvaderProps.HERO_Y - SpaceInvaderProps.ARROW_HEIGHT;
            this.img = new Image();
            this.img.src = SpaceInvaderProps.ARROW_IMG_SRC;
        }
        draw() {
            ctx.drawImage(this.img, this.x, this.y, SpaceInvaderProps.ARROW_WIDTH, SpaceInvaderProps.ARROW_HEIGHT);
            this.y -= this.speed * frameDT;
        }
    }
    static Enemy = class {
        constructor(row, col) {
            this.x = SpaceInvaderProps.ENEMY_X_NW+row*SpaceInvaderProps.ENEMY_SPACING_X;
            this.y = SpaceInvaderProps.ENEMY_Y_NW+col*SpaceInvaderProps.ENEMY_SPACING_Y;
            this.img = new Image();
            this.img.src = SpaceInvaderProps.ENEMY_IMG_SRC;
            this.canShoot = true;
        }
        draw() {
            ctx.drawImage(this.img,this.x,this.y,SpaceInvaderProps.ENEMY_WIDTH,SpaceInvaderProps.ENEMY_HEIGHT);
        }
    }
    static EnemyGrid = class {
        constructor(rows,cols,attackerDelay) {
            this.rows = rows;
            this.cols = cols;
            this.enemiesRemaining = rows*cols;
            this.attackerDelay = attackerDelay;
            this.enemies = [];
            for (let i = 0; i < rows; i ++) {
                this.enemies[i] = [];
                for (let j = 0; j < cols; j ++) this.enemies[i][j] = new SpaceInvaderProps.Enemy(i, j);
            }
            this.bottomRow = this.enemies[3];
            this.numEligibleAttackers = this.bottomRow.length;
            this.lasers = [];
            this.attack();
        }
        attack() {
            const attackerInd = Math.floor(Math.random()*this.numEligibleAttackers);
            const attacker = this.bottomRow[attackerInd];
            this.lasers.push(new SpaceInvaderProps.Laser(attacker));
            attacker.canShoot = false;
            setTimeout(()=>this.attack(), this.attackerDelay);
            setTimeout(()=>attacker.canShoot = true,this.attackerDelay*4);
        }
        destroyEnemy(row, col) {
            this.enemies[row][col] = null;
            this.bottomRow[col] = row == 0 ? null : this.enemies[row-1][col];
            this.enemiesRemaining --;
        }
        draw(hero) {
            for (let i = 0; i < this.rows; i ++) {
                for (let j = 0; j < this.cols; j ++) if (this.enemies[i][j]) this.enemies[i][j].draw();
            }
            for (let i = 0; i < this.lasers.length; i ++) {
                this.lasers[i].draw();
                if (this.lasers[i].y > backgroundHeight) this.lasers.splice(i, 1);
                else if (this.lasers[i].y >= backgroundHeight-SpaceInvaderProps.HERO_HEIGHT
                         && Math.abs(this.lasers[i].x - (hero.x + SpaceInvaderProps.HERO_WIDTH / 2) < SpaceInvaderProps.HERO_WIDTH / 2)) {
                    hero.loseLife();
                    this.lasers.splice(i, 1);
                }
            }
        }
    }
    static Hero = class {
        constructor(livesRemaining, speed, arrowSpeed) {
            this.x = backgroundWidth/2-SpaceInvaderProps.HERO_WIDTH/2;
            this.livesRemaining = livesRemaining;
            this.vx = 0;
            this.speed = speed;
            this.arrowSpeed = arrowSpeed;
            this.img = new Image();
            this.img.src = SpaceInvaderProps.HERO_IMG_SRC;
            this.dying = false;
            this.arrows = [];
            addEventListener('keydown', this.move);
        }
        loseLife() {
            this.dying = true;
            this.img.src = SpaceInvaderProps.DYING_HERO_IMG_SRC;
            this.livesRemaining -= 1;
            setTimeout(()=> {if (!this.dying) this.img.src = SpaceInvaderProps.HERO_IMG_SRC}, SpaceInvaderProps.DYING_TIME);
        }
        shoot() {
            this.arrows.push(new SpaceInvaderProps.Arrow(this.x+SpaceInvaderProps.HERO_WIDTH*5/8, this.arrowSpeed));
        }
        draw(enemyGrid) {
            ctx.drawImage(this.img, this.x,SpaceInvaderProps.HERO_Y, SpaceInvaderProps.HERO_WIDTH, SpaceInvaderProps.HERO_HEIGHT);
            for (let i = 0; i < this.arrows.length; i++) {
                this.arrows[i].draw();
                for (let j = 0; j < enemyGrid.enemies[0].length; j++) {
                    if (!enemyGrid.enemies[0][j]) break;
                    if (enemyGrid.enemies[0][j] .x> this.arrows[i].x+SpaceInvaderProps.ARROW_WIDTH) break;
                    if (Math.abs(enemyGrid.enemies[0][j].x+SpaceInvaderProps.ENEMY_WIDTH/2-(this.arrows[i].x+SpaceInvaderProps.ARROW_WIDTH/2))
                        < SpaceInvaderProps.ENEMY_WIDTH/2 + SpaceInvaderProps.ARROW_WIDTH / 2) {
                        let k = 0;
                        while (++k < SpaceInvaderProps.ENEMY_ROWS) if (!enemyGrid.enemies[k][j]) break;
                        enemyGrid.destroyEnemy(k-1, j);
                    }
                }
                if (this.arrows[i].y < 0) this.arrows.splice(i, 1);
            }
            if (this.vx != 0
                && !(this.vx > 0 && this.x >= backgroundWidth - SpaceInvaderProps.HERO_WIDTH)
                && !(this.vx < 0 && this.x <= 0)) {
                    this.x += this.vx * frameDT;
            }
        }
    }
    constructor(level, livesRemaining) {
        this.level = level;
        this.enemyGrid = new SpaceInvaderProps.EnemyGrid(SpaceInvaderProps.ENEMY_ROWS, SpaceInvaderProps.ENEMY_COLS,
            SpaceInvaderProps.MAX_ATTACKER_DELAY/level);
        this.hero = new SpaceInvaderProps.Hero(livesRemaining,SpaceInvaderProps.HERO_SPEED, SpaceInvaderProps.ARROW_SPEED);
        this.currArrowKey = null;
        addEventListener('keydown', this.keydownFunc);
        addEventListener('keyup', this.keyupFunc);
    }
    draw() {
        ctx.clearRect(0,0,backgroundWidth,backgroundHeight);
        this.enemyGrid.draw(this.hero);
        this.hero.draw(this.enemyGrid);
    }
    keyupFunc = (evt) => {
        if (this.currArrowKey && evt.key == this.currArrowKey) {
            this.currArrowKey = null;
            this.hero.vx = 0;
        }
    }
    keydownFunc = (evt) => {
        switch (evt.key) {
            case " ":
                this.hero.shoot();
                break;
            case "ArrowRight":
                this.hero.vx = this.hero.speed;
                this.currArrowKey = "ArrowRight";
                break;
            case "ArrowLeft":
                this.hero.vx = -this.hero.speed;
                this.currArrowKey = "ArrowLeft";
                break;
        }
    }
}

pongButton.addEventListener('click', ()=> {
        ctx.font = `${backgroundWidth / 5}px arial`;
        pong();
});
pacmanButton.addEventListener('click', () => {
    ctx.font = `${backgroundWidth / 10}px arial`;
    pacman();
})
spaceInvadersButton.addEventListener('click',() => {
    spaceInvaders();
})

async function pong() {

    var props, frameCount, startTime;
    let pendingStart = true;

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
            ctx.drawImage(PongProps.backgroundImg, 0, 0, backgroundWidth, backgroundHeight);
            for (let i = 0; i < 4; i++) ctx.drawImage(PongProps.cityImg, i*backgroundWidth/4, backgroundHeight*7/8, backgroundWidth/4, backgroundHeight/8);
            ctx.drawImage(PongProps.unicornImg,props.barX, PongProps.barY, props.barWidth, props.barHeight);
            ctx.drawImage(PongProps.meteroidImg, props.ballX - props.ballR, props.ballY - props.ballR, 2*props.ballR, 2*props.ballR);
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
            && props.ballY < PongProps.barY + props.barHeight / 4
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

async function pacman() {
    let pendingStart = true;
    let currLevel = 1;
    let livesRemaining = 3;

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

async function spaceInvaders() {
    
    let pendingStart = true;
    let currLevel = 1;
    let livesRemaining = 3;
    var props;

    while (currLevel < SpaceInvaderProps.MAX_LEVEL && livesRemaining > 0) {
        props = new SpaceInvaderProps(currLevel++, livesRemaining);
        livesRemaining = await mainFunc(props);
        if (livesRemaining == 0) loseFunc(currLevel - 2);
    }

    async function mainFunc(props) {
        startTime = Date.now();
        requestAnimationFrame(animate);
        async function animate (timestamp) {
            props.draw();
            if (props.enemyGrid.enemiesRemaining > 0 && props.hero.livesRemaining > 0) {
                if (Date.now() - startTime < timestamp + frameDT) await setTimeout(()=>{}, timestamp + frameDT - (Date.now()-startTime));
                requestAnimationFrame(animate);
            } else {
                return props.hero.livesRemaining;
            }
        }
    }

    function loseFunc(levelsCompleted) {
        
    }
}