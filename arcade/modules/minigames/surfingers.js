var frameDT, canvas, ctx, backgroundWidth, backgroundHeight;

class SurfingersProps {

    static zones = {
        OCEAN: "ocean",
        RAINFOREST: "rainforest",
        WINTER_FOREST: "winter forest"
    };

    static Wave = class {
        constructor(x, lastLevel) {
            this.x = x;
            this.zone = Object.values(SurfingersProps.zones)[Math.floor(this.x / SurfingersProps.ZONE_WIDTH) 
                % Object.values(SurfingersProps.zones).length];
            let maxLevel = Math.min(lastLevel + 2, SurfingersProps.MAX_WAVE_LEVEL);
            let minLevel = Math.max(lastLevel - 2, SurfingersProps.MIN_WAVE_LEVEL);
            this.level = Math.floor((maxLevel - minLevel + 1) * Math.random()) + minLevel;
            this.image = new Image();
            let imageSrc = './images/surfingers/';
            switch (this.zone) {
                case SurfingersProps.zones.OCEAN:
                    imageSrc += 'ocean.png';
                    break;
                case SurfingersProps.zones.RAINFOREST:
                    imageSrc += 'river.png';
                    break;
                case SurfingersProps.zones.WINTER_FOREST:
                    imageSrc += 'snow.png';
                    break;
            }
            this.image.src = imageSrc;
        }

        draw(leftX) {
            if (leftX + backgroundWidth < this.x) return;
            let y;
            for (let i = 0; i < this.level; i++) {
                y = SurfingersProps.WAVE_LEVEL_HEIGHT * (SurfingersProps.MAX_WAVE_LEVEL - i) + SurfingersProps.WAVE_MIN_Y;
                ctx.drawImage(this.image, this.x - leftX, y, SurfingersProps.WAVE_WIDTH, SurfingersProps.WAVE_LEVEL_HEIGHT);
            }
            ctx.drawImage(SurfingersProps.FOAM_IMAGE, this.x - leftX, y, SurfingersProps.WAVE_WIDTH, SurfingersProps.FOAM_HEIGHT);
        }
    }

    findCurrScore() {
        return Math.floor(this.x / SurfingersProps.WAVE_WIDTH);
    }

    keydownFunc = (evt) => {
        if (evt.key == "ArrowUp")  {
            this.currKeyDown = "ArrowUp";
        }
        else if (evt.key == "ArrowDown") {
            this.currKeyDown = "ArrowDown";
        } 
        else return;
        removeEventListener('keydown', this.keydownFunc);
        addEventListener('keyup', this.keyupFunc);     
    };

    keyupFunc = (evt) => {
        console.log("YAY")
        if (evt.key != this.currKeyDown) return;
        if (this.currKeyDown == "ArrowUp") {
            if (this.currWave.level < SurfingersProps.MAX_WAVE_LEVEL) this.currWave.level++;
        } else if (this.currKeyDown == "ArrowDown") {
            if (this.currWave.level > SurfingersProps.MIN_WAVE_LEVEL) this.currWave.level--;
        }
        removeEventListener('keyup', this.keyupFunc);
        addEventListener('keydown', this.keydownFunc);
        this.currKeyDown = null;
        this.updateY();
    }

    updateY() {
        this.y = (SurfingersProps.MAX_WAVE_LEVEL - this.currWave.level) * SurfingersProps.WAVE_LEVEL_HEIGHT + SurfingersProps.WAVE_MIN_Y;
    }

    advance() {
        this.x += this.vel * frameDT;
        if (this.vel < SurfingersProps.MAX_VEL) this.vel += SurfingersProps.ACCEL * frameDT;
        while (this.x  + backgroundWidth - SurfingersProps.ANIMAL_X >= this.waves[this.waves.length - 1].x) {
            const lastWave = this.waves[this.waves.length - 1];
            this.waves.push(new SurfingersProps.Wave(lastWave.x + SurfingersProps.WAVE_WIDTH, lastWave.level));
        }
        let spliceCount = 0;
        while (spliceCount < this.waves.length && this.x > this.waves[spliceCount].x + SurfingersProps.WAVE_WIDTH) {
            spliceCount++;
        }
        this.waves.splice(0, spliceCount);
        if (this.currWave.level != this.waves[0].level) return false; // game over
        this.currWave = this.waves[0];
        return true;
    }

    draw() {
        ctx.fillRect(0, 0, backgroundWidth, backgroundHeight);
        for (const wave of this.waves) wave.draw(this.x - SurfingersProps.ANIMAL_X);
        this.animal.draw(ctx, SurfingersProps.ANIMAL_X, this.y, SurfingersProps.ANIMAL_WIDTH, SurfingersProps.ANIMAL_HEIGHT);
    }

    constructor(animal) {
        this.animal = animal;
        this.currZone = SurfingersProps.zones[0];
        this.x = 0;
        this.currKeyDown = null;
        this.waves = [];
        
        SurfingersProps.BOAT_IMAGE = new Image();
        SurfingersProps.BOAT_IMAGE.src = './images/surfingers/sailboat.png';
        SurfingersProps.START_VEL = backgroundWidth / 4000; // pixels per millisecond
        SurfingersProps.MAX_VEL = backgroundWidth / 2000; // pixels per millisecond
        SurfingersProps.ACCEL = backgroundWidth / 10_000_000; // pixel per millisecond ^ 2
        SurfingersProps.MIN_WAVE_LEVEL = 3;
        SurfingersProps.MAX_WAVE_LEVEL = 6;
        SurfingersProps.WAVE_LEVEL_HEIGHT = backgroundHeight / 10;
        SurfingersProps.WAVE_WIDTH = backgroundWidth / 8;
        SurfingersProps.ANIMAL_WIDTH = SurfingersProps.WAVE_WIDTH / 4;
        SurfingersProps.ANIMAL_HEIGHT = SurfingersProps.WAVE_LEVEL_HEIGHT * 3 / 4;
        SurfingersProps.WAVE_MIN_Y = backgroundHeight / 5;
        SurfingersProps.ANIMAL_X = SurfingersProps.WAVE_WIDTH / 2;
        SurfingersProps.FOAM_IMAGE = new Image();
        SurfingersProps.FOAM_IMAGE.src = './images/surfingers/foam.png';
        SurfingersProps.FOAM_HEIGHT = SurfingersProps.WAVE_LEVEL_HEIGHT / 6;
        SurfingersProps.ZONE_WIDTH = SurfingersProps.WAVE_WIDTH * 100;

        let currWaveX = 0;
        let lastLevel = 4;
        do {
            const newWave = new SurfingersProps.Wave(currWaveX, lastLevel)
            this.waves.push(newWave);
            lastLevel = newWave.level;
            currWaveX += SurfingersProps.WAVE_WIDTH;
        } while(currWaveX < backgroundWidth);
        this.currWave = this.waves[0];

        this.vel = SurfingersProps.START_VEL;
        this.updateY();
        addEventListener('keydown', this.keydownFunc);
    }

};

async function runSurfingers(dt, utils, userAnimal) {
    frameDT = dt;
    canvas = document.getElementById("Canvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    backgroundWidth = canvas.width;
    backgroundHeight = canvas.height;
    let finalScore = 0;

   // await preLevel();
    const props = new SurfingersProps(userAnimal);
    await mainFunc(props);


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
                props.draw();
                if (props.advance()) {
                    await new Promise((res)=>setTimeout(()=>res(),Math.max(0,startTime+currFrame*frameDT-performance.now())))
                    requestAnimationFrame(animate);
                } else {
                    finalScore = props.currScore;
                }
            }
        });
    }
}

export { runSurfingers };