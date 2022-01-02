import Town from "./town.js";

const World = function() {
    this.towns = [];
    this.width = 10000;
    this.height = 10000;
    var townCount = 15 + Math.round(Math.random() * 15);
    for (var i = 0; i < townCount; i++) {
        var town = new Town(this, this.towns.map(t => t.name));
        this.towns.push(town);
    }

    return this;
}

export default World;