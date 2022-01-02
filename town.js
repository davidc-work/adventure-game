import NPC from "./npc.js";
import Shop from "./shop.js";
import townNames from './townNames.js';

const Town = function(world, takenNames) {
    this.worldWidth = world.width;
    this.worldHeight = world.height;
    var x = Math.floor(Math.random() * (townNames.length - 1));
    let name;
    while (takenNames.includes(name = townNames.randomItem().trim())) ;
    this.name = name;
    var pop = 15 + x % 25;
    this.people = [];
    for (var i = 0; i < pop; i++) {
        var npc = new NPC();
        npc.townName = this.name;
        this.people.push(npc);
    }

    this.shops = [];
    var shopCount = 2 + Math.round((Math.random() / 10) * pop);
    var availableShopOwners = this.people.map(p => p);
    for (var i = 0; i < shopCount; i++) {
        var j = Math.floor(Math.random() * availableShopOwners.length);
        var owner = availableShopOwners[j];
        var shop = new Shop(owner.name);

        owner.shop = shop;
        this.shops.push(shop);
        availableShopOwners.splice(j, 1);
    }

    this.position = {
        x: Math.floor(Math.random() * this.worldWidth),
        y: Math.floor(Math.random() * this.worldHeight)
    }

    return this;
}

export default Town;