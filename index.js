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
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import AWS from 'aws-sdk';

function encrypt(text) {
    var cipher = crypto.createCipher('aes256', 'password');
    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(text) {
    var decipher = crypto.createDecipher('aes256', 'password');
    return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}

var aivonpeaamk = '2bc1429da10de25ab39ef4cd4887c1b996c903577fe69a0f88c54525306fa11a';
var ixiujewkssfdewu = 'daa135a85bbcf3df8db2446142bb53a0b0f1872aae1a3af98323cb66a05596deb4c57c87ed7ad1bd68002cb0b699a5a1';

var lkzojewmkl = decrypt(aivonpeaamk);
var iocjowmklew = decrypt(ixiujewkssfdewu);

let awsConfig = {
    region: 'us-east-1',
    endpoint: 'http://dynamodb.us-east-1.amazonaws.com',
    accessKeyId: lkzojewmkl,
    secretAccessKey: iocjowmklew
}
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

const defaultCharacter = {
    inventory: [],
    quests: [],
    stats: []
}

function hash(a) {
    return crypto.createHash('md5').update(a).digest('hex')
}

function sessionId() {
    return Math.random().toString(36).slice(2, 9);
}

function getAllAccounts(callback) {
    var params = {
        TableName: 'adventure_game_accounts'
    }

    docClient.scan(params, (err, data) => {
        if (err) console.error(err);
        return err ? callback(false) : callback(data);
    });
}

function getAccount(username, password) {
    if (!accounts) {
        console.error('Accounts undefined.');
        return false;
    }
    
    var acc = accounts.find(a => a.username == username);
    if (acc) {
        if (password) {
            return acc.password == password ? acc : undefined;
        } else return acc;
    } else return undefined;
}

let accounts;
getAllAccounts(data => {
    accounts = data ? data.Items : undefined;
    console.log(accounts);
});

var CUSTOMEPOCH = 1300000000000; // artificial epoch
function generateRowId(shardId /* range 0-64 for shard/slot */) {
  var ts = new Date().getTime() - CUSTOMEPOCH; // limit to recent
  var randid = Math.floor(Math.random() * 512);
  ts = (ts * 64);   // bit-shift << 6
  ts = ts + shardId;
  return (ts * 512) + randid;
}

function createAccount(accounts, username, password, callback) {
    if (!accounts) {
        callback(false);
        return console.error('Accounts undefined.');
    }
    
    var acc = getAccount(username);
    if (acc) {
        console.error('account exists');
        callback(false);
        return ;
    }
    
    password = hash(password);
    var input = {
        user_id: generateRowId(4),
        username: username,
        password: password,
        sessionId: sessionId()
    }

    var params = {
        TableName: 'adventure_game_accounts',
        Item: input
    }

    docClient.put(params, (err, data) => {
        if (err) {
            console.error(err);
            callback(false);
        }
        else {
            accounts.push({
                username: username,
                password: password,
                character: Object.assign({}, defaultCharacter)
            });
            callback(true);
        }
    });
}

const app = express();
const jsonParser = bodyParser.json();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

const __dirname = path.resolve();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

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
    return town.people.find(p => p.fullName == npcName);
}

function findShop(ownerName, townName) {
    const town = findTown(townName);
    if (town == undefined) return false;
    return town.shops.find(s => s.owner.fullName == ownerName);
}

/*function getAccount(req, res, redirect = true) {
    return redirect;
    var acc = findAccountFromHash(req.cookies.sessionHash);
    if (!acc && redirect) res.redirect('/login');
    else return acc;
}*/

function inAppHandler(req, res, next) {
    if (req.cookies.sessionId) {
        var acc = accounts.find(a => a.sessionId == req.cookies.sessionId);
        if (acc) {
            next();
            return ;
        }
    }
    res.redirect('/login');
}

function outsideAppHandler(req, res, next) {
    if (req.cookies.sessionId) {
        var acc = accounts.find(a => a.sessionId == req.cookies.sessionId);
        if (!acc) {
            next();
            return ;
        }
        res.redirect('/');
    }
    next();
}

app.get('/', inAppHandler, (req, res) => {
    res.render('startPage', game);
});

app.get('/signup', outsideAppHandler, (req, res) => {
    res.render('signup', game);
});

app.post("/signedup", outsideAppHandler, (req,res) => {
    const user = req.body.username;
    const password = req.body.password;
    createAccount(accounts, user, password, success => {
        if (success) {
            res.render('signedup', {
                user: user
            });
        } else {
            res.redirect('/signup');
        }
    });
});

app.get('/login', outsideAppHandler, (req, res) => {
    res.render('login', game);
});

app.post("/loggedin", outsideAppHandler, (req,res) => {
    const user = req.body.username;
    const password = req.body.password;
    const hashPassword = hash(password);
    var account = getAccount(user, hashPassword);
    if (account) {
        res.render('loggedin', {
            user: user,
            sessionId: account.sessionId
        });
    } else res.redirect('/login');

});

app.get('/map', inAppHandler, (req, res) => {
    if (gd.currentTown) res.render('map', game);
    else res.redirect('/');
});

app.get('/travel', (req, res) => res.redirect('/'));

app.get('/battle', (req, res) => res.redirect('/'));

app.get('/battle/:enemy', inAppHandler, (req, res) => {
    if (gd.currentTown && gd.travelToTown) {
        gd.inBattle = true;
        gd.currentEnemy = req.params.enemy;
        res.render('battle', game);
    } else res.redirect('/');
});

app.get('/travel/:town', inAppHandler, (req, res) => {
    if (gd.currentTown) {
        gd.travelToTown = req.params.town;
        res.render('travel', game);
    } else res.redirect('/');
});

app.get('/:town', inAppHandler, (req, res) => {
    var town = req.params.town;
    if (findTown(town) == undefined) {
        res.redirect('/');
    } else {
        gd.currentTown = town;
        res.render('town', game);
    }
});

app.get('/:town/talk', inAppHandler, (req, res) => res.redirect('/'));

app.get('/:town/talk/:npc', inAppHandler, (req, res) => {
    var townName = req.params.town, npcName = req.params.npc;
    if (findNPC(npcName, townName) == undefined) res.redirect('/');
    else {
        gd.currentTown = townName;
        res.render('conversation', game);
    }
});

app.get('/:town/shop/:owner', inAppHandler, (req, res) => {
    var townName = req.params.town, ownerName = req.params.owner;
    if (findShop(ownerName, townName) == undefined) res.redirect('/');
    else {
        gd.currentTown = townName;
        res.render('shop', game);
    }
});

app.post('/', jsonParser, (req, res) => {
    var acc = accounts.find(a => a.sessionId == req.cookies.sessionId);
    if (!acc) {
        res.redirect('/login');
        return ;
    }

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