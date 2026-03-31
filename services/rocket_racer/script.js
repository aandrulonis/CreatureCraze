class Rocket {

    // rocket fields
    static exitVel = 2e3;
    static exitArea = 3;
    static surfaceArea = 3;
    static dragCoeff = .8;
    static exitPressure = 101_000;

    // earth fields
    static G = 6.6743e-11;
    static M = 5.9722e24;
    static groundRadius = 6_378_137;
    static spaceAltitude = 100e3;
    static R = 287; // atmospheric specific gas constant

    // graphics fields
    static initBackgroundRed = 33;
    static initBackgroundGreen = 223
    static initBackgroundBlue = 223;
    static dt = 5e-2;
    static borderColor = "rgb(0, 0, 0)";
    
    constructor(name, backgroundWidth, backgroundHeight, x0, height, userUp, userDown, userLeft, userRight, userKill, flagImageSrc) {
        this.name = name;
        this.backgroundWidth = backgroundWidth;
        this.backgroundHeight = backgroundHeight;
        this.x0 = x0;
        this.backgroundHeight = backgroundHeight;
        this.userUp = userUp;
        this.userDown = userDown;
        this.userLeft = userLeft;
        this.userRight = userRight;
        this.userKill = userKill;

        // image declararation
        this.rocketImage = new Image();
        this.flameImage = new Image();
        this.cloudImage = new Image();
        this.launcherImage = new Image();
        this.grassImage = new Image();
        this.laserImage = new Image();
        this.balloonImage = new Image();
        this.flagImage = new Image();

        // image sourcing
        this.rocketImage.src = 'images/rocket.png';
        this.flameImage.src = 'images/flame.png';
        this.cloudImage.src = 'images/cloud.png';
        this.launcherImage.src = 'images/launchpad.webp';
        this.grassImage.src = 'images/grass.webp';
        this.laserImage.src = 'images/laser.png';
        this.balloonImage.src = 'images/balloon.png';
        this.flagImage.src = `images/${flagImageSrc}`;
        this.obstacleImageSources = [];
        this.birdImageSources = ['images/bird1.png', 'images/bird2.png', 'images/bird3.webp', 'images/bird4.png'];
        this.planeImageSources = ['images/plane1.webp', 'images/plane2.png', 'images/plane3.png', 'images/plane4.webp'];
        this.meteorImageSources = ['images/meteor1.png', 'images/meteor2.webp', 'images/meteor3.webp', 'images/meteor4.png'];

        // setting some intial physical properties
        this.inSpace = false;
        this.acc = 0;
        this.atmosphereLayer = "Troposphere"
        this.groundVisible = true;
        this.time = 0;
        this.vertSpeed = 0;
        this.fuelFlow = 0;
        this.altitude = 0;
        this.fuelMass = 4e3;
        this.mass = 4.2e3 + this.fuelMass;
        this.rhoAir, this.pAir; // initialized in methods

        // setting initial graphics properties
        this.rocketY = this.backgroundHeight/3;
        this.metersToPixels = this.backgroundWidth/16;
        this.lineWidth = this.backgroundWidth/50;
        this.rocketX = x0+7*this.backgroundWidth/16;
        ctx.fillStyle = "rgb(50,0,0)";          
        this.flameDown = false;
        this.flameStretch = 0;
        ctx.strokeStyle = Rocket.borderColor
        this.objStretch = .5*(Math.random()+.5);
        this.objX = null;
        this.objImage = this.cloudImage;
        // this.objX = x0+Math.random()*(this.backgroundWidth-this.objImage.naturalWidth*.75);
        // this.objY = -this.objImage.naturalHeight*.75;
        this.rocketWidth = this.backgroundWidth / 3;
        this.rocketHeight = this.backgroundHeight / 3;
        this.flameWidth = this.backgroundWidth / 3;
        this.flameHeight = 0;
        this.laserWidth = this.backgroundWidth;
        this.laserHeight = this.backgroundHeight / 2;
        this.rocketVX = 0;
        this.fuelFlowInc = 0;
        this.obstacleVY = 0;

        // setting initial obstacle properties
        this.laser = false;
        this.obstacles = [{}, {}, {}, {}];
        this.obstacles.forEach((obst) => {
            obst.image = new Image(),
            obst.x = -Infinity
            obst.y = Infinity,
            obst.vx = 0,
            obst.dead = false;
        });
    }

    blastoff() {
        ctx.font = `${this.backgroundWidth/35}px Arial`;
        this.fuelFlow = 40;          
        this.flameStretch = 1;
        this.flameHeight = this.flameStretch * this.backgroundHeight / 5;
        document.addEventListener('keydown', this.keyDown.bind(this))
        document.addEventListener('keyup', this.keyUp.bind(this));
    }
    
    updateAirProps() {
        var tempAir;
        switch (this.atmosphereLayer) {
            case  "Troposphere":
                tempAir = 15.04 - .00649*this.altitude;
                this.pAir = 101.29 * ((tempAir+273.1)/288.08)**5.256;
                break;
            case "Lower Stratosphere":
                tempAir = -56.46;
                this.pAir = 22.65 *Math.exp(1.73-.000157*this.altitude);
            case "Upper Stratosphere":
                tempAir = -131.21 + .00299*this.altitude;
                this.pAir = 2.488*((tempAir+273.1)/216.6)**-11.388;
        }
        this.pAir *= 1e3;
        tempAir += 273.15;
        this.rhoAir = this.pAir/(Rocket.R*tempAir);
    }

    updateAcc() {
        var thrust = this.fuelFlow * Rocket.exitVel + (Rocket.exitPressure-this.pAir)*Rocket.exitArea;
        if (Math.abs(this.fuelFlow)<.01) thrust = 0;
        var drag = .5*this.rhoAir*this.vertSpeed**2*Rocket.dragCoeff*Rocket.surfaceArea;
        if (this.vertSpeed < 0) drag *= -1;
        const g = Rocket.G*Rocket.M/(this.altitude+Rocket.groundRadius)**2; 
        this.acc = (thrust-drag)/this.mass - g;
    }

    updateAtmosphereLayer() {
        if (this.altitude < 11_000) {
            this.atmosphereLayer = "Troposphere";
            this.objImage = this.cloudImage;
            this.obstacleImageSources = this.birdImageSources;
            this.obstacleVY = 20;
            this.objWidth = this.backgroundWidth;
            this.objHeight = this.backgroundHeight;
            this.objVY = 0;
            this.obstacles.forEach((obst) => {
                obst.width = this.backgroundWidth / 5;
                obst.height = this.backgroundHeight / 5;
            });
        } else if (this.altitude >= 11_000 && this.altitude < 25_000) {
            this.atmosphereLayer = "Lower Stratosphere";
            this.objImage = this.balloonImage;
            this.obstacleImageSources = this.planeImageSources;
            this.obstacleVY = 25;
            this.objWidth = this.backgroundWidth;
            this.objHeight = this.backgroundHeight;
            this.objVY = this.vertSpeed - 10;
            this.obstacles.forEach((obst) => {
                obst.width = this.backgroundWidth / 5;
                obst.height = this.backgroundHeight / 5;
            });
        } else {
            this.atmosphereLayer = "Upper Stratosphere";
            this.objImage = this.balloonImage;
            this.obstacleImageSources = this.meteorImageSources;
            this.obstacleVY = 30;
            this.objWidth = this.backgroundWidth;
            this.objHeight = this.backgroundHeight;
            this.objVY = this.vertSpeed - 15;
            this.obstacles.forEach((obst) => {
                obst.width = this.backgroundWidth / 5;
                obst.height = this.backgroundHeight / 5;
            });
        }
    }

    drawSky() {
        this.backgroundColor = `rgb(${Rocket.initBackgroundRed*(1-this.altitude/100e3)}, ${Rocket.initBackgroundGreen*(1-this.altitude/100e3)}, ${Rocket.initBackgroundBlue*(1-this.altitude/100e3)})`;
        ctx.fillStyle=this.backgroundColor;
        ctx.fillRect(this.x0,0,this.backgroundWidth,this.backgroundHeight);
        this.groundVisible = this.altitude*this.metersToPixels < this.backgroundHeight;
        if (this.groundVisible) {
            ctx.drawImage(this.grassImage,this.x0,this.backgroundHeight/2+this.altitude*this.metersToPixels,this.backgroundWidth,this.grassImage.naturalHeight);
            ctx.drawImage(this.launcherImage,this.x0+this.backgroundWidth/3,this.backgroundHeight/6+this.altitude*this.metersToPixels);
        }
    }

    drawBackgroundObject() {
        this.objY += (this.vertSpeed - this.objVY)*this.metersToPixels*Rocket.dt;

        // Create new background object if the current one is out of view
        if (this.objX == null || this.vertSpeed > 0 && this.objY > this.backgroundHeight){
            this.objStretch = .5*(Math.random()+.5);
            this.objX = this.x0 + Math.random() * (this.backgroundWidth-this.objWidth*this.objStretch);
            this.objY = -this.objImage.naturalHeight*this.objStretch;
        } else if (this.objX == null || this.vertSpeed < 0 && this.objY < -this.objWidth*this.objStretch) {
            this.objStretch = .5*(Math.random()+.5);
            this.objX = this.x0 + Math.random() * (this.backgroundWidth-this.objWidth*this.objStretch);
            this.objY = this.backgroundHeight;
        }

        ctx.drawImage(this.objImage, this.objX, this.objY, this.objWidth*this.objStretch,this.objHeight*this.objStretch);  
    }

    drawObstacles() {
        this.obstacles.forEach((obst) => {
            // Create new obstacle if current one is out of view
            if (obst.x < this.x0 || obst.x > this.x0 + this.backgroundWidth || obst.y > this.backgroundHeight) {
                obst.image.src = this.obstacleImageSources[Math.floor(Math.random()*this.obstacleImageSources.length)];
                obst.y = this.backgroundHeight * Math.random() * .2;
                if (this.atmosphereLayer != "Upper Stratosphere") {
                    const moveRight = Math.floor(Math.random()*2) == 0;
                    obst.vx = (Math.random() * .5 + .5) * (moveRight ? 1 : -1) * this.rocketY/1e2;
                    obst.x = moveRight ? this.x0 : this.x0 + this.backgroundWidth;
                } else {
                    obst.vx = 0;
                    obst.x = Math.random()*(this.x0 + this.backgroundWidth - obst.width);
                }
                obst.dead = false;
            }

            // Update obstacle position
            obst.x += this.metersToPixels * obst.vx * Rocket.dt;
            obst.y += this.obstacleVY * Rocket.dt

            // "Kill" obstacle and set rocket speed to 0 if rocket is hit
            if (!obst.dead && obst.x >= this.rocketX && obst.x <= this.rocketX + this.rocketWidth
                && obst.y >= this.rocketY && obst.y <= this.rocketY + this.rocketHeight) {
                    obst.dead = true;
                    if (this.vertSpeed > 0) {
                        this.vertSpeed = 0;
                    }
            }
            if (!obst.dead) {
                ctx.drawImage(obst.image, obst.x, obst.y, obst.width, obst.height);
            }
        });
    }

    drawLaser() {
        const centerRocket = this.rocketX + this.rocketWidth / 2;
        ctx.drawImage(this.laserImage, this.rocketX + this.rocketWidth / 2 - this.laserWidth / 1.9, 0, this.laserWidth, this.laserHeight);
        this.obstacles.forEach((obst) => {
            if (obst.x > centerRocket - obst.image.width / 2 && obst.x < centerRocket + obst.image.width / 2) {
                obst.dead = true;
            }
        });
    }

    drawRocket() {
        const meanFlameStretch = .1 * this.fuelFlow;
        if (this.flameStretch < .75 * meanFlameStretch)
            this.flameDown = false;
        else if (this.flameStretch > 1.25 * meanFlameStretch)
            this.flameDown = true;
        if (this.flameDown)
            this.flameStretch -= .02;
        else
            this.flameStretch += .02;
        ctx.drawImage(this.rocketImage,this.rocketX,this.rocketY,this.rocketWidth,this.rocketHeight);
        this.flameHeight = this.flameStretch * this.backgroundHeight / 5;
        
        if (this.fuelFlow > .01) {
            ctx.translate(this.rocketX+this.rocketWidth/2,this.rocketY+this.rocketHeight);
            ctx.rotate(Math.PI);
            ctx.drawImage(this.flameImage,-this.flameWidth/2,-this.flameHeight+this.rocketHeight/7,this.flameWidth,this.flameHeight);
            ctx.rotate(Math.PI);
            ctx.translate(-this.rocketX-this.rocketWidth/2,-this.rocketY-this.rocketHeight);
        }
    }

    drawLabel() {
        ctx.fillStyle = "white";
        this.backgroundHeight = Math.abs(this.backgroundHeight);
        if (this.vertSpeed == 0) this.vertSpeed = 0;
        if (this.acc == 0) this.acc = 0;
        ctx.fillRect(this.x0,0,this.backgroundWidth,this.backgroundHeight/20);
        ctx.fillRect(this.x0,19*this.backgroundHeight/20,this.backgroundWidth,this.backgroundHeight/20);
        ctx.strokeText(`Fuel flow rate: ${this.fuelFlow.toFixed(1)} lbm/sec`,this.x0+2*this.backgroundWidth/3,31.5*this.backgroundHeight/32);
        ctx.strokeText(`Altitude: ${((Math.abs(this.altitude) < 5 ? 0 : this.altitude)/1000).toFixed(2)} km, speed: `
                       + `${((Math.abs(this.vertSpeed) < 5 ? 0 : this.vertSpeed)/1000).toFixed(2)} km/s,`
                       + `acceleration ${(Math.abs(this.acc) < .5 ? 0 : this.acc).toFixed(1)} m/s^2`
                       + ` time: ${this.time.toFixed(0)} seconds`, 
                       this.x0+this.backgroundWidth/50,this.backgroundHeight/32);
        ctx.strokeText(`Atmospheric layer: ${this.atmosphereLayer}`,this.x0+this.backgroundWidth/50,31.5*this.backgroundHeight/32);

        // Fuel bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.x0+this.backgroundWidth*7/16,this.backgroundHeight*30.75/32,this.backgroundWidth*(this.fuelMass/4e3)/5,this.backgroundHeight/40);
        ctx.beginPath();
        ctx.moveTo(this.x0+this.backgroundWidth*7/16,this.backgroundHeight*30.75/32);
        ctx.lineTo(this.x0+this.backgroundWidth*7/16+this.backgroundWidth/5,this.backgroundHeight*30.75/32);
        ctx.lineTo(this.x0+this.backgroundWidth*7/16+this.backgroundWidth/5,this.backgroundHeight*30.75/32+this.backgroundWidth/25);
        ctx.lineTo(this.x0+this.backgroundWidth*7/16,this.backgroundHeight*30.75/32+this.backgroundWidth/25);
        ctx.lineTo(this.x0+this.backgroundWidth*7/16,this.backgroundHeight*30.75/32);
        ctx.stroke();

    }

    drawBorder() {
        ctx.beginPath();
        ctx.moveTo(this.x0+this.lineWidth/2,this.lineWidth/2);
        ctx.lineTo(this.x0+this.backgroundWidth-this.lineWidth/2,this.lineWidth/2);
        ctx.lineTo(this.x0+this.backgroundWidth-this.lineWidth/2,this.backgroundHeight-this.lineWidth/2);
        ctx.lineTo(this.x0+this.lineWidth/2,this.backgroundHeight-this.lineWidth/2);
        ctx.lineTo(this.x0+this.lineWidth/2,this.lineWidth/2);
        ctx.stroke();
    }

    keyDown(e) {
        switch (e.key) {
            case this.userUp:
                this.fuelFlowInc = 5;
                break;
            case this.userDown:
                this.fuelFlowInc = -5;
                break;
            case this.userLeft:
                this.rocketVX = -50;
                break;
            case this.userRight:
                this.rocketVX = 50;
                break;
            case this.userKill:
                this.laser = true;
        }
    }

    keyUp(e) {
        switch (e.key) {
            case this.userUp:
                this.fuelFlowInc = 0;
                break;
            case this.userDown:
                this.fuelFlowInc = 0;
                break;
            case this.userLeft:
                this.rocketVX = 0;
                break;
            case this.userRight:
                this.rocketVX = 0;
                break;
            case this.userKill:
                this.laser = false;
        }
    }
    update() {
        if (this.altitude <= 0 && this.vertSpeed < -.01){
            this.acc = 0;
            this.vertSpeed = 0;
            this.altitude = 0;
        }
        this.updateAirProps();
        this.updateAcc();
        this.updateAtmosphereLayer();
        this.time += Rocket.dt;
        this.altitude += Rocket.dt * this.vertSpeed;
        this.rocketX += Rocket.dt * this.rocketVX
        this.vertSpeed += this.acc * Rocket.dt;
        this.fuelMass -= this.fuelFlow * Rocket.dt;
        if (this.fuelMass < 0) {
            this.fuelFlow = 0;
            this.fuelMass = 0;
        }
        if (this.rocketX < this.x0) {
            this.rocketX = this.x0;
        }
         if (this.rocketX > this.x0 + this.backgroundWidth - this.rocketImage.naturalWidth/8) {
            this.rocketX = this.x0 + this.backgroundWidth - this.rocketImage.naturalWidth/8;
         }
        this.mass -= this.fuelFlow * Rocket.dt;
        this.fuelFlow += Rocket.dt * this.fuelFlowInc;
        if (this.fuelFlow > 40) this.fuelFlow = 40;
        if (this.fuelFlow < 0) this.fuelFlow = 0;
        this.inSpace = this.altitude > Rocket.spaceAltitude;
        return !this.inSpace;
    }
    draw() {
        this.drawSky();
        if (this.laser) this.drawLaser();
        this.drawBackgroundObject();
        this.drawRocket();
        if (this.altitude > 15) this.drawObstacles();
        this.drawLabel();
        this.drawBorder();
    }
}

function startup(startBackgroundImage, startButton, width, height) {
    ctx.drawImage(startBackgroundImage, 0, 0, width, height);
    ctx.font = `800 ${width/5}px Title-Font`;
    ctx.fillText("Rocket", width/100, width/4.5);
    ctx.fillText("Racers", width/100, width/2.5);
    return new Promise((resolve) => startButton.addEventListener('click',()=>{
        startButton.style.visibility = 'Hidden';
        resolve();
    }, { once: true }));
}

async function countdown (countdownNum) {
    resolveAfter = (sec) => {
        return new Promise((resolve) => {
            setTimeout(() => {
            resolve();
            }, 2000*sec);
        });
    };
    countdownNum.innerHTML = '3';
    countdownNum.style.visibility = 'Visible';
    await resolveAfter(1);
    countdownNum.innerHTML = '2';
    await resolveAfter(1);
    countdownNum.innerHTML = '1';
    await resolveAfter(1);
    countdownNum.innerHTML = 'GO!';
    await resolveAfter(.5);
    countdownNum.style.visibility = 'Hidden';
    startRunning = false;
    gameRunning = true;
};

function runGame(frameDT, rockets) {
    let currFrame = 0;
    const startTime = performance.now();
    const winners = [];
    let gameRunning = true;
    return new Promise((res) => {
        requestAnimationFrame(animate);
        async function animate() {
            rockets.forEach((rocket) => {
                rocket.draw();
                if (!rocket.update()) {
                    gameRunning = false;
                    winners.push(rocket);
                }
            });
            if (gameRunning) {
                await new Promise((res)=>setTimeout(()=>res(), 
                    Math.max(0,++currFrame*frameDT-(performance.now()-startTime))));
                requestAnimationFrame(animate);
            } else {
                res(winners);
            }
        }
    })
}

async function end(frameDT, winners, tieImage) {
    ctx.font = "bold 30px serif";
    backgroundImage = winners.length == 0 ? winners[0].flagImage : tieImage;
    endText = winners ? `${winners[0].name} wins after ${winners[0].time.toFixed(0)} seconds!` : "Tie!!";
    await rocketAnimation(frameDT, endText, backgroundImg, winners[0].rocketImage);
    await arcAnimation(frameDT, endText, backgroundImg);
}

// TODO : make the rockets at the bottom of the screens, fix graphics alignments (including lasers),
// make it no more scrolling
// make the ending thing actually look good and not such redundant code
// make the tie actually work
// somehow add flags & names to each user's screen
// add instructions
// put the fuel bar & battery on the rocket itself
// fix the font size
// make start screen prettier

async function setupHTMLElements() {
    const startBackgroundImage = new Image();
    startBackgroundImage.src = './images/startBackgroundImage.jpg';
    const tieImage = new Image();
    tieImage.src = 'images/tieimage.jpg';
    const startButton = document.getElementById('Start-Button');
    const playAgainButton = document.getElementById('Play-Again-Button');
    const countdownNum = document.getElementById('Countdown');
        
    const canvas = document.querySelector(".RocketCanvas");
    const canvasWidth = (canvas.width = window.innerWidth);
    const canvasHeight = (canvas.height = window.innerWidth*.75);
    ctx = canvas.getContext("2d");
    const titleFont = new FontFace('Title-Font', 'url(fonts/SpaceCrusadersItalic-ZV1Zx.ttf)');
    await titleFont.load().then(function(font){
        document.fonts.add(font);
    });
    return { startBackgroundImage: startBackgroundImage, tieImage: tieImage, 
             startButton: startButton, playAgainButton: playAgainButton, countdownNum: countdownNum, 
             canvas: canvas, canvasWidth: canvasWidth, canvasHeight: canvasHeight};
}

function playAgain(playAgainButton) {
    playAgainButton.style.visible = 'Visible';
    return new Promise((resolve) => {
        playAgainButton.addEventListener('click', () => resolve());
    });
}

async function run(frameDT, htmlElements) {
    const zoomer1 = new Rocket("Player 1", htmlElements.canvasWidth/2, htmlElements.canvasHeight, 0, htmlElements.canvasHeight, 
                               'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'usflag.png');
    const zoomer2 = new Rocket("Player 2", htmlElements.canvasWidth/2, htmlElements.canvasHeight, htmlElements.canvasWidth/2, htmlElements.canvasHeight, 
                               'w', 's', 'a', 'd', 'x', 'spainflag.webp');
    resetFrame();
    await startup(htmlElements.startBackgroundImage, htmlElements.startButton, htmlElements.canvasWidth, htmlElements.canvasHeight);
    resetFrame();
    await countdown(htmlElements.countdownNum);
    zoomer1.blastoff();
    zoomer2.blastoff();
    resetFrame();
    const winners = await runGame(frameDT, [zoomer1, zoomer2]);
    resetFrame();
    await end(frameDT, winners, htmlElements.tieImage);
    resetFrame();
    await playAgain(htmlElements.playAgainButton);
    run(frameDT, htmlElements)
}

async function arcAnimation(frameDT, endText, backgroundImg) {
  //  ctx.clearRect(0, 0, width, height);
    ctx.drawImage(backgroundImg, 0, 0, width, height);
    ctx.beginPath();
    ctx.arc(width/2, 5*height/8, width/4, -Math.PI, theta += dTheta);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeText(endText, width/5, height/2);
    if (theta >= 0) {
        await new Promise ((res)=>setTimeout(()=>{
            arcAnimation(frameDT,endText,backgroundImg);
            res();
        }, Math.max(0,currFrame*frameDT-(performance.now()-startTime))));
    }
    else {
        return;
    }
}

async function rocketAnimation(frameDT, endText, backgroundImg, rocketImg) {
    ctx.drawImage(backgroundImg, 0, 0, width, height);
    ctx.arc(width/2, 5*height/8, width/4, -Math.PI, 0);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeText(endText, width/5, height/2);
    ctx.rotate(rotateAngle);
    ctx.drawImage(rocketImg, rocketPos-=dRocketPos, 0, width / 8, height / 3);
    ctx.rotate(-rotateAngle);
    return rocketPos > centerDist;
}

function resetFrame() {
    currFrame = 0;
    startTime = performance.now();
}

async function main() {
    const htmlElements = await setupHTMLElements();
    const frameDT = 2; // milliseconds
    run(frameDT, htmlElements);
}

var startTime, currFrame, ctx;
main();