var modes, Color, canvas, ctx, backgroundWidth, backgroundHeight;

class SpaceInvaderProps {
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
            this.x = SpaceInvaderProps.ENEMY_X_NW+col*SpaceInvaderProps.ENEMY_SPACING_X;
            this.y = SpaceInvaderProps.ENEMY_Y_NW+row*SpaceInvaderProps.ENEMY_SPACING_Y;
            this.img = new Image();
            this.img.src = SpaceInvaderProps.ENEMY_IMG_SRC;
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
            this.eligibleShooters = new Map();
            for (let i = 0; i < cols; i++) this.eligibleShooters.set(i, rows-1);
            this.lasers = [];
            this.attack();
        }
        attack() {
            if (this.eligibleShooters.size == 0) return;
            const attackerInd = Math.floor(Math.random()*this.eligibleShooters.size);
            const iter = this.eligibleShooters.keys();
            let k = 0;
            while (k++<attackerInd) iter.next();
            const key = iter.next().value;
            const attacker = this.enemies[this.eligibleShooters.get(key)][key];
            this.lasers.push(new SpaceInvaderProps.Laser(attacker));
            this.eligibleShooters.delete(key);
            setTimeout(()=>this.attack(), this.attackerDelay);
            setTimeout(()=>{
                if (!this.enemies[0][key]) return;
                let k = 0;
                while (++k < this.enemies.length) if (!this.enemies[k][key]) break;
                this.eligibleShooters.set(key,k-1);
            },this.attackerDelay*4);
        }
        destroyEnemy(row, col) {
            this.enemies[row][col] = null;
            this.eligibleShooters.delete(col);
            if (this.eligibleShooters.has(col) && row > 0) {
                this.eligibleShooters.set(col, row-1);
            }
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
                         && Math.abs(this.lasers[i].x + SpaceInvaderProps.LASER_WIDTH/2- (hero.x + SpaceInvaderProps.HERO_WIDTH / 2)) < SpaceInvaderProps.LASER_WIDTH/2+SpaceInvaderProps.HERO_WIDTH / 2) {
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
            this.recentShots = 0;
            this.arrows = [];
            addEventListener('keydown', this.move);
        }
        loseLife() {
            this.recentShots++;
            this.img.src = SpaceInvaderProps.DYING_HERO_IMG_SRC;
            this.livesRemaining -= 1;
            setTimeout(()=> {
                this.recentShots--;
                if (!this.recentShots) this.img.src = SpaceInvaderProps.HERO_IMG_SRC
            }, SpaceInvaderProps.DYING_TIME);
        }
        shoot() {
            this.arrows.push(new SpaceInvaderProps.Arrow(this.x+SpaceInvaderProps.HERO_WIDTH*5/8, this.arrowSpeed));
        }
        draw(enemyGrid, shields) {
            ctx.drawImage(this.img, this.x,SpaceInvaderProps.HERO_Y, SpaceInvaderProps.HERO_WIDTH, SpaceInvaderProps.HERO_HEIGHT);
            for (let i = 0; i < this.arrows.length; i++) {
                if (this.arrows[i].y < 0) {
                    this.arrows.splice(i, 1);
                    i--;
                    continue;
                }
                this.arrows[i].draw();
                if (!(this.arrows[i].y > SpaceInvaderProps.ENEMY_Y_NW + SpaceInvaderProps.ENEMY_SPACING_Y * SpaceInvaderProps.ENEMY_ROWS)) {
                    for (let j = 0; j < enemyGrid.enemies[0].length; j++) {
                        if (!enemyGrid.enemies[0][j]) continue;
                        if (enemyGrid.enemies[0][j].x> this.arrows[i].x+SpaceInvaderProps.ARROW_WIDTH) continue;
                        if (Math.abs(enemyGrid.enemies[0][j].x+SpaceInvaderProps.ENEMY_WIDTH/2-(this.arrows[i].x+SpaceInvaderProps.ARROW_WIDTH/2))
                            < SpaceInvaderProps.ENEMY_WIDTH/2 + SpaceInvaderProps.ARROW_WIDTH / 2) {
                            let k = 0;
                            while (++k < SpaceInvaderProps.ENEMY_ROWS) if (!enemyGrid.enemies[k][j]) break;
                            if (this.arrows[i].y < enemyGrid.enemies[k-1][j].y+SpaceInvaderProps.ENEMY_HEIGHT
                                && this.arrows[i].y > enemyGrid.enemies[k-1][j].y) {
                                enemyGrid.destroyEnemy(k-1, j);
                                this.arrows.splice(i,1);
                                i --;
                                break;
                            }
                        }
                    }
                }
                else if (this.arrows[i].y < SpaceInvaderProps.SHIELD_Y + SpaceInvaderProps.SHIELD_HEIGHT 
                         && this.arrows[i].y + SpaceInvaderProps.ARROW_HEIGHT > SpaceInvaderProps.SHIELD_Y) {
                    for (let j = 0; j < shields.length; j++) {
                        if (Math.abs(shields[j].x+shields[j].width/2-(this.arrows[i].x+SpaceInvaderProps.ARROW_WIDTH/2))<(shields[j].width+SpaceInvaderProps.ARROW_WIDTH)/2) {
                            let k = 0;

                            shields[j].killPixel()
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
        constructor(x,y, pixelsObj) {
            this.x = x;
            this.y = y;
            this.pixelsObj = pixelsObj;
            this.pixelsRemaining = this.pixelsObj.pixels.length;
            this.topRow = [];
            this.bottomRow = [];
            const firstRow = this.pixelsObj.pixels[0].y;
            const lastRow = this.pixelsObj.pixels[this.pixelsRemaining-1].y;
            const firstCol = this.pixelsObj.pixels[0].x;
            let ogWidth = 0;
            let ogHeight = 0;
            for (let i = 0; i < this.pixelsRemaining; i ++) {
                const pixel = this.pixelsObj.pixels[i];
                pixel.colStr = new Color(pixel.col.r,pixel.col.g,pixel.col.b).getStr();
                if (pixel.y == firstRow) { 
                    ogWidth += pixel.w;
                    this.topRow.push(pixel);
                } else if (pixel.y == lastRow) {
                    this.bottomRow.push(pixel);
                }
                if (pixel.x == firstCol) ogHeight += pixel.h;
            }
            const widthScale = SpaceInvaderProps.SHIELD_WIDTH / ogWidth;
            const heightScale = SpaceInvaderProps.SHIELD_HEIGHT / ogHeight;
            let currX = this.x;
            let currY = this.y;
            this.width = 0;
            this.height = 0;
            for (let i = 0; i < this.pixelsRemaining; i++) {
                const pixel = this.pixelsObj.pixels[i];
                const endRow = i != this.pixelsRemaining - 1 && this.pixelsObj.pixels[i+1].y > pixel.y;
                pixel.x = currX;
                pixel.y = currY;
                pixel.w = Math.floor(pixel.w) * widthScale;
                pixel.h = Math.floor(pixel.h) * heightScale;
                this.width += pixel.w;
                this.height += pixel.h;
                if (endRow) {
                    currY += pixel.h;
                    currX = this.x;
                }
                else currX += pixel.w;
            }

        }
        draw() {
            for (let i = 0; i < this.pixelsRemaining; i++) {
                const pixel = this.pixelsObj.pixels[i];
                if (!pixel) continue;
                ctx.moveTo(pixel.x,pixel.y);
                ctx.fillStyle = pixel.colStr;
                ctx.fillRect(pixel.x,pixel.y,pixel.w,pixel.h);
            }
        }
    }
    
    static MAX_LEVEL = 50;
    constructor(level, livesRemaining) {
        SpaceInvaderProps.ENEMY_ROWS = 4;
        SpaceInvaderProps.ENEMY_COLS = 10;
        SpaceInvaderProps.ENEMY_WIDTH = backgroundWidth/20;
        SpaceInvaderProps.ENEMY_HEIGHT = backgroundHeight/20;
        SpaceInvaderProps.ENEMY_X_NW = backgroundWidth/8;
        SpaceInvaderProps.ENEMY_Y_NW = backgroundHeight/6;
        SpaceInvaderProps.ENEMY_SPACING_X = backgroundWidth/12;
        SpaceInvaderProps.ENEMY_SPACING_Y = backgroundHeight/15;
        SpaceInvaderProps.ENEMY_IMG_SRC = '../../images/space_invaders/alien_transparent.png';
        SpaceInvaderProps.HERO_IMG_SRC = '../../images/space_invaders/monkey_transparent.png';
        SpaceInvaderProps.DYING_HERO_IMG_SRC = '../../images/space_invaders/monkey_dying_transparent.png'
        SpaceInvaderProps.ARROW_IMG_SRC = '../../images/space_invaders/arrow_transparent.png';
        SpaceInvaderProps.HEART_IMG_SRC = '../../images/space_invaders/heart_transparent.png';
        SpaceInvaderProps.MAX_ATTACKER_DELAY = 2000; // milliseconds
        SpaceInvaderProps.LASER_SPEED = 20; // pixels per millisecond
        SpaceInvaderProps.LASER_WIDTH = backgroundWidth/100;
        SpaceInvaderProps.LASER_HEIGHT = backgroundHeight/20;
        SpaceInvaderProps.LASER_COLOR = new Color(255,0,0);
        SpaceInvaderProps.ARROW_SPEED = 20;
        SpaceInvaderProps.ARROW_HEIGHT = backgroundHeight/20;
        SpaceInvaderProps.HERO_Y = backgroundHeight*9/10;
        SpaceInvaderProps.HERO_SPEED = backgroundWidth/100; // pixels per millisecond
        SpaceInvaderProps.HERO_WIDTH = backgroundWidth/10;
        SpaceInvaderProps.HERO_HEIGHT = backgroundHeight/10;
        SpaceInvaderProps.ARROW_WIDTH = backgroundWidth/50;
        SpaceInvaderProps.DYING_TIME = 1000;
        SpaceInvaderProps.HEART_WIDTH = backgroundWidth/10;
        SpaceInvaderProps.HEART_HEIGHT = backgroundHeight/10;
        SpaceInvaderProps.HEART_Y = 0;
        SpaceInvaderProps.SHIELD_Y = 7 * backgroundHeight / 10;
        SpaceInvaderProps.SHIELD_WIDTH = backgroundWidth / 12;
        SpaceInvaderProps.SHIELD_HEIGHT = backgroundHeight/12;
    
        this.level = level;
        this.enemyGrid = new SpaceInvaderProps.EnemyGrid(SpaceInvaderProps.ENEMY_ROWS, SpaceInvaderProps.ENEMY_COLS,
            SpaceInvaderProps.MAX_ATTACKER_DELAY/level);
        this.hero = new SpaceInvaderProps.Hero(livesRemaining,SpaceInvaderProps.HERO_SPEED, SpaceInvaderProps.ARROW_SPEED);
        this.currArrowKey = null;
        this.heartImg = new Image();
        this.heartImg.src = SpaceInvaderProps.HEART_IMG_SRC;
        addEventListener('keydown', this.keydownFunc);
        addEventListener('keyup', this.keyupFunc);
    }
    draw(shields) {
        ctx.clearRect(0,0,backgroundWidth,backgroundHeight);
        this.enemyGrid.draw(this.hero);
        this.hero.draw(this.enemyGrid, shields);
        let heartNW = backgroundWidth/2 - (this.hero.livesRemaining*SpaceInvaderProps.HEART_WIDTH)/2;
        for (let i = 0; i < this.hero.livesRemaining; i++) ctx.drawImage(this.heartImg,heartNW+=SpaceInvaderProps.HEART_WIDTH,SpaceInvaderProps.HEART_Y,SpaceInvaderProps.HEART_WIDTH,SpaceInvaderProps.HEART_HEIGHT)
        for (let i = 0; i < shields.length; i++) shields[i].draw();
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

async function runSpaceInvaders(utils) {
    canvas = document.getElementById("Canvas");
    ctx = canvas.getContext("2d");
    backgroundWidth = canvas.width;
    backgroundHeight = canvas.height;

    modes = utils.modes;
    Color = utils.Color;

    let pendingStart = true;
    let currLevel = 1;
    let livesRemaining = 3;
    var props;

    let jsonPromise;
    await fetch("../../json/shield_pixels.json").then((response)=> {if (!response.ok) jsonPromise = null;  else jsonPromise = response.json(); });
    if (!jsonPromise) return;
    const pixelsObj = await jsonPromise;
    const shields = [];
    for (let i = 0; i < 3; i ++) shields.push(new SpaceInvaderProps.Shield((i+1)*backgroundWidth/4-SpaceInvaderProps.SHIELD_WIDTH/2,SpaceInvaderProps.SHIELD_Y, pixelsObj));
    while (currLevel < SpaceInvaderProps.MAX_LEVEL && livesRemaining > 0) {
        props = new SpaceInvaderProps(currLevel++, livesRemaining);
        await mainFunc(props);
        if (livesRemaining == 0) break;
    }

    currLevel - 1 == SpaceInvaderProps.MAX_LEVEL ? winFunc() : loseFunc(currLevel - 2);

    async function mainFunc(props) {
        console.log('wat')
        const startTime = Date.now();
        requestAnimationFrame(animate);
        async function animate (timestamp) {
            props.draw(shields);
            if (props.enemyGrid.enemiesRemaining > 0 && props.hero.livesRemaining > 0) {
                if (Date.now() - startTime < timestamp + frameDT) await setTimeout(()=>{}, timestamp + frameDT - (Date.now()-startTime));
                requestAnimationFrame(animate);
            } else {
                livesRemaining = props.hero.livesRemaining;
            }
        }
    }

    function loseFunc(levelsCompleted) {
        
    }
}

export { runSpaceInvaders };