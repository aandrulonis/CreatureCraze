class LittleBuddy {
    littleBuddyTypes = ['mouse', 'dog', 'cat', 'rabbit'];
    constructor(color) {
        this.buddyType = littleBuddyTypes[Math.floor(Math.random()*littleBuddyTypes.length)];
        this.color = color;
        this.accessories = [];
        this.name = null;
    }

    setName(name) {
        this.name = name;
    }

}