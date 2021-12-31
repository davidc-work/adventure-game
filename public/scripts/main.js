Array.prototype.randomItem = function() {
    return this[Math.floor(Math.random() * this.length)];
}

function post(data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", postUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        data: data
    }));
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) callback(xhr.response);
    }
}

var { dialogueTree, world, currentGold, port } = gameData;
var postUrl = (port == 3000) ? 'http://localhost:3000' : 'https://sleepy-peak-05201.herokuapp.com/';

var currentTown = decodeURI(window.location.href).split('/')[3];
var town = world.towns.find(t => t.name == currentTown);
if (town == undefined) window.location.href = '/';
document.getElementById('current-location').innerHTML = currentTown;

let currentNPC, currentNPCName, currentShop, currentShopOwner;

function parseForVars(line) {
    const checks = [
        { delim: '%', loc: window },
        { delim: '@', loc: gameData.eventVars },
        { delim: '~', loc: gameData.synonyms, rand: true }
    ];
    checks.forEach(c => {
        var spl = line.split(c.delim);
        line = spl.map((w, i) => {
            if ((i - 1) % 2 != 0) return w;
            var word = (c.rand ? c.loc[w].randomItem() : c.loc[w]).toString();
            const last = spl[i - 1].trim();
            const cond1 = i == 1 && spl[0].trim() == '';
            const cond2 = ['.', '?', '!', ':'].includes(last[last.length - 1]);

            if (cond1 || cond2) word = word[0].toUpperCase() + word.slice(1); 
            return word;
        }).join('');
    });

    return line;
}

function handleAction(a) {
    switch(a.action) {
        case 'addGold':
            currentGold += parseInt(a.amount, 10);
            break;
        case 'displayText':
            writeLine(a.str, undefined, 'white');
            break;
        case 'displayMultipleTexts':
            a.lines.forEach(l => {
                writeLine(l, undefined, 'white');
            });
            break;
    }
}

function populateDialogueTree(tree, lists) {
    lists.forEach(l => {
        tree[l.branch].options = l.entity.map(a => ({
            text: l.text(a),
            redirect: l.redirect ? l.redirect(a) : undefined,
            pageRedirect: l.pageRedirect ? l.pageRedirect(a) : undefined,
            action: l.action ? l.action(a) : undefined
        })).concat(({
            text: 'Go Back.',
            redirect: 'inTown'
        }));
    });
}

function writeDialogue() {
    const dialogueOptions = {
        main: dialogueTree.main,
        conversation: currentNPC ? currentNPC.dialogueTree : undefined,
        shop: currentShop ? currentShop.dialogueTree : undefined
    }
    var dia = dialogueOptions[currentPage][dialoguePage];
    
    var prompt = dia.prompt.slice();
    if (currentPage == 'conversation') prompt = currentNPCName + ': ' + prompt;
    if (currentPage == 'shop') prompt = currentShopOwner + ': ' + prompt;
    writeLine(prompt, undefined, 'white');

    if (dia.autoredirect) {
        setTimeout(() => {
            dialoguePage = dia.autoredirect;
            writeDialogue();
        }, 500);
        return ;
    }

    var responseBox = document.getElementsByClassName('response-box')[0];
    responseBox.innerHTML = '';
    dia.options.forEach(o => {
        var e = document.createElement('p');
        e.innerHTML = parseForVars(o.text);
        e.addEventListener('click', e => {
            if (o.redirect) responseBox.innerHTML = '';
            writeLine(o.text, () => {
                setTimeout(() => {
                    if (o.pageRedirect) {
                        window.location.href = o.pageRedirect.replace(/([^:]\/)\/+/g, "$1");
                        return;
                    }
                    if (o.redirect) {
                        dialoguePage = o.redirect;
                        writeDialogue();
                    }
                    if (o.action) {
                        handleAction(o.action);
                    }
                    if (o.serverAction) {
                        post(o.serverAction, res => {
                            res = JSON.parse(res);
                            writeLine(res.msg);
                            if (res.action) {
                                handleAction(res.action);
                            }
                        });
                    }
                }, 300);
            });            
        });
        responseBox.appendChild(e);
    });

    var e = document.getElementsByClassName('dialogue-box')[0];
    e.scrollTop = e.scrollHeight;
}

function writeLine(l, callback = undefined, color = 'red') {
    var spl = l.split('\n');
    spl.forEach((line, i) => {
        var p = document.createElement('p');
        var e = document.getElementsByClassName('dialogue-box')[0];
        e.appendChild(p);
        e.scrollTop = e.scrollHeight + 24;
        scrollInText(p, parseForVars(line), 15, i == 0 ? callback : undefined);
        p.style.color = color;
    });
}

function scrollInText(e, fullText, wait = 15, callback = undefined) {
    var t = e.innerHTML;
    if (t != fullText) {
        e.innerHTML = fullText.slice(0, t.length + 1);
        setTimeout(() => scrollInText(e, fullText, wait, callback), wait);
    } else if (callback) callback();
}