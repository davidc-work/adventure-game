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
                text: 'Buy ' + i.name + ' (' + i.price + ')',
                action: 'buyitem ' + i.name.replaceAll(' ', '_') + ' ' + i.price
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
        if (Math.random() < 0.3) {
            this.items.push({
                name: 'Potion of ' + basePotions.randomItem(),
                price: 10 + Math.floor(Math.random() * 90)
            });
        } else {
            let w = baseWeapons.randomItem();
            this.items.push({
                name: (Math.random() < 0.7) ? w + ' of ' + weaponModifier1.randomItem() + ' ' + weaponModifier2.randomItem() : w,
                price: 10 + Math.floor(Math.random() * 90)
            });
        }
    }
}

export default Shop;