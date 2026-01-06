/**author Mahesh sreenath V M
 * This is a utility written to remove the security issues with local storage
 * THis basically converts the user data into a encoded message and its split in to 3 different values
 * cookie sessionId authKey this is split up into three parts jus to make sure that event though attacker
 * gets the data fom the browser it will be hard to combine them to make the encoded message back in original form
 * Even though its not the most secured method but it will make sure that user who can access the browser console
 * will not be able to see the details and all the complications are coded here so that other developers
 * need not to worry about encoding mechanisms.
 * no third party libraries are used jus some basic browser encoding standards which is supported from IE10
*/

export function setIntoLocalStorage(details: JSON) {
    const user: string = encrypt(details);
    const splitLength: number = Math.round(user.length / 3);
    const sessionId = user.slice(0, splitLength);
    const cookie = user.slice(splitLength, (splitLength + splitLength));
    const authKey = user.slice((splitLength + splitLength), user.length);
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('cookie', cookie);
    localStorage.setItem('authKey', authKey);
}

export function getFromLocalStorage() {
    const sessionId = localStorage.getItem('sessionId');
    const cookie = localStorage.getItem('cookie');
    const authKey = localStorage.getItem('authKey');
    const user = sessionId + cookie + authKey;
    return  user ? JSON.parse(decrypt(user)) : null;
}

export function encrypt(details: JSON): string {
    const user = JSON.stringify(details);
    return window.btoa(unescape(encodeURIComponent(user)));
}

export function decrypt(details: string) {
    return decodeURIComponent(escape(window.atob(details)));
}
