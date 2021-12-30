Array.prototype.randomItem = function() {
    return this[Math.floor(Math.random() * this.length)];
}

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import Town from './town.js';

const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false});
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

const __dirname = path.resolve();
app.use(express.static(__dirname + '/public'));

function World() {
    this.towns = [];
    var townCount = 15 + Math.round(Math.random() * 15);
    for (var i = 0; i < townCount; i++) {
        var town = new Town();
        this.towns.push(town);
    }

    return this;
}

var game = {
    gameData: {
        port: port,
        world: new World(),
        currentGold: 1000,
        inventory: [{
            name: 'Short Sword',
            price: 5
        }],
        dialogueTree: {
            main: {
                inTown: {
                    prompt: 'You are currently in the town of %currentTown%.',
                    options: [
                        {
                            text: 'View my stats',
                            redirect: 'viewStats'
                        },
                        {
                            text: 'View my inventory',
                            redirect: 'viewInventory'
                        },
                        {
                            text: 'Talk to someone.',
                            redirect: 'viewNPCS'
                        },
                        {
                            text: 'Visit shops.',
                            redirect: 'viewShops'
                        },
                        /*{
                            text: 'View homes.',
                            redirect: 'viewHomes'
                        },*/
                        {
                            text: 'Visit another town.',
                            redirect: 'viewTowns'
                        }
                    ]
                },
                viewStats: {
                    prompt: 'Your stats:\n Gold: %currentGold%',
                    autoredirect: 'inTown'
                },
                viewInventory: {
                    prompt: 'Your inventory:',
                    options: []
                },
                viewNPCS: {
                    prompt: 'List of NPCS:',
                    options: []
                },
                viewShops: {
                    prompt: 'List of shops:',
                    options: []
                },
                viewTowns: {
                    prompt: 'Visit another town:',
                    options: []
                }
            }
        }
    }
}

game.gameData.dialogueTree.main.viewTowns.options = game.gameData.world.towns.map(t => ({
    text: 'Visit ' + t.name,
    pageRedirect: '/' + t.name
}));
game.gameData.dialogueTree.main.viewTowns.options.push({
    text: 'Go Back',
    redirect: 'inTown'
});

function refreshInventoryList() {
    game.gameData.dialogueTree.main.viewInventory.options = game.gameData.inventory.map(i => ({
        text: i.name + ' (' + i.price + ')'
    }));
    game.gameData.dialogueTree.main.viewInventory.options.push({
        text: 'Go Back',
        redirect: 'inTown'
    });
}

refreshInventoryList();

function findTown(townName) {
    return game.gameData.world.towns.find(t => t.name == townName);
}

function findNPC(npcName, townName) {
    const town = findTown(townName);
    if (town == undefined) return false;
    return town.people.find(p => p.name == npcName);
}

function findShop(ownerName, townName) {
    const town = findTown(townName);
    if (town == undefined) return false;
    return town.shops.find(s => s.owner == ownerName);
}

app.get('/', (req, res) => {
    res.redirect('/' + game.gameData.world.towns[0].name);
});

app.get('/:town', (req, res) => {
    var town = req.params.town;
    if (findTown(town) == undefined) {
        res.redirect('/');
    }
    
    res.render('town', game);
});

app.get('/:town/talk', (req, res) => res.redirect('/'));

app.get('/:town/talk/:npc', (req, res) => {
    var townName = req.params.town, npcName = req.params.npc;
    if (findNPC(npcName, townName) == undefined) res.redirect('/');
    
    res.render('conversation', game);
});

app.get('/:town/shop/:owner', (req, res) => {
    var townName = req.params.town, ownerName = req.params.owner;
    if (findShop(ownerName, townName) == undefined) res.redirect('/');

    res.render('shop', game);
});

app.post('/', jsonParser, (req, res) => {
    var cmd = req.body.data.split(' ');
    switch(cmd[0]) {
        case 'buyitem':
            var name = cmd[1].replaceAll('_', ' ');
            var price = cmd[2];
            if (price > game.gameData.currentGold) {
                res.send({
                    success: false,
                    msg: 'Not enough gold to buy "' + name + '".'
                });
            } else {
                game.gameData.currentGold -= price;
                game.gameData.inventory.push({
                    name: name,
                    price: price
                });
                refreshInventoryList();
                res.send({
                    success: true,
                    msg: 'Purchased "' + name + '" for ' + price + ' gold.'
                });
            }
            break;
    }
});

app.listen(port, () => console.log('Started listening on port ' + port));