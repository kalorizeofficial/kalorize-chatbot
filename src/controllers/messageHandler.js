const { sendMenu } = require("../helpers/menu");
const kalorize = require("../services/kalorizeService");

async function handleMessage(client, chatUpdate, store) {
    try {
        const message = chatUpdate.messages[0];
        if (!message.message) return;
        const { conversation } = message.message;
        if (!conversation) return;
        
        const command = conversation.trim();
        const botNumber = await client.decodeJid(client.user.id);

        if (command === 'menu') {
            await sendMenu(client, message.key.remoteJid);
        } else {
            const selectedOption = parseInt(command);
            switch (selectedOption) {
                case 1:
                    await client.sendMessage(message.key.remoteJid, { text: "Anda memilih Rekomendasi Makanan." });
                    kalorize(client, message, chatUpdate, "1");
                    break;
                case 2:
                    await client.sendMessage(message.key.remoteJid, { text: "Anda memilih Upload Data CSV." });
                    kalorize(client, message, chatUpdate, "2");
                    break;
                case 3:
                    await client.sendMessage(message.key.remoteJid, { text: "Anda memilih Minta data template CSV." });
                    kalorize(client, message, chatUpdate, "3");
                    break;
                default:
                    await sendMenu(client, message.key.remoteJid);
                    break;
            }
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = { handleMessage };
