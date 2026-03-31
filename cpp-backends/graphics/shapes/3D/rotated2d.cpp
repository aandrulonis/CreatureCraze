class Cone extends Shape3D {
    private r: number;
    private h: number;
    private vertices: Array<Vec3>;
    private triangles: Array<Array<Vec3>>;

    public constructor(r: number, h: number, surfaceRoughness: number, diffuseCol: Color, spectralCol: Color = Color.WHITE, shininess: number = 0) {
        super(surfaceRoughness, diffuseCol, spectralCol, shininess);
        this.r = r;
        this.h = h;
        this.vertices = []; // lazily initialized
    }

    public override triangulate(res: number) : void {

    }
    
    public override getTriangles() : Array<Vec3> {
        if (!this.vertices.length) throw new Error("Ellipsoid must be triangulated before accessing triangles");
        return this.triangles;
    }

    protected override getGradient(x: number, y: number, z: number) {
        return new Vec3(2*x/this.a**2,2*y/this.b**2,2*z/this.c**2);
    }

    protected override getVertices() : Array<Vec3> {
        if (!this.vertices.length) throw new Error("Ellipsoid must be triangulated before accessing vertices");
        return this.vertices;
    }

}