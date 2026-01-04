const PI = Math.PI;

const outcomes = { 
    IN_PROGRESS: "In Progress",
    WON: "Won",
    LOST: "Lost"
};

const modes = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced"
};

const directions = {
    UP: "Top",
    DOWN: "Bottom",
    LEFT: "Left",
    RIGHT: "Right",
    NONE: "None"
};

class Color {
    static RED = new Color(255,0,0);
    static ORANGE = new Color(255, 165, 0);
    static YELLOW = new Color(255, 255, 0);
    static GREEN = new Color(0, 255, 0);
    static BLUE = new Color(0, 0, 255);
    static BLACK = new Color(0,0,0);
    static WHITE = new Color(255,255,255);

    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.str = null; // lazily initialized
        this.list = null; // lazily intialized
        this.normalizedList = null; // lazily initialized
    }
    static getRandom() {
        return new Color(Math.random()*150+50, Math.random()*150+50, Math.random()*150+50);
    }
    static invert(otherCol) {
        return new Color(255-otherCol.r, 255-otherCol.g, 255-otherCol.b);
    }
    getStr() {
        if (!this.str) this.str = `rgb(${this.r}, ${this.g}, ${this.b})`;
        return this.str;
    }
    getList() {
        if (!this.list) this.list = [this.r, this.g, this.b, this.a];
        return this.list;
    }
    getNormalizedList() {
        if (!this.normalizedList) this.normalizedList = [this.r / 255, this.g / 255, this.b / 255, this.a];
        return this.normalizedList;
    }
}

class Vec3 {
    static ORIGIN = new Vec3(0,0,0);
    static X_HAT = new Vec3(1,0,0);
    static Y_HAT = new Vec3(0,1,0);
    static Z_HAT = new Vec3(0,0,1);
    
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.list = null; // lazily initialized
        this.norm = Math.min; // lazily initialized
        this.unitVec = null; // lazily initialized
    }
    static uniform(num) {
        return new Vec3(num, num, num);
    }
    plus(other) {
        if (typeof(other) != typeof(this)) throw new Error("A 3D vector may only be added to another 3D vector.");
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
    minus(other) {
        if (typeof(other) != typeof(this)) throw new Error("A 3D vector may only be subtracted from another 3D vector.");
        return new Vec3(this.x-other.x, this.y-other.y, this.z-other.z);
    }
    scale(c) {
        return new Vec3(this.x*c, this.y*c, this.z*c);
    }
    getList() {
        if (!this.list) this.list = [this.x, this.y, this.z];
        return this.list;
    }
    getNorm() {
        if (this.norm == Math.min) this.norm = Math.sqrt(this.x**2 + this.y**2 + this.z**2);
        return this.norm;
    }
    getUnitVec() {
        this.getNorm();
        if (this.norm == 0) throw new Error("Cannot find unit vector of zero vector");
        return this.scale(1/this.norm);
    }
    dot(other) {
        if (typeof(other) != typeof(this)) throw new Error("A 3D vector may be dotted with another 3D vector.");
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }
    cosine(other) {
        if (typeof(other) != typeof(this)) throw new Error("A 3D vector may be dotted with another 3D vector.");
        return this.dot(other) / (this.getNorm() * other.getNorm());
    }
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.list = []; // lazily initialized
    }
    rotate(theta) {
        return new Vec2(this.x * Math.cos(theta) - this.y * Math.sin(theta),
                        this.x * Math.sin(theta) + this.y * Math.cos(theta));
    }
    getList() {
        if (!this.list.length) this.list = [this.x, this.y];
        return this.list;
    }
    increment(dx, dy) {
        return new Vec2(this.x + dx, this.y + dy);
    }
    negate() {
        return new Vec2(-this.x, -this.y);
    }
}

class RectangularDomain {
    constructor(minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }
    inDomain(x, y) {
        return x > this.minX && x < this.maxX
               && y > this.minY && y < this.maxY;
    }
}

class LightSource {
    constructor(color, position, intensity) {
        this.color = color; // Color
        this.position = position; // Vec3
        this.intensity = intensity; // double in range [0, 1]
    }
}

export { PI, outcomes, modes, directions, Color, Vec2, Vec3, RectangularDomain, LightSource };