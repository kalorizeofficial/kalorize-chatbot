const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

const sessionName = "kalorize";

async function getAuthState() {
    return await useMultiFileAuthState(`./${sessionName ? sessionName : "session"}`);
}

module.exports = { getAuthState };