// Base reflexivity values from https://learnopengl.com/PBR/Theory
const MaterialProperties = {
    Water: {
        baseReflexivity: Vec3.uniform(.15),
        surfaceRoughness: 
    },
    PLASTIC_LOW: {
        baseReflexivity: Vec3.uniform(.21),
        surfaceRoughness: 

    },
    GLASS_LOW: {
        baseReflexivity: Vec3.uniform(.24),
        surfaceRoughness: 
    },
    PLASTIC_HIGH: {
        baseReflexivity: Vec3.uniform(.24),
        surfaceRoughness: 
    },
    GLASS_HIGH: {
        baseReflexivity: Vec3.uniform(.31),
        surfaceRoughness: 
    },
    RUBY: {
        baseReflexivity: Vec3.uniform(.31),
        surfaceRoughness: 
    },
    DIAMOND: {
        baseReflexivity: Vec3.uniform(.45),
        surfaceRoughness: 
    },
    IRON: {
        baseReflexivity: new Vec3(.77, .78, .78),
        surfaceRoughness: 
    },
    COPPER: {
        baseReflexivity: new Vec3(.98, .82, .76),
        surfaceRoughness: 
    },
    GOLD: {
        baseReflexivity: new Vec3(1, .86, .57),
        surfaceRoughess: 
    },
    ALUMINUM: {
        baseReflexivity: new Vec3(.96, .96, .97),
        surfaceRoughness: 
    },
    SILVER: {
        baseReflexivity: new Vec3(.98, .97, .95),
        surfaceRoughness: 
    }
}