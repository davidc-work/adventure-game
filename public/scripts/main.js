var { dialogueTree, world, currentGold, port } = gameData;
var currentTown = decodeURI(window.location.href).split('/')[3];
console.log(port);
var postUrl = (port == 3000) ? 'http://localhost:3000' : 'https://sleepy-peak-05201.herokuapp.com/';

var town = world.towns.find(t => t.name == currentTown);
if (town == undefined) window.location.href = '/';

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

let currentNPC, currentNPCName;
if (currentPage == 'conversation') {
    currentNPCName = window.location.href.split('/')[5];
    currentNPC = town.people.find(p => p.name == currentNPCName);
}

let currentShop, currentShopOwner;
if (currentPage == 'shop') {
    currentShopOwner = window.location.href.split('/')[5];
    currentShop = town.shops.find(s => s.owner == currentShopOwner);
}

if (currentPage == 'main') {
    dialogueTree.main.viewNPCS.options = town.people.map(p => ({
        text: 'Talk to ' + p.name,
        pageRedirect: window.location.href + '/talk/' + p.name
    }));
    dialogueTree.main.viewNPCS.options.push({
        text: 'Go Back',
        redirect: 'inTown'
    });

    dialogueTree.main.viewShops.options = town.shops.map(s => ({
        text: 'Go to ' + s.owner + "'s shop.",
        pageRedirect: window.location.href + '/shop/' + s.owner
    }));
    dialogueTree.main.viewShops.options.push({
        text: 'Go Back',
        redirect: 'inTown'
    });
}

function parseForVars(line) {
    var spl = line.split('%');
    return spl.map((w, i) => ((i - 1) % 2 == 0) ? window[w] : w).join('');
}

function writeDialogue() {
    const dialogueOptions = {
        main: dialogueTree.main,
        conversation: currentNPC ? currentNPC.dialogueTree : undefined,
        shop: currentShop ? currentShop.dialogueTree : undefined
    }
    console.log(dialogueOptions, currentShop);
    var dia = dialogueOptions[currentPage][dialoguePage];
    
    var prompt = dia.prompt;
    if (typeof prompt == 'function') prompt = prompt();
    var spl = prompt.split('\n');
    spl.forEach(l => {
        var p = document.createElement('p');
        document.getElementsByClassName('dialogue-box')[0].appendChild(p);
        let str = parseForVars(l);
        if (currentPage == 'conversation') str = currentNPCName + ': ' + str;
        if (currentPage == 'shop') str = currentShopOwner + ': ' + str;
        scrollInText(p, str);
    });

    if (dia.autoredirect) {
        dialoguePage = dia.autoredirect;
        return writeDialogue();
    }

    var responseBox = document.getElementsByClassName('response-box')[0];
    responseBox.innerHTML = '';
    dia.options.forEach(o => {
        var e = document.createElement('p');
        e.innerHTML = o.text;
        e.addEventListener('click', e => {
            writePlayerLine(o.text);
            if (o.pageRedirect) {
                window.location.href = o.pageRedirect.replace(/([^:]\/)\/+/g, "$1");;
                return;
            }
            if (o.redirect) {
                dialoguePage = o.redirect;
                writeDialogue();
            }
            if (o.action) {
                post(o.action, res => {
                    res = JSON.parse(res);
                    writePlayerLine(res.msg);
                    if (res.action) {
                        var cmd = res.action.split(' ');
                        switch(cmd[0]) {
                            case 'addGold':
                                currentGold += parseInt(cmd[1], 10);
                                break;
                        }
                    }
                });
                /*var spl = o.action.split(' ');
                if (spl[0] == 'buyitem') {
                    var name = spl[1];
                    var price = spl[2];
                    post(o.action, res => {
                        res = JSON.parse(res);
                        console.log(res);
                        writePlayerLine(res.msg);
                    });
                }*/
            }
        });
        responseBox.appendChild(e);
    });

    var e = document.getElementsByClassName('dialogue-box')[0];
    e.scrollTop = e.scrollHeight;
}

function writePlayerLine(l) {
    var p = document.createElement('p');
    var e = document.getElementsByClassName('dialogue-box')[0];
    e.appendChild(p);
    e.scrollTop = e.scrollHeight + 24;
    scrollInText(p, l);
    p.style.color = 'red';
}

function scrollInText(e, fullText, wait = 15) {
    var t = e.innerHTML;
    if (t != fullText) {
        e.innerHTML = fullText.slice(0, t.length + 1);
        setTimeout(() => scrollInText(e, fullText, wait), wait);
    }
}