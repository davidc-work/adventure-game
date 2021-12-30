import NPC from "./npc.js";
import Shop from "./shop.js";
import townNames from './townNames.js';

const Town = function() {
    var x = Math.floor(Math.random() * (townNames.length - 1));
    this.name = townNames[x].trim();
    var pop = 20 + x % 20;
    this.people = [];
    for (var i = 0; i < pop; i++) {
        var npc = new NPC();
        this.people.push(npc);
    }

    this.shops = [];
    var shopCount = Math.round((Math.random() / 2) * pop);
    var availableShopOwners = this.people.map(p => p);
    for (var i = 0; i < shopCount; i++) {
        var j = Math.floor(Math.random() * availableShopOwners.length);
        var owner = availableShopOwners[j];
        var shop = new Shop(owner.name);

        owner.shop = shop;
        this.shops.push(shop);
        availableShopOwners.splice(j, 1);
    }

    return this;
}

export default Town;