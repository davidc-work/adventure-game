function scrollText(e, t, callback, delay = 40) {
    if (e.innerHTML.length == t.length) {
        callback();
        return;
    }

    e.innerHTML = t.slice(0, e.innerHTML.length + 1);
    setTimeout(() => scrollText(e, t, callback, delay), delay);
}

function text(t, callback) {
    var p = document.createElement('p');
    document.body.appendChild(p);
    scrollText(p, t, callback);
}

const townName = gameData.world.towns[0].name;
const texts = ['The following is the tale of a wandering adventurer.',
    'Far he traveled in the hopes of persuing his desire for fame and power.',
    'His journey begins in the town of ' + townName + '.',
    'What happens now?  You decide...'
];

function showAllTextsRecursive(delay, callback, i = 0) {
    if (i >= texts.length) {
        callback();
        return;
    }

    text(texts[i], () => {
        setTimeout(() => {
            var e = document.getElementsByTagName('p')[0];
            e.style.animation = '0.5s fade-out';
            e.style.animationFillMode = 'forwards';
            setTimeout(() => {
                e.remove();
                showAllTextsRecursive(delay, callback, i + 1);
            }, 700);            
        }, delay);
    })
}

function redirect() {
    var loc = window.location.href + '/' + townName;
    window.location.href = loc.replace(/([^:]\/)\/+/g, "$1");
}

showAllTextsRecursive(3000, () => {
    redirect();
});