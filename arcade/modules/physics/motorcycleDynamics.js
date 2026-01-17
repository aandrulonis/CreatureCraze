import { Vec3 } from "../utils.js";

class MotorcycleDynamics {
    
    constructor(eyeRelPos) {
        this.pos = Vec3.ZERO; // environment coordinate system
        this.vel = Vec3.ZERO;; // body coordinate system
        this.accel = Vec3.ZERO;; // body coordinate system; does not include gravity
        this.omegaDot = Vec3.ZERO; // angular velocity of COM
        this.alpha = Vec3.ZERO; // angular acceleration of COM
        this.eyeRelPos = eyeRelPos; // vector pointing from motorcycle COM to POV
        this.falling = false;
    }

    function stop() {
        this.vel = Vec3.ZERO;
    }

    function changeAccel(newAccel) {
        this.accel = newAccel;
    }

    function propagate(dt) {
        if (this.falling) {
            const downVec = this.pos.norm().minus(Vec3)
            const gVec = downVec.scale(Vec3.Z_HAT.scale(g).dot(groundVec));
        }
    }


}