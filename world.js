import Town from "./town.js";

const World = function() {
    this.towns = [];
    this.width = 10000;
    this.height = 10000;
    this.padding = 500;
    var townCount = 15 + Math.round(Math.random() * 15);
    var positions = [];
    for (var i = 0; i < townCount; i++) {
        let minDist, position;
        while (minDist == undefined || position == undefined || minDist < 1000) {
            position = {
                x: Math.floor(this.padding + Math.random() * (this.width - this.padding * 2)),
                y: Math.floor(this.padding + Math.random() * (this.height - this.padding * 2))
            }
            minDist = positions.reduce((a, b) => {
                const dist = Math.hypot(b.x - position.x, b.y - position.y);
                if (a == undefined) return dist;
                return Math.min(dist, a);
            }, undefined);

            if (minDist == undefined) break;
        }
        positions.push(position);

        var town = new Town(this, this.towns.map(t => t.name), position);
        this.towns.push(town);
    }

    return this;
}

export default World;