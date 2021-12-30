import Town from "./town.js";

const World = function() {
    this.towns = [];
    var townCount = 15 + Math.round(Math.random() * 15);
    for (var i = 0; i < townCount; i++) {
        var town = new Town();
        this.towns.push(town);
    }

    return this;
}

export default World;