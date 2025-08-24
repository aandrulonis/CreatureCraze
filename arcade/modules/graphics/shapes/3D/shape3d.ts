abstract class Shape3D {
    surfaceRoughness: number;
    diffuseCol: Color;
    spectralCol: Color;
    shininess: number;

    constructor(surfaceRoughness: number, diffuseCol: Color, spectralCol: Color, shininess: number) {
        this.surfaceRoughness = surfaceRoughness;
        this.diffuseCol = diffuseCol;
        this.spectralCol = spectralCol;
        this.shininess = shininess;
    }

    
    public abstract triangulate(res: number) : void;
    public abstract getTriangles() : Array<Array<Vec3>>;
    public getIndices() : Array<number> {
        const numVertices = this.getVertices().length;
        const indices : Array<number> = [];
        let i : number = 0;
        while (i++ < numVertices) indices.push(i);
        return indices;
    }
    public getColors(vertices: Array<Vec3>, lightColor : Color, lightPos : Vec3) : Array<Color>  {
        const norms : Array<Vec3> = this.getNorms(colorRes);
        const colors : Array<Color> = [];
        norms.forEach((norm) => {
            colors.push(new Color(r, g, b, this.diffuseCol.a))
        })
    }
    public getCollision(otherObj : Shape3D) : boolean {

    }
    
    protected abstract getVertices() : Array<Vec3>;
    protected abstract getGradient(x: number, y: number, z: number): Vec3;

    private getNorms(colorRes : number) {
        const points : Array<Vec3> = this.getSamplePoints(colorRes);
        const norms : Array<Vec3> = [];
        points.forEach((point) => {
            norms.push(this.getGradient(...point.getList()).getUnitVec());
        });
        return norms;
    }

    /**
     * The below functions compute reflection & diffusion
     * All equations from https://learnopengl.com/PBR/Theory
     */

    /**
     * Cook-Torrance Specular BRDF
     * @param omega0 Outgoing (view) direction unit vector
     * @param omegai Incoming (light) direction unit vector
     * @param normal Surface normal unit vector
     * @returns 
     */
    private cookTerrance(omega0: Vec3, omegai: Vec3, normal: vec3) {
        const hSum: Vec3 = omegai.plus(normal);
        const halfway: Vec3 = hSum.scale(1/hSum.getNorm());
        const D: number = this.normalDistribution(normal, halfway);
        const F: number = this.selfShadowing();
        const G: number = this.fresnel();
        return D*F*G/(4*omega0.dot(normal)*omegai.dot(normal));
    }

    /**
     * Trowbridge-Reitz GGX
     * @param normal Surface normal unit vector
     * @param halfway Halfway vector (halfway between incoming and normal vectors)
     * @returns 
     */
    private normalDistribution(normal: Vec3, halfway: Vec3) : number {
        const denom = PI * (normal.dot(halfway)**2*(this.surfaceRoughness**2-1)+1)**2;
        return this.surfaceRoughness**2 / denom;
    }

    private selfShadowing(normal: Vec3, v: Vec3, l: Vec3) {
        const k = this.surfaceRoughness ** 2 / 2; // for IBL lighting
        return this.schlick(normal, v, k) * this.schlick(normal, v, k);
    }

    private fresnel(halfway: Vec3, v: Vec3, F0: number) {
        return F0 + (1 - F0) * (1 - halfway.dot(v))**5;
    }

    private schlick(normal: Vec3, v: Vec3, k: number) {
        const denom = normal.dot(v) * (1 - k) + k;
        return normal.dot(v).scale(1/denom);
    }
}