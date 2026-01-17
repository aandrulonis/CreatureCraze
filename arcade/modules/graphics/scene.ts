import { Object3D } from  "./object.ts";
import { LightSource, Vec3} from "../utils.js";

class Scene {
    objects: Array<Object3D>;
    lightSource: LightSource;
    observerPos: Vec3;
    observerViewDir: Vec3;

    constructor(objects: Array<Object3D>, lightSource: LightSource, observerPos: Vec3, observerViewDir: Vec3) {
        this.objects = objects;
        this.lightSource = lightSource;
        this.observerPos = observerPos;
        this.observerViewDir = observerViewDir;
    }
    
    computeIrradiance(d: number, phi0: number, theta0: number, n1: number = 100, n2: number = 100) {
        const dPsi = .5 * Math.PI / n1;
        const dTheta = 2 * Math.PI / n2;
        let psiI = 0;
        let thetaI = 0;
        let sum = 0;
        for (let i = 0; i < n1; i++) {
            for (let j = 0; j < n2; j++) {
                sum += *Math.cos(thetai)*Math.sin(thetai)*dPsi * dTheta
                psiI += dPsi;
                thetaI += dTheta;
            }
        }
        return sum *  
    }
}