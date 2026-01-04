import { Vec3 } from "../utils.js";

class MotorcycleDynamics {
    
    constructor(pos) {
        this.pos = pos;
        this.vel = Vec3.ZERO;
        this.accel = Vec3.ZERO;
    }

    function stop() {
        this.vel = Vec3.ZERO;
    }

    function changeAccel(newAccel) {
        this.accel = newAccel;
    }

    function propagate(dt) {
        this.pos.plus(this.vel.scale(dt));
        this.vel.plus(this.accel.scale(dt));
    }


}