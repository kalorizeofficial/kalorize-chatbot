// Import the jidDecode function from the appropriate library
const { jidDecode } = require('@whiskeysockets/baileys');

/**
 * Decodes a JID (Jabber ID) used in WhatsApp.
 * @param {string} jid - The JID to decode.
 * @returns {string} The decoded JID or the original JID if it couldn't be decoded.
 */
function decodeJid(jid) {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else {
        return jid;
    }
}

module.exports = decodeJid;