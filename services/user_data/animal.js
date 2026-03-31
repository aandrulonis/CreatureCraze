class Animal {
    
    static AnimalTypes  = {
        HORSE: "Horse",
        MOOSE: "Moose",
        LION: "Lion",
        TIGER: "Tiger",
        BROWN_BEAR: "Brown Bear",
        BOLAR_BEAR: "Polar Bear"
    };
    
    constructor(animalType) {
        this.animalType = animalType; 
        this.currTop = null;
        this.currBottom = null;
        this.currShoes = null;
        this.currHat = null;
        this.currGlasses = null;
    }

    constructor(id, animalType, currTop, currBottom, currShoes, currHat, currGlasses) {
        this.id = id;
        this.animalType = animalType;
        this.currTop = currTop;
        this.currBottom = currBottom;
        this.currShoes = currShoes;
        this.currHat = currHat;
        this.currGlasses = currGlasses;
    }

    
    dance() {
        
    }

    draw() {

    }
}

export { Animal }