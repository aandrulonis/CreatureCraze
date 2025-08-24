const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const barLength = width/4;
const MAX_THETA=Math.PI/3;
const tempo = 160;
const framesPerBeat = 40;
const frameDT = tempoToDT(tempo, framesPerBeat);
const beep = new Audio('clipped_beep.m4a');
const imgDX = barLength*Math.sin(MAX_THETA/2);
let frame = 0;
const burnImg = new Image();
burnImg.src = './burn.png';
const imgWidth = width/6;
const imgHeight = height/3;

function tempoToDT(bpm,framesPerBeat) {
    const beatsPerMillisecond = bpm/(60*1000);
    const milliSecondsPerBeat = 1/beatsPerMillisecond;
    return milliSecondsPerBeat/framesPerBeat;
}

function drawMetronome(barTheta) {
    ctx.clearRect(0,0,width,height);
    const lineTheta = Math.PI/2-MAX_THETA/2+barTheta;
    ctx.strokeStyle = "black"
    ctx.beginPath();
    ctx.moveTo(width/2,height);
    ctx.lineTo(width/2+barLength*Math.cos(lineTheta),height-barLength*Math.sin(lineTheta));
    ctx.stroke();
}

async function loop() {
    frame++;
    const frameRem = frame%(2*framesPerBeat);
    if (frameRem == 0 || frameRem == framesPerBeat) beep.play();
    const beatFrac = .5 * frameRem/framesPerBeat;
    const barTheta = beatFrac < .5 ? beatFrac * MAX_THETA * 2 : (1-beatFrac)*2*MAX_THETA;
    drawMetronome(barTheta);
    ctx.drawImage(burnImg,width/2-imgWidth-imgDX,height-imgHeight,imgWidth,imgHeight);
    ctx.drawImage(burnImg,width/2+imgDX,height-imgHeight,imgWidth,imgHeight);
    await new Promise((res)=>setTimeout(()=>res(),Math.max(0,startTime+frame*frameDT-performance.now())));
    requestAnimationFrame(loop);
}

const startTime = performance.now();
console.log(frameDT)
requestAnimationFrame(loop);