var frameDT, modes, Color, RectangularDomain, canvas, ctx, backgroundWidth, backgroundHeight, directions, images;

class SpaceInvaderProps {
    static Laser = class {
        constructor(shooter, gridX, gridY) {
            this.x = shooter.relX+gridX+SpaceInvaderProps.ENEMY_WIDTH/2-SpaceInvaderProps.LASER_WIDTH/2;
            this.y = shooter.relY+gridY+SpaceInvaderProps.ENEMY_HEIGHT;
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
        }
        draw() {
            ctx.drawImage(images.arrow, this.x, this.y, SpaceInvaderProps.ARROW_WIDTH, SpaceInvaderProps.ARROW_HEIGHT);
            this.y -= this.speed * frameDT;
        }
    }
    static Enemy = class {
        constructor(row, col) {
            this.relX = col*SpaceInvaderProps.ENEMY_SPACING_X;
            this.relY = row*SpaceInvaderProps.ENEMY_SPACING_Y;
        }
        draw(xRef, yRef) {
            ctx.drawImage(images.enemy,this.relX+xRef,this.relY+yRef,SpaceInvaderProps.ENEMY_WIDTH,SpaceInvaderProps.ENEMY_HEIGHT);
        }
    }
    static EnemyGrid = class {
        constructor(rows,cols, attackerDelay) {
            this.rows = rows;
            this.cols = cols;
            this.x = SpaceInvaderProps.ENEMY_X_NW;
            this.y = SpaceInvaderProps.ENEMY_Y_NW;
            this.attackerDelay = attackerDelay;
            this.enemiesRemaining = rows*cols;
            this.enemies = [];
            for (let i = 0; i < rows; i ++) {
                this.enemies[i] = [];
                for (let j = 0; j < cols; j ++) this.enemies[i][j] = new SpaceInvaderProps.Enemy(i, j);
            }
            this.width = this.enemies[this.rows-1][this.cols-1].relX + SpaceInvaderProps.ENEMY_WIDTH;
            this.height = this.enemies[this.rows-1][this.cols-1].relY + SpaceInvaderProps.ENEMY_HEIGHT;
            this.eligibleShooters = new Map();
            for (let i = 0; i < cols; i++) this.eligibleShooters.set(i, rows-1);
            this.lasers = [];
            this.currDirection = directions.NONE;
            this.attack(this);
            this.setDirection(this);
        }
        attack(obj) {
            if (obj.eligibleShooters.size == 0) return;
            const attackerInd = Math.floor(Math.random()*obj.eligibleShooters.size);
            const iter = obj.eligibleShooters.keys();
            let k = 0;
            while (k++<attackerInd) iter.next();
            const key = iter.next().value;
            const attacker = obj.enemies[obj.eligibleShooters.get(key)][key];
            this.lasers.push(new SpaceInvaderProps.Laser(attacker, obj.x, obj.y));
            this.eligibleShooters.delete(key);
            setTimeout(()=>this.attack(obj), obj.attackerDelay);
            setTimeout(()=>{
                if (!this.enemies[0][key]) return;
                let k = 0;
                while (++k < obj.enemies.length) if (!obj.enemies[k][key]) break;
                obj.eligibleShooters.set(key,k-1);
            },obj.attackerDelay*4);
        }
        setDirection(obj) {
            switch (obj.currDirection) {
                case directions.NONE:
                    obj.currDirection = directions.RIGHT;
                    break;
                case directions.RIGHT:
                    obj.x = SpaceInvaderProps.ENEMY_NW_DOMAIN.maxX - 1;
                    obj.currDirection = directions.DOWN;
                    break;
                case directions.DOWN:
                    obj.y = SpaceInvaderProps.ENEMY_NW_DOMAIN.maxY - 1;
                    obj.currDirection = directions.LEFT;
                    break;
                case directions.LEFT:
                    obj.x = SpaceInvaderProps.ENEMY_NW_DOMAIN.minX + 1;
                    obj.currDirection = directions.UP;
                    break;
                case directions.UP:
                    obj.y = SpaceInvaderProps.ENEMY_NW_DOMAIN.minY + 1;
                    obj.currDirection = directions.NONE;
                    setTimeout(()=>this.setDirection(obj), SpaceInvaderProps.ENEMY_PAUSE_TIME)
                    break;
            }
        }
        destroyEnemy(row, col) {
            this.enemies[row][col] = null;
            this.eligibleShooters.delete(col);
            if (this.eligibleShooters.has(col) && row > 0) {
                this.eligibleShooters.set(col, row-1);
            }
            this.enemiesRemaining --;
        }
        draw(hero, shields) {
            switch (this.currDirection) {
                case directions.UP:
                    this.y -= SpaceInvaderProps.ENEMY_SPEED * frameDT;
                    break;
                case directions.DOWN:
                    this.y += SpaceInvaderProps.ENEMY_SPEED * frameDT;
                    break;
                case directions.LEFT:
                    this.x -= SpaceInvaderProps.ENEMY_SPEED * frameDT;
                    break;
                case directions.RIGHT:
                    this.x += SpaceInvaderProps.ENEMY_SPEED * frameDT;
                    break;
            }
            for (let i = 0; i < this.rows; i ++) {
                for (let j = 0; j < this.cols; j ++) if (this.enemies[i][j]) {
                    const enemy = this.enemies[i][j];
                    enemy.draw(this.x, this.y);
                }
            }
            if (!SpaceInvaderProps.ENEMY_NW_DOMAIN.inDomain(this.x, this.y)) {
                this.setDirection(this);
            }
            const initialNumLasers = this.lasers.length;
            for (let i = initialNumLasers - 1; i >= 0; i--) {
                const laser = this.lasers[i];
                laser.draw();
                if (laser.y > backgroundHeight) this.lasers.splice(i, 1);
                else if (laser.y >= backgroundHeight-SpaceInvaderProps.HERO_HEIGHT
                         && Math.abs(laser.x + SpaceInvaderProps.LASER_WIDTH/2- (hero.x + SpaceInvaderProps.HERO_WIDTH / 2)) < SpaceInvaderProps.LASER_WIDTH/2+SpaceInvaderProps.HERO_WIDTH / 2) {
                    hero.loseLife();
                    this.lasers.splice(i, 1);
                }
                else if (laser.y > SpaceInvaderProps.SHIELD_Y)
                {    
                    for (let j = 0; j < shields.length; j++) {
                        const shield = shields[j];
                        if (Math.abs(laser.x + SpaceInvaderProps.LASER_WIDTH/2 - (shield.x + shield.width/2))
                            < SpaceInvaderProps.LASER_WIDTH/2 + shield.width/2) {
                            const topRowInd = Math.floor((laser.x + SpaceInvaderProps.LASER_WIDTH/2-shield.x)/shield.pixelWidth);
                            const pixel = shield.topRow[topRowInd];
                            if (pixel && laser.y > pixel.y) {
                                shield.killTopPixel(topRowInd);
                                this.lasers.splice(i, 1);
                                break;
                            }
                        }
                    }
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
            this.img = images.hero;
            this.recentShots = 0;
            this.arrows = [];
            addEventListener('keydown', this.move);
        }
        loseLife() {
            this.recentShots++;
            this.img = images.dyingHero;
            this.livesRemaining -= 1;
            setTimeout(()=> {
                this.recentShots--;
                if (!this.recentShots) this.img = images.hero;
            }, SpaceInvaderProps.DYING_TIME);
        }
        shoot() {
            this.arrows.push(new SpaceInvaderProps.Arrow(this.x+SpaceInvaderProps.HERO_WIDTH*5/8, this.arrowSpeed));
        }
        draw(enemyGrid, shields) {
            ctx.drawImage(this.img, this.x,SpaceInvaderProps.HERO_Y, SpaceInvaderProps.HERO_WIDTH, SpaceInvaderProps.HERO_HEIGHT);
            for (let i = this.arrows.length - 1; i >= 0; i--) {
                const arrow = this.arrows[i];
                if (arrow.y < 0) {
                    this.arrows.splice(i, 1);
                    i--;
                    continue;
                }
                arrow.draw();
                if (!(arrow.y > enemyGrid.y + enemyGrid.height)) {
                    for (let j = 0; j < enemyGrid.enemies[0].length; j++) {
                        if (!enemyGrid.enemies[0][j]) continue;
                        if (enemyGrid.enemies[0][j].relX + enemyGrid.x > this.arrows[i].x+SpaceInvaderProps.ARROW_WIDTH) continue;
                        if (Math.abs(enemyGrid.enemies[0][j].relX +enemyGrid.x + SpaceInvaderProps.ENEMY_WIDTH/2-(arrow.x+SpaceInvaderProps.ARROW_WIDTH/2))
                            < SpaceInvaderProps.ENEMY_WIDTH/2 + SpaceInvaderProps.ARROW_WIDTH / 2) {
                            let k = 0;
                            while (++k < SpaceInvaderProps.ENEMY_ROWS) if (!enemyGrid.enemies[k][j]) break;
                            if (arrow.y < enemyGrid.enemies[k-1][j].relY+enemyGrid.y+SpaceInvaderProps.ENEMY_HEIGHT
                                && arrow.y > enemyGrid.enemies[k-1][j].relY+enemyGrid.y) {
                                enemyGrid.destroyEnemy(k-1, j);
                                this.arrows.splice(i,1);
                                i --;
                                break;
                            }
                        }
                    }
                }
                else if (arrow.y < SpaceInvaderProps.SHIELD_Y + SpaceInvaderProps.SHIELD_HEIGHT 
                         && arrow.y + SpaceInvaderProps.ARROW_HEIGHT > SpaceInvaderProps.SHIELD_Y) {
                    for (let j = 0; j < shields.length; j++) {
                        const shield = shields[j];
                        if (Math.abs(shield.x+shield.width/2-(arrow.x+SpaceInvaderProps.ARROW_WIDTH/2))<(shield.width+SpaceInvaderProps.ARROW_WIDTH)/2) {
                            const bottomRowInd = Math.floor((arrow.x + SpaceInvaderProps.ARROW_WIDTH/2 - shield.x)/shield.pixelWidth)
                            const bottomPixel = shield.bottomRow[bottomRowInd];
                            if (bottomPixel && bottomPixel.y + bottomPixel.h > arrow.y) {
                                shield.killBottomPixel(bottomRowInd);
                                this.arrows.splice(i, 1);
                            }
                        }
                    }
                }
            }
            if (this.vx != 0
                && !(this.vx > 0 && this.x >= backgroundWidth - SpaceInvaderProps.HERO_WIDTH)
                && !(this.vx < 0 && this.x <= 0)) {
                    this.x += this.vx * frameDT;
            }
        }
    }
    static Shield = class {
        constructor(x,y, pixelsOG) {
            this.x = x;
            this.y = y;
            this.pixels = [];
            this.topRow = [];
            this.bottomRow = [];
            const firstRowOG = pixelsOG[0].y;
            const lastRowOG = pixelsOG[pixelsOG.length-1].y;
            const firstColOG = pixelsOG[0].x;
            let ogWidth = 0;
            let ogHeight = 0;
            for (let i = 0; i < pixelsOG.length; i ++) {
                const pixel = {x: pixelsOG[i].x, y: pixelsOG[i].y, w: pixelsOG[i].w, h: pixelsOG[i].h, colStr: pixelsOG[i].colStr};
                if (pixel.y == firstRowOG) { 
                    ogWidth += pixel.w;
                    this.topRow.push(pixel);
                } else if (pixel.y == lastRowOG) {
                    this.bottomRow.push(pixel);
                }
                if (pixel.x == firstColOG) ogHeight += pixel.h;
                this.pixels.push(pixel);
            }
            const widthScale = SpaceInvaderProps.SHIELD_WIDTH / ogWidth;
            const heightScale = SpaceInvaderProps.SHIELD_HEIGHT / ogHeight;
            let currX = this.x;
            let currY = this.y;
            this.pixelWidth = Math.floor(this.pixels[0].w * widthScale);
            this.pixelHeight = Math.floor(this.pixels[0].h * heightScale);
            this.width = this.pixelWidth * this.topRow.length;
            this.height = 0;
            this.numPixelsRemaining = this.pixels.length;
            this.numRows = 1;
            for (let i = 0; i < this.pixels.length; i++) {
                const pixel = this.pixels[i];
                const endRow = i != this.pixels.length- 1 && this.pixels[i+1].y > pixel.y;
                pixel.x = currX;
                pixel.y = currY;
                pixel.w = this.pixelWidth
                pixel.h = this.pixelHeight;
                this.height += pixel.h;
                if (endRow) {
                    currY += pixel.h;
                    currX = this.x;
                    this.height += pixel.h;
                    this.numRows ++;
                }
                else currX += pixel.w;
            }
        }
        killBottomPixel(ind) {
            const pixel = this.bottomRow[ind];
            if (!pixel) return;
            const pixelInd = ind+this.topRow.length*(pixel.y-this.y)/this.pixelHeight;
            this.pixels[pixelInd] = null;            
            this.numPixelsRemaining --;
            if (this.topRow[ind] == this.bottomRow[ind]) {
                this.bottomRow[ind] = null;
                this.topRow[ind] = null;
                return;
            }
            this.bottomRow[ind] = pixel.y == this.y ? null
                                  : this.pixels[this.bottomRow.length*(this.bottomRow[ind].y-this.pixelHeight-this.y)/this.pixelHeight+ind];
        }
        killTopPixel(ind) {
            const pixel = this.topRow[ind];
            if (!pixel) return;
            const pixelInd = ind+this.topRow.length*(pixel.y-this.y)/this.pixelHeight;
            this.pixels[pixelInd] = null;
            this.numPixelsRemaining --;
            if (this.topRow[ind] == this.bottomRow[ind]) {
                this.bottomRow[ind] = null;
                this.topRow[ind] = null;
                return;
            }
            this.topRow[ind] = pixel.y == this.y + this.height - this.pixelHeight ? null
                                  : this.pixels[pixelInd + this.topRow.length];
        }
        draw() {
            for (let i = 0; i < this.pixels.length; i++) {
                const pixel = this.pixels[i];
                if (!pixel) continue;
                ctx.moveTo(pixel.x,pixel.y);
                ctx.fillStyle = pixel.colStr;
                ctx.fillRect(pixel.x,pixel.y,pixel.w,pixel.h);
            }
        }
    }
    
    constructor(level, livesRemaining) {
        SpaceInvaderProps.MAX_ATTACKER_DELAY = 2000; // milliseconds
        SpaceInvaderProps.ENEMY_ROWS = 4;
        SpaceInvaderProps.ENEMY_COLS = 10;
        SpaceInvaderProps.ENEMY_WIDTH = backgroundWidth/20;
        SpaceInvaderProps.ENEMY_HEIGHT = backgroundHeight/20;
        SpaceInvaderProps.ENEMY_X_NW = backgroundWidth/8;
        SpaceInvaderProps.ENEMY_Y_NW = backgroundHeight/6;
        SpaceInvaderProps.ENEMY_SPACING_X = backgroundWidth/12;
        SpaceInvaderProps.ENEMY_SPACING_Y = backgroundHeight/15;
        SpaceInvaderProps.ENEMY_SPEED = .1; // pixels per millisecond
        SpaceInvaderProps.ENEMY_PAUSE_TIME = 500; // milliseconds for which the enemy grid is stationary
        SpaceInvaderProps.LASER_SPEED = backgroundHeight/600; // pixels per millisecond
        SpaceInvaderProps.LASER_WIDTH = backgroundWidth/100;
        SpaceInvaderProps.LASER_HEIGHT = backgroundHeight/20;
        SpaceInvaderProps.LASER_COLOR = new Color(255,0,0);
        SpaceInvaderProps.ARROW_SPEED =  backgroundHeight/600; // pixels per millisecond
        SpaceInvaderProps.ARROW_HEIGHT = backgroundHeight/20;
        SpaceInvaderProps.HERO_Y = backgroundHeight*9/10;
        SpaceInvaderProps.HERO_SPEED = backgroundWidth/500; // pixels per millisecond
        SpaceInvaderProps.HERO_WIDTH = backgroundWidth/10;
        SpaceInvaderProps.HERO_HEIGHT = backgroundHeight/10;
        SpaceInvaderProps.ARROW_WIDTH = backgroundWidth/50;
        SpaceInvaderProps.DYING_TIME = 1000;
        SpaceInvaderProps.HEART_WIDTH = backgroundWidth/10;
        SpaceInvaderProps.HEART_HEIGHT = backgroundHeight/10;
        SpaceInvaderProps.HEART_Y = 0;
        this.level = level;
        this.enemyGrid = new SpaceInvaderProps.EnemyGrid(SpaceInvaderProps.ENEMY_ROWS, SpaceInvaderProps.ENEMY_COLS, SpaceInvaderProps.MAX_ATTACKER_DELAY/level);
        this.hero = new SpaceInvaderProps.Hero(livesRemaining,SpaceInvaderProps.HERO_SPEED, SpaceInvaderProps.ARROW_SPEED);
        this.currArrowKey = null;
        this.spacebarDown = false;
        SpaceInvaderProps.ENEMY_NW_DOMAIN = new RectangularDomain(0, SpaceInvaderProps.HEART_Y + SpaceInvaderProps.HEART_HEIGHT,
                                                                  backgroundWidth-this.enemyGrid.width, SpaceInvaderProps.SHIELD_Y-this.enemyGrid.height);
    
        addEventListener('keydown', this.keydownFunc);
        addEventListener('keyup', this.keyupFunc);
    }
    draw(shields) {
        ctx.clearRect(0,0,backgroundWidth,backgroundHeight);
        this.enemyGrid.draw(this.hero, shields);
        this.hero.draw(this.enemyGrid, shields);
        let heartNW = backgroundWidth/2 - (this.hero.livesRemaining*SpaceInvaderProps.HEART_WIDTH)/2;
        for (let i = 0; i < this.hero.livesRemaining; i++) ctx.drawImage(images.heart,heartNW+=SpaceInvaderProps.HEART_WIDTH,SpaceInvaderProps.HEART_Y,SpaceInvaderProps.HEART_WIDTH,SpaceInvaderProps.HEART_HEIGHT)
        for (let i = 0; i < shields.length; i++) shields[i].draw();
    }
    keyupFunc = (evt) => {
        if (this.currArrowKey && evt.key == this.currArrowKey) {
            this.currArrowKey = null;
            this.hero.vx = 0;
        }
        else if (evt.key == " ") this.spacebarDown = false;
    }
    keydownFunc = (evt) => {
        switch (evt.key) {
            case " ":
                if (!this.spacebarDown) this.hero.shoot();
                this.spacebarDown = true;
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

async function runSpaceInvaders(dt, utils, imports) {
    frameDT = dt;
    canvas = document.getElementById("Canvas");
    ctx = canvas.getContext("2d");
    backgroundWidth = canvas.width;
    backgroundHeight = canvas.height;
    images = imports.images;

    modes = utils.modes;
    Color = utils.Color;
    RectangularDomain = utils.RectangularDomain;
    directions = utils.directions;

    let currLevel = 1;
    let livesRemaining = 3;
    var props;

    const MAX_LEVEL = 50;

    const shields = [];
    SpaceInvaderProps.SHIELD_HEIGHT = backgroundHeight/12;
    SpaceInvaderProps.SHIELD_WIDTH = backgroundWidth / 6;
    SpaceInvaderProps.SHIELD_Y = 7 * backgroundHeight / 10;
    for (let i = 0; i < imports.pixels.length; i++) {
        const pixel = imports.pixels[i];
        pixel.colStr = new Color(pixel.col.r,pixel.col.g,pixel.col.b).getStr();
    }
    for (let i = 0; i < 3; i ++) {
        shields.push(new SpaceInvaderProps.Shield((i+1)*backgroundWidth/4-SpaceInvaderProps.SHIELD_WIDTH/2,
                                                  SpaceInvaderProps.SHIELD_Y, 
                                                  imports.pixels));
    }

    while (currLevel < MAX_LEVEL && livesRemaining > 0) {
        await preLevel();
        props = new SpaceInvaderProps(currLevel++, livesRemaining);
        await mainFunc(props);
        livesRemaining = props.hero.livesRemaining;
    }
    currLevel - 1 == MAX_LEVEL ? winFunc() : loseFunc(currLevel - 2);

    function preLevel() {
        ctx.font = `${backgroundWidth/3}px Arial`;
        let promise = Promise.resolve();
        for (let i = 3; i > 0; i--) {
            promise = promise.then(()=>{
                ctx.clearRect(0,0,backgroundWidth,backgroundHeight);
                ctx.strokeText(i,backgroundWidth/3,backgroundHeight/3,backgroundWidth/3,backgroundHeight/3);
                return new Promise((res)=>setTimeout(()=>res(),1000))
            });
        }
        ctx.strokeText('GO',backgroundWidth/3,backgroundHeight/3,backgroundWidth/3,backgroundHeight/3)
        return promise;
    }

    function mainFunc(props) {
        let currFrame = 0;
        const startTime = performance.now();
        return new Promise((res) => {
            requestAnimationFrame(animate);
            async function animate () {
                currFrame++;
                props.draw(shields);
                if (props.enemyGrid.enemiesRemaining > 0 && props.hero.livesRemaining > 0) {
                    await new Promise((res)=>setTimeout(()=>res(),Math.max(0,startTime+currFrame*frameDT-performance.now())))
                    requestAnimationFrame(animate);
                } else {
                    livesRemaining = Math.max(0, props.hero.livesRemaining);
                    res();
                }
            }
        });
    }

    function loseFunc(levelsCompleted) {
        
    }
}

export { runSpaceInvaders };