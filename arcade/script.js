const pongButton = document.getElementById("Pong-Button");
const pacmanButton = document.getElementById("Pacman-Button");
const spaceInvadersButton = document.getElementById("Space-Invaders-Button");
const motorcycleRacerButton = document.getElementById("Motorcycle-Racer-Button");
const surfingersButton = document.getElementById("Surfingers-Button");
const modeButtons = document.getElementById("Mode-Selection");
const beginnerButton = document.getElementById("Beginner");
const intermediateButton = document.getElementById("Intermediate");
const advancedButton = document.getElementById("Advanced");
const frameDT = 5; // milliseconds

function makeImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

async function startup() {
    const utils = await import("./modules/utils.js");
    const { runPong } = await import("./modules/minigames/Pong.js");
  //  const { runPacman } = await import("./modules/minigames/Pacman.js");
    const { runSpaceInvaders } = await import("./modules/minigames/SpaceInvaders.js");
    // const { runMotorcycleRacer } = await import("./modules/minigames/MotorcycleRacer.js");
    const { runSurfingers } = await import("./modules/minigames/surfingers.js");
    
    let jsonPromise;
    await fetch("./json/stereo.json").then((response)=> {if (!response.ok) jsonPromise = null;  else jsonPromise = response.json(); });
    if (!jsonPromise) return;
    const pixelsObj = await jsonPromise;
    const spaceInvaderImports = {
        pixels: pixelsObj.pixels,
        images: {
            hero: makeImage('./images/space_invaders/monkey_transparent.png'),
            dyingHero: makeImage('./images/space_invaders/monkey_dying_transparent.png'),
            enemy: makeImage('./images/space_invaders/alien_transparent.png'),
            arrow: makeImage('./images/space_invaders/arrow_transparent.png'),
            heart: makeImage('./images/space_invaders/heart_transparent.png')
        }
    }
    pongButton.addEventListener('click', () => {
        runPong(frameDT, utils);
    });
    // pacmanButton.addEventListener('click', () => {
    //     runPacman(utils);
    // });
    spaceInvadersButton.addEventListener('click', () => {
        runSpaceInvaders(frameDT, utils, spaceInvaderImports);
    });
    // motorcycleRacerButton.addEventListener('click', () => {
    //     runMotorcycleRacer(frameDT, utils);
    // });
    const animalImg = new Image();
    animalImg.src = 'images/surfingers/croc.png';
    surfingersButton.addEventListener('click', () => {
        runSurfingers(frameDT, utils, { 
            draw(ctx, x,y,w,h) {  ctx.drawImage(animalImg, x, y, w, h) } });
    });
}

startup();