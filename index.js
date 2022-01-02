Array.prototype.randomItem = function(dist) {
    if (dist == undefined) return this[Math.floor(Math.random() * this.length)];
    else {
        let rand = Math.random();
        for (var i = 0; i < this.length; i++) if (rand < (dist[i] || 1)) break;
        return this[i] || this[this.length - 1];
    }
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
var qt = gd.questTree;

var randTown = gd.world.towns.randomItem();
var randNPC = randTown.people.randomItem();
randNPC.addDialogueOption('greetingDefault', {
    text: 'I need to talk to you about something...',
    serverAction: {
        action: 'updateQuest',
        questId: 'gettingStarted',
        objective: {
            id: 'findFirstNPC',
            completed: true
        }
    },
    redirect: 'npcFirstMeet0'
});
gd.eventVars.firstNPCMeet = randNPC.name;
gd.eventVars.firstNPCMeetTown = randTown.name;

gd.currentQuests.push(new Quest(gd, 'gettingStarted', 1));
//gd.currentQuests[0].setObjectiveStatus('findFirstNPC', true);

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

function stringifiedGameData() {
    return {
        gameData: JSON.stringify(game.gameData, (key, val) => {
            if (typeof val == 'function') return val + '';
            return val;
        })
    }
}

app.get('/', (req, res) => {
    //res.redirect('/' + gd.eventVars.firstNPCMeetTown + '/talk/' + gd.eventVars.firstNPCMeet);
    res.render('startPage', game);
});

app.get('/map', (req, res) => {
    if (gd.currentTown) res.render('map', game);
    else res.redirect('/');
});

app.get('/:town', (req, res) => {
    var town = req.params.town;
    if (findTown(town) == undefined) {
        res.redirect('/');
    } else {
        gd.currentTown = town;
        res.render('town', game);
    }
});

app.get('/:town/talk', (req, res) => res.redirect('/'));

app.get('/:town/talk/:npc', (req, res) => {
    var townName = req.params.town, npcName = req.params.npc;
    if (findNPC(npcName, townName) == undefined) res.redirect('/');
    else {
        gd.currentTown = townName;
        res.render('conversation', game);
    }
});

app.get('/:town/shop/:owner', (req, res) => {
    var townName = req.params.town, ownerName = req.params.owner;
    if (findShop(ownerName, townName) == undefined) res.redirect('/');
    else {
        gd.currentTown = townName;
        res.render('shop', game);
    }
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
        case 'updateQuest':
            let quest = gd.currentQuests.find(q => q.questId == cmd.questId);
            if (!quest) return ;
            if (quest.setObjectiveStatus(cmd.objective.id, cmd.objective.completed).changed) {
                res.send({
                    success: true,
                    msg: 'Quest "' + quest.title + '" has been updated.'
                });
            }
            break;
    }
});

app.listen(port, () => console.log('Started listening on port ' + port));