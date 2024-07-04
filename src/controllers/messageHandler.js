const smsg = require('../helpers/smsg');

async function handleMessage(client, chatUpdate, store) {
    try {
        let mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
        if (mek.key && mek.key.remoteJid === "status@broadcast") return;
        if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
        if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
        let m = smsg(client, mek, store);
        require("../../kalorize")(client, m, chatUpdate, store);
    } catch (err) {
        console.log(err);
    }
}

module.exports = { handleMessage };
