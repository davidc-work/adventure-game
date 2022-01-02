import Item from './item.js';

Array.prototype.randomItem = function() {
    return this[Math.floor(Math.random() * this.length)];
}

const Shop = function(owner = undefined, level = 1) {
    this.owner = owner ? Object.assign({}, owner) : undefined;
    
    this.level = level;
    
    this.generateItems();

    this.generateDialogue();

    return this;
}

Shop.prototype.generateDialogue = function() {
    this.dialogueTree = {
        main: {
            prompt: 'Welcome to my shop!  Feel free to have a look around.',
            options: [{
                    text: 'Browse items.',
                    redirect: 'browse'
                }, {
                    text: 'Leave',
                    pageRedirect: '../'
                }
            ]
        },
        browse: {
            prompt: 'Sure thing!  What would you like to look at?',
            options: [{
                    text: 'Browse weapons.',
                    redirect: 'browseWeapons'
                }, {
                    text: 'Browse potions.',
                    redirect: 'browsePotions'
                }, {
                    text: 'Nevermind.',
                    redirect: 'main'
                }
            ]
        },
        browseWeapons: {
            prompt: `These are my finest weapons!  Take a look for yourself!`,
            options: this.items.filter(i => i.type == 'weapon').map(i => {
                return {
                    text: 'Buy ' + i.name + ' - ' + i.value + ' gold (' + 
                        i.properties.damage + ' damage)',
                    serverAction: {
                        action: 'buyitem',
                        data: JSON.stringify(i)
                    }
                }
            }).concat({
                text: 'Go Back',
                redirect: 'main'
            })
        },
        browsePotions: {
            prompt: `Like any of these potions?  Feel free to pick them out!`,
            options: this.items.filter(i => i.type == 'potion').map(i => {
                return {
                    text: 'Buy ' + i.name + ' - ' + i.value + ' gold',
                    serverAction: {
                        action: 'buyitem',
                        data: JSON.stringify(i)
                    }
                }
            }).concat({
                text: 'Go Back',
                redirect: 'main'
            })
        }
    }
}

Shop.prototype.potions = [{
        name: 'Healing',
        effect: 'restoreHealth',
        valueMultiplier: 1,
        baseIntensity: 10
    }, {
        name: 'Agility',
        effect: 'buffSpeed',
        valueMultiplier: 0.8,
        baseIntensity: 1
    }, {
        name: 'Defense',
        effect: 'buffDefense',
        valueMultiplier: 1,
        baseIntensity: 1
    }, {
        name: 'Destruction',
        effect: 'buffAttack',
        valueMultiplier: 1,
        baseIntensity: 1
    }
];

Shop.prototype.potionPowerTitles = ['Miniscule', '', 'Greater', 'Large', 'Ultimate'];

Shop.prototype.weapons = [{
        name: 'Short Sword',        
        valueMultiplier: 0.7,
        basePower: 5
    }, {
        name: 'Long Sword',
        valueMultiplier: 1,
        basePower: 10
    }, {
        name: 'Bow',
        valueMultiplier: 1.1,
        basePower: 8
    }, {
        name: 'Spear',
        valueMultiplier: 1.1,
        basePower: 9
    }
];

Shop.prototype.weaponModifiers = [
    ['Incredible', 'Destructive', 'Massive', 'Powerful', 'Holy', 'Dark', 'Cursed', 'Decent', 'Sharpened', 'Expert', 'Professional'],
    ['Fury', 'Decisionmaking', 'Power', 'Deception', 'Attonement', 'Whispers', 'Catastrophe', 'Prime', 'Singing', 'Slicing', 'Bludgeoning', 'Piercing']
];

Shop.prototype.weaponElementals = [
    {name: 'Flaming', effect: 'burn'},
    {name: 'Icey', effect: 'freeze'},
    {name: 'Caustic', effect: 'poison'}
];

Shop.prototype.generateItems = function() {
    //const baseWeapons = ['Short Sword', 'Long Sword', 'Bow', 'Mace', 'Club', 'Shield', 'Spear'];

    //const basePotions = ['Healing', 'Agility', 'Defense', 'Dexterity', 'Curse', 'Destruction', 'Enchanting'];
    this.items = [];
    var itemCount = 5 + Math.round(Math.random() * 7);

    for (var i = 0; i < itemCount; i++) {
        let name, value, type, properties = {};
        const randMulti = Math.random() / 20 - 0.1;
        if (Math.random() < 0.3) { //potions
            type = 'potion';
            const power = Math.floor(Math.random() * this.potionPowerTitles.length);
            const powerTitle = this.potionPowerTitles[power];

            const potion = this.potions.randomItem();
            name = 'Potion of ' + potion.name;
            if (powerTitle != '') name = powerTitle + ' ' + name;
            const multi = 1 + this.level / 10 + randMulti + power / 30;
            var intensity = Math.floor(potion.baseIntensity * multi);
            value = Math.floor(10 * multi * potion.valueMultiplier);
            properties[potion.effect] = intensity;
        } else { //weapons
            type = 'weapon';
            const weapon = this.weapons.randomItem();

            const multi = 1 + this.level / 10 + randMulti;
            properties.damage = parseInt((weapon.basePower * multi).toFixed(2), 10);

            name = (Math.random() < 0.7) ? weapon.name + ' of ' + this.weaponModifiers[0].randomItem() + ' ' + this.weaponModifiers[1].randomItem() : weapon.name;
            var elementalMultiplier = 1;
            if (Math.random() < 0.5) {
                const elemental = this.weaponElementals.randomItem();
                name = elemental.name + ' ' + name;
                properties[elemental.effect] = true;
                elementalMultiplier = 1.3;
            }
            
            value = Math.floor(10 * multi * weapon.valueMultiplier * elementalMultiplier);
        }
        this.items.push(new Item(name, value, type, properties));
    }
}

export default Shop;