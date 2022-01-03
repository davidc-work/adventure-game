var _dialogueTransitionActive = false;

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
//var postUrl = (port == 3000) ? 'http://localhost:3000' : 'https://sleepy-peak-05201.herokuapp.com/';
var postUrl = window.location.protocol + '//' + window.location.host;

//var currentTown = decodeURI(window.location.href).split('/')[3];
var currentTown = gameData.currentTown;
var town = world.towns.find(t => t.name == currentTown);
if (town == undefined) window.location.href = '/';
document.getElementById('current-location').innerHTML = currentTown;

let currentNPC, currentNPCName, currentShop, currentShopOwner, travelTo;

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

function deleteCookie( name, path, domain ) {
    if( getCookie( name ) ) {
      document.cookie = name + "=" +
        ((path) ? ";path="+path:"")+
        ((domain)?";domain="+domain:"") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
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
        case 'logout':
            window.location.href = '/login';
            break;
    }
}

function handleOption(o) {
    if (o.pageRedirect) {
        var newHref = o.pageRedirect.replace(/([^:]\/)\/+/g, "$1");
        window.location.href = newHref;
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
            if (res.msg) writeLine(res.msg);
            if (res.action) {
                handleAction(res.action);
            }
        });
    }
    _dialogueTransitionActive = false;
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

function fadeInDialogue(elements, callback = undefined, i = 0) {
    if (i >= elements.length) return callback ? callback() : undefined;
    elements[i].style.animation = '0.5s text-in forwards';
    setTimeout(() => fadeInDialogue(elements, callback, i + 1), 50);
}

function writeDialogue(d) {
    if (d) dialoguePage = d;

    const dialogueOptions = {
        main: dialogueTree.main,
        conversation: currentNPC ? currentNPC.dialogueTree : undefined,
        shop: currentShop ? currentShop.dialogueTree : undefined,
        travel: travelTo ? dialogueTree.travel : undefined
    }
    var dia = dialogueOptions[currentPage][dialoguePage];
    
    var prompt = dia.prompt.slice();
    if (currentPage == 'conversation') prompt = currentNPC.name + ': ' + prompt;
    if (currentPage == 'shop') prompt = currentShop.owner.name + ': ' + prompt;
    writeLine(prompt, undefined, 'white');

    if (dia.autoredirect) {
        setTimeout(() => {
            dialoguePage = dia.autoredirect;
            writeDialogue();
        }, 1200);
        return ;
    }

    var responseBox = document.getElementsByClassName('response-box')[0];
    responseBox.innerHTML = '';
    dia.options.forEach(o => {
        var e = document.createElement('p');
        e.innerHTML = parseForVars(o.text);
        e.addEventListener('click', e => {
            if (_dialogueTransitionActive) return ;
            _dialogueTransitionActive = true;
            //if (o.redirect) responseBox.innerHTML = '';
            if (o.redirect || o.pageRedirect) {
                Array.from(responseBox.children).forEach(p => {
                    p.style.animation = '0.35s fade-out';
                    p.style.animationFillMode = 'forwards';
                });
            }
            writeLine(o.text, () => {
                setTimeout(() => handleOption(o), 300);
            });
        });
        responseBox.appendChild(e);
    });

    fadeInDialogue(Array.from(responseBox.children));

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

function writeLines(lines, callback = undefined, color = 'red', i = 0) {
    if (i >= lines.length) return callback();
    writeLine(lines[i], () => {
        writeLines(lines, callback, color, i + 1);
    }, color);
}

function scrollInText(e, fullText, wait = 15, callback = undefined) {
    var t = e.innerHTML;
    if (t != fullText) {
        e.innerHTML = fullText.slice(0, t.length + 1);
        setTimeout(() => scrollInText(e, fullText, wait, callback), wait);
    } else if (callback) callback();
}

function NPCIntroduction(callback) {
    let l = 'You begin a conversation with ' + currentNPCName + (currentNPC.shop ? ', who owns a shop in this town.' : '.');
    writeLines([l, currentNPC.introduction], callback, 'white');
}