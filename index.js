Array.prototype.randomItem = function() {
    return this[Math.floor(Math.random() * this.length)];
}

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import Town from './town.js';
import World from './world.js';
import Quest from './quest.js';
import generateGameData from './generateGameData.js';

const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false});
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

const __dirname = path.resolve();
app.use(express.static(__dirname + '/public'));

var game = {
    gameData: generateGameData(port)
}

var gd = game.gameData;
var dt = gd.dialogueTree;

var randTown = gd.world.towns.randomItem();
var randNPC = randTown.people.randomItem();
randNPC.addDialogueOption('greetingDefault', {
    text: 'I need to talk to you about something...',
    redirect: 'npcFirstMeet0'
});
gd.eventVars.firstNPCMeet = randNPC.name;
gd.eventVars.firstNPCMeetTown = randTown.name;

function findTown(townName) {
    return gd.world.towns.find(t => t.name == townName);
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
    res.render('startPage', game);
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
    var cmd = req.body.data;
    switch(cmd.action) {
        case 'buyitem':
            var data = JSON.parse(cmd.data);
            if (data.value > gd.currentGold) {
                res.send({
                    success: false,
                    msg: 'Not enough gold to buy "' + data.name + '".'
                });
            } else {
                gd.currentGold -= data.value;
                gd.inventory.push({
                    name: data.name,
                    value: data.value,
                    type: data.type,
                    properties: data.properties
                });
                res.send({
                    success: true,
                    msg: 'Purchased "' + data.name + '" for ' + data.value + ' gold.'
                });
            }
            break;
        case 'addGold':
            var amount = cmd.data;
            gd.currentGold += parseInt(amount, 10);
            res.send({
                success: true,
                msg: 'Added ' + amount + ' gold.',
                action: {
                    action: 'addGold',
                    amount: amount
                }
            });
            break;
    }
});

app.listen(port, () => console.log('Started listening on port ' + port));