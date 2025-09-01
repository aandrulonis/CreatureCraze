var frameDT, PI, outcomes, modes, Vec2, canvas, ctx, backgroundWidth, backgroundHeight;

class PongProps {
    static START_BUTTON = document.getElementById('Pong-Start-Button');
    static unicornDirection = {
        RIGHT: 1,
        LEFT: -1
    };
    
    keydownFunc = (evt) => {
        if (evt.key == "ArrowRight")  {
            this.barV = this.barSpeed;
            this.unicornImg.src = PongProps.unicornRightImgSrc;
        }
        else if (evt.key == "ArrowLeft") {
            this.barV = -this.barSpeed;
            this.unicornImg.src = PongProps.unicornLeftImgSrc;
        } 
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
                break;
            case modes.INTERMEDIATE:
                this.barWidth = backgroundWidth / 5;
                this.ballR = backgroundWidth / 60;
                this.ballSpeed = 4;
                this.barSpeed = 5;
                break;
            case modes.ADVANCED:
                this.barWidth = backgroundWidth / 10;
                this.ballR = backgroundWidth / 45;
                this.ballSpeed = 5;
                this.barSpeed = 15;
        }
        this.mode  = mode;
        this.barHeight = this.barWidth / 2;
        this.barX = Math.random() * (backgroundWidth-this.barWidth);
        this.ballPos = new Vec2(backgroundWidth/2, backgroundHeight/2);
        this.ballAlpha = 0;
        this.outcome = outcomes.IN_PROGRESS;
        this.ballTheta = (Math.floor(Math.random()*2))*PI/2+PI/12+(Math.random()*PI/3);
        this.barV = 0;
        this.currScore = 0;
        this.unicornImg = new Image();
        this.unicornImg.src = PongProps.unicornRightImgSrc;
        
        PongProps.barY = backgroundHeight * 3/4;
        PongProps.ballOmega = PI/200; // radians per millisecond
        PongProps.scoreWidth = backgroundWidth / 10;
        PongProps.meteroidImg = new Image();
        PongProps.cityImg = new Image();
        PongProps.unicornRightImgSrc = "./images/pong/unicorn_transparent.png";
        PongProps.unicornLeftImgSrc = "./images/pong/unicorn_left_transparent.png";
        PongProps.backgroundImg = new Image();

        if (!PongProps.cityImg.src) PongProps.cityImg.src = "./images/pong/city_transparent.png";
        this.unicornImg.src = PongProps.unicornRightImgSrc;
        if (!PongProps.meteroidImg.src) PongProps.meteroidImg.src = "./images/pong/meteroid_transparent.png";
        if (!PongProps.backgroundImg.src) PongProps.backgroundImg.src = "./images/pong/backgroundImg.png"; 

        addEventListener('keydown', this.keydownFunc);
    }
}

async function runPong(dt, utils) {
    frameDT = dt;
    canvas = document.getElementById("Canvas");
    ctx = canvas.getContext("2d");
    backgroundWidth = canvas.width;
    backgroundHeight = canvas.height;

    PI = utils.PI;
    outcomes = utils.outcomes;
    modes = utils.modes;
    Vec2 = utils.Vec2;

    var props, frameCount, startTime;
    let pendingStart = true;

    const startupPromise = new Promise((resolve) => {
        modeButtons.style.visibility = 'Visible';
        ctx.font = `${backgroundWidth / 5}px arial`;
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
            ctx.drawImage(props.unicornImg,props.barX, PongProps.barY, props.barWidth, props.barHeight);
            ctx.moveTo(...props.ballPos.getList());
            ctx.rotate(props.ballAlpha);
            const rotatedOrigin = props.ballPos.rotate(-props.ballAlpha);
            ctx.drawImage(PongProps.meteroidImg, rotatedOrigin.x-props.ballR, rotatedOrigin.y-props.ballR, 2*props.ballR, 2*props.ballR);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.moveTo(0,0);
            ctx.strokeText(props.currScore, backgroundWidth / 2 - PongProps.scoreWidth / 2, backgroundHeight / 5, PongProps.scoreWidth)
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, backgroundWidth, backgroundHeight);
        }

        // Update positions
        props.ballPos = props.ballPos.increment(props.ballSpeed * Math.cos(props.ballTheta),
                                                -props.ballSpeed * Math.sin(props.ballTheta));
        props.ballAlpha += PongProps.ballOmega * frameDT;
        if ((props.barV < 0 && props.barX >= 0) || (props.barV > 0 && props.barX <= backgroundWidth - props.barWidth)) props.barX += props.barV;

        // Check for collisions
        if (props.ballPos.y + props.ballR > PongProps.barY && 
            Math.abs(props.ballPos.x - (props.barX + props.barWidth / 2)) < props.barWidth/2
            && props.ballPos.y < PongProps.barY + props.barHeight / 4
            && Math.sin(props.ballTheta) < 0) {
            // ball / bar collision
            props.ballTheta = 2*PI - props.ballTheta; 
            props.currScore ++;
        }
        else if (props.ballPos.x - props.ballR < 0 || props.ballPos.x + props.ballR > backgroundWidth) {
                props.ballTheta = PI - props.ballTheta; // ball / LR wall
        }
        // } else if ((Math.abs(props.ballPos.y-PongProps.barY)<=PongProps.barY/2&&props.ballPos.x + props.ballR > props.barX && Math.cos(props.ballTheta) > 0)
        //            || (Math.abs(props.ballPos.y-PongProps.barY)<=PongProps.barY/2&&props.ballPos.x - props.ballR < props.barX + props.barWidth && Math.cos(props.ballTheta) < 0)) {
        //      // ball / side of bar
        //     props.ballTheta = 2*PI - props.ballTheta;
        //     if (Math.abs(props.ballSpeed*cos()) < props.barSpeed) {
        //         props.ballTheta = props.barSpeed 
        //     }
        // } 
        else if (props.ballPos.y - props.ballR < 0) props.ballTheta *= -1; // bar / upper wall collision
        
        // Check for death
        if (props.ballPos.y - props.ballR > backgroundHeight) {
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
        ctx.fillStyle = props.barutils.Color.getStr();
        ctx.font = props.stripeutils.Color.getStr();
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

export { runPong }