class Ellipsoid extends Shape3D {
    private a: number;
    private b: number;
    private c: number;
    private vertices: Array<Vec3>;
    private triangles: Array<Array<Vec3>>;

    public static createSphere(r: number, surfaceRoughness: number, diffuseCol: Color, spectralCol: Color = Color.WHITE, shininess: number = 0) {
        return new Ellipsoid(r, r, r, surfaceRoughness, diffuseCol, spectralCol, shininess);
    }
    
    public constructor(a: number, b: number, c: number, surfaceRoughness: number, diffuseCol: Color, spectralCol: Color = Color.WHITE, shininess: number = 0) {
        super(surfaceRoughness, diffuseCol, spectralCol, shininess);
        this.a = a;
        this.b = b;
        this.c = c;
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