import { LightSource, Vec3 } from "../utils";
import { Shape3D } from "./shapes/3D/shape3d";

class Object3D {
    items: Map<Shape3D, Vec3>;

    constructor(items: Map<Shape3D, Vec3>) {
        this.items = items;
    }

    public draw(objPos: Vec3, lightSource: LightSource, observerPos: Vec3) {
        for (const item of this.items.keys()) {
            const relPos = this.items.get(item);
            if (relPos != undefined) item.draw(relPos.plus(objPos), lightSource, observerPos);
        }
    }
}
export { Object3D };