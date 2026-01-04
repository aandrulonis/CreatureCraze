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
}