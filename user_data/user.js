
class User {

    constructor(email, username, password, animalType) {
        this.email = email;
        this.username = username;
        this.password = password;
        this.animalType = animalType;
        this.dollars = 0;
        this.tickets = 0;
        this.littleBuddies = [];
        this.animal = new Animal(animalType);
        this.tops = [];
        this.bottoms = [];
        this.shoes = [];
        this.hats = [];
        this.glasses = [];
        this.accessories = [];
        this.danceMoves = [];
        this.level = 0;
    }

    constructor(id, email, username, password, dollars, tickets, littleBuddies, animal,
        tops, bottoms, shoes, hats, glasses, accessories, danceMoves, level
    ) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.password = password;
        this.animalType = animalType;
        this.dollars = dollars;
        this.tickets = tickets;
        this.littleBuddies = littleBuddies;
        this.animal = animal;
        this.tops = tops;
        this.bottoms = bottoms;
        this.shoes = shoes;
        this.hats = hats;
        this.glasses = glasses;
        this.accessories = accessories;
        this.danceMoves = danceMoves;
        this.level = level;
    }

}

export { User }