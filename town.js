import NPC from "./npc.js";
import Shop from "./shop.js";
import townNames from './townNames.js';
import { nameByRace } from 'fantasy-name-generator';

const _maxChildren = 4;

function newMember(member) {
    return {
        name: member,
        children: []
    }
}

function placeMemberInTree(member, tree) {
    let m = newMember(member);
    if (!tree.length) return [m];

    var pointer = tree;
    var c = 0.9;
    while (Math.random() < c) {
        if (pointer == tree) pointer = tree.randomItem();
        else {
            pointer = pointer.children;
            if (pointer.length) {
                pointer = pointer.randomItem();
            }
            else {
                pointer.push(m);
                return tree;
            }
        }

        if (Math.random() < 0.75 && !pointer.spouse) {
            pointer.spouse = m;
            m.children = pointer.children;
            return tree;
        }

        c  *= 0.75;
    }

    if (pointer.children) pointer.children.push(m);
    else pointer.push(m);

    return tree;
}

function randomFamilyTree(members, prevLayer) {
    var tree = [];
    while(members.length) {
        var rand = Math.floor(Math.random() * members.length);
        var member = members[rand];
        members.splice(rand, 1);
        tree = placeMemberInTree(member, tree.slice());
    }

    return tree;
}

function assignFromFamilyTree(member, familyName, parents, siblings, npcs) {
    var npc = npcs.find(p => p.fullName == member.name + ' ' + familyName);
    let spouseNPC;
    if (parents) {
        npc.parents = parents;
    }
    if (siblings) npc.siblings = siblings.filter(s => s != member.name).map(s => s + ' ' + familyName);
    var parentalGroup = [member.name + ' ' + familyName];
    if (member.spouse) {
        npc.spouse = member.spouse.name + ' ' + familyName;
        parentalGroup.push(npc.spouse);

        spouseNPC = npcs.find(p => p.fullName == npc.spouse);
        spouseNPC.spouse = member.name + ' ' + familyName;
    }
    
    if (member.children.length) {
        npc.children = [];
        if (spouseNPC) spouseNPC.children = [];
        
        var sib = member.children.map(s => s.name);
        member.children.forEach(c => {
            npc.children.push(c.name + ' ' + familyName);
            if (spouseNPC) spouseNPC.children.push(c.name + ' ' + familyName);
            assignFromFamilyTree(c, familyName, parentalGroup, sib, npcs);
        });
    }
}

function Town (world, takenNames, position) {
    this.world = Object.assign({}, world);
    this.world.towns = undefined;

    var x = Math.floor(Math.random() * (townNames.length - 1));
    let name;
    while (takenNames.includes(name = townNames.randomItem().trim())) ;
    this.name = name;
    var pop = 15 + x % 25;
    this.population = pop;

    this.familyCount = 1 + Math.floor(pop / 18 + Math.random() * pop / 10);
    this.families = [];
    for (var i = 0; i < this.familyCount; i++) {
        this.families.push({
            name: nameByRace('human'),
            members: []
        });
    }

    this.people = [];
    for (var i = 0; i < pop; i++) {
        var family = this.families.randomItem();
        var npc = new NPC(this, family);
        family.members.push(npc.name);

        this.people.push(npc);
    }

    this.families.forEach(f => {
        f.tree = randomFamilyTree(f.members.slice());
        f.tree.forEach(p => assignFromFamilyTree(p, f.name, undefined, undefined, this.people));
    });

    this.people.forEach(p => {
        p.generateSecondary();
    });

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

    this.age = 100 + Math.floor(Math.random() * 450);
    this.sizeMeters = Math.floor(13 * pop * (1.75 + Math.random())); //517 - 1278 square meters per person
    this.sizeSquareMeters = this.sizeMeters ** 2;

    this.generateHistory();

    return this;
}

Town.prototype.generateHistory = function() {
    this.history = [];
    const types = ['rivalry', 'birth', 'death', 'murder', ]
}

function HistoricalEvent(type, year, data) {
    this.type = type;
    this.year = year;
    this.data = data;

    return this;
}

export default Town;