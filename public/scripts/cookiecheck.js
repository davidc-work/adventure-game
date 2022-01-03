function getCookie(name){
    return document.cookie.split(';').some(c => {
        return c.trim().startsWith(name + '=');
    });
}
var endParam = window.location.href.split('/').slice(-1)[0];
var isAccountPage = ['login', 'signup', 'loggedin', 'signedup'].includes(endParam);

if (!getCookie('sessionHash')) {
    if (!isAccountPage) window.location.href = '/login';
}
else {
    if (isAccountPage) window.location.href = '/';
}