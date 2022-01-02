import NPC from "./npc.js";
import Shop from "./shop.js";
import townNames from './townNames.js';

const Town = function(world, takenNames, position) {
    this.world = Object.assign({}, world);
    this.world.towns = undefined;

    var x = Math.floor(Math.random() * (townNames.length - 1));
    let name;
    while (takenNames.includes(name = townNames.randomItem().trim())) ;
    this.name = name;
    var pop = 15 + x % 25;
    this.people = [];
    for (var i = 0; i < pop; i++) {
        var npc = new NPC(this);
        npc.townName = this.name;
        this.people.push(npc);
    }

    this.shops = [];
    var shopCount = 2 + Math.round((Math.random() / 10) * pop);
    var availableShopOwners = this.people.map(p => p);
    for (var i = 0; i < shopCount; i++) {
        var j = Math.floor(Math.random() * availableShopOwners.length);
        var owner = availableShopOwners[j];
        var shop = new Shop(owner);

        owner.shop = shop;
        this.shops.push(shop);
        availableShopOwners.splice(j, 1);
    }
    
    if (position) this.position = position;
    else {
        this.position = {
            x: Math.floor(200 + Math.random() * (this.world.width - 400)),
            y: Math.floor(200 + Math.random() * (this.world.height - 400))
        }
    }

    return this;
}

export default Town;