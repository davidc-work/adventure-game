function getCookie(name){
    return document.cookie.split(';').some(c => {
        return c.trim().startsWith(name + '=');
    });
}

if (!getCookie('sessionHash')) window.location.href = '/login';
else {
    
}