const smsg = require('../helpers/smsg');
const { sendMenuButton } = require('../helpers/sendMenuButton');

async function handleMessage(client, chatUpdate, store) {
    try {
        let mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
        if (mek.key && mek.key.remoteJid === "status@broadcast") return;
        if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
        if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
        let m = smsg(client, mek, store);

        const body = m.message.conversation || m.message.imageMessage?.caption || m.message.videoMessage?.caption || m.message.extendedTextMessage?.text || '';
        const command = body.trim().split(' ')[0].slice(1).toLowerCase();
        const buttonId = m.message.buttonsResponseMessage?.selectedButtonId;

        if (command === 'menu') {
            await sendMenuButton(client, m.key.remoteJid);
        } else if (buttonId) {
            if (buttonId === 'id1') {
                await client.sendMessage(m.key.remoteJid, { text: 'You selected Option 1' });
            } else if (buttonId === 'id2') {
                await client.sendMessage(m.key.remoteJid, { text: 'You selected Option 2' });
            } else if (buttonId === 'id3') {
                await client.sendMessage(m.key.remoteJid, { text: 'You selected Option 3' });
            }
        }

        // Additional command handling can go here

        require("../../kalorize")(client, m, chatUpdate, store);
    } catch (err) {
        console.log(err);
    }
}

module.exports = { handleMessage };
