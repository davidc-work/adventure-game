import Item from './item.js';

Array.prototype.randomItem = function() {
    return this[Math.floor(Math.random() * this.length)];
}

const Shop = function(owner = undefined) {
    this.generateItems();
    this.owner = owner;

    this.generateDialogue();

    return this;
}

Shop.prototype.generateDialogue = function() {
    this.dialogueTree = {
        main: {
            prompt: 'Welcome to my shop!  Feel free to have a look around.',
            options: [
                {
                    text: 'Browse items.',
                    redirect: 'browse'
                },
                {
                    text: 'Leave',
                    pageRedirect: '../'
                }
            ]
        },
        browse: {
            prompt: `Here's what I got!`,
            options: this.items.map(i => ({
                text: 'Buy ' + i.name + ' (' + i.value + ')',
                serverAction: {
                    action: 'buyitem',
                    data: JSON.stringify(i)
                }
            })).concat({
                text: 'Go Back',
                redirect: 'main'
            })
        }
    }
}

Shop.prototype.generateItems = function() {
    const baseWeapons = ['Short Sword', 'Long Sword', 'Bow', 'Mace', 'Club', 'Shield', 'Spear'];
    const weaponModifier1 = ['Incredible', 'Destructive', 'Massive', 'Powerful', 'Holy', 'Dark', 'Firey', 'Icey', 'Cursed', 'Decent', 'Sharpened', 'Expert', 'Professional'];
    const weaponModifier2 = ['Fury', 'Decisionmaking', 'Power', 'Deception', 'Attonement', 'Whispers', 'Flames', 'Ice', 'Catastrophe', 'Prime', 'Singing', 'Slicing', 'Bludgeoning', 'Piercing'];

    const basePotions = ['Healing', 'Agility', 'Defense', 'Dexterity', 'Curse', 'Destruction', 'Enchanting'];
    this.items = [];
    var itemCount = 7 + Math.floor(Math.random() * 5);

    for (var i = 0; i < itemCount; i++) {
        let name, value, type, properties; 
        if (Math.random() < 0.3) {
            const power = ['', 'Miniscule', 'Greater', 'Large', 'Ultimate'].randomItem();
            name = 'Potion of ' + basePotions.randomItem();
            if (power != '') name = power + ' ' + name;
            value = 10 + Math.floor(Math.random() * 90);
            type = 'potion';
            properties = {
                restoreHealth: 10
            }
        } else {
            let w = baseWeapons.randomItem();
            name = (Math.random() < 0.7) ? w + ' of ' + weaponModifier1.randomItem() + ' ' + weaponModifier2.randomItem() : w;
            value = 10 + Math.floor(Math.random() * 90);
            type = 'weapon';
            properties = {
                damage: 20
            }
        }

        this.items.push(new Item(name, value, type, properties));
    }
}

export default Shop;