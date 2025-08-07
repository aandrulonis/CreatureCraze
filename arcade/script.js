const pongButton = document.getElementById("Pong-Button");
const pacmanButton = document.getElementById("Pacman-Button");
const spaceInvadersButton = document.getElementById("Space-Invaders-Button");
const motorcycleRacerButton = document.getElementById("Motorcycle-Racer-Button");
const modeButtons = document.getElementById("Mode-Selection");
const beginnerButton = document.getElementById("Beginner");
const intermediateButton = document.getElementById("Intermediate");
const advancedButton = document.getElementById("Advanced");
const frameDT = .2; // millisecond

async function startup() {
    const utils = await import("./modules/utils.js");
    const { runPong } = await import("./modules/minigames/Pong.js");
  //  const { runPacman } = await import("./modules/minigames/Pacman.js");
    const { runSpaceInvaders } = await import("./modules/minigames/SpaceInvaders.js");
    const { runMotorcycleRacer } = await import("./modules/minigames/MotorcycleRacer.js")
    pongButton.addEventListener('click', ()=> {
        runPong(utils);
    });
    // pacmanButton.addEventListener('click', () => {
    //     runPacman(utils);
    // });
    spaceInvadersButton.addEventListener('click',() => {
        runSpaceInvaders(utils);
    });
    motorcycleRacerButton.addEventListener('click',() => {
        runMotorcycleRacer(utils);
    })
}

startup();