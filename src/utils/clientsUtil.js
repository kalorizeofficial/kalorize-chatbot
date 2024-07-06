// clientUtils.js
const { DisconnectReason } = require("@whiskeysockets/baileys");
const { sendMenu } = require("../helpers/menu");
const { color } = require("../helpers/color");

async function  handleConnectionClose(reason, startHisoka) {
    switch (reason) {
        case DisconnectReason.badSession:
            console.log(`Bad Session File, Please Delete Session and Scan Again`);
            process.exit();
        case DisconnectReason.connectionClosed:
            console.log("Connection closed, reconnecting....");
            await startHisoka();
            break;
        case DisconnectReason.connectionLost:
            console.log("Connection Lost from Server, reconnecting...");
            await startHisoka();
            break;
        case DisconnectReason.connectionReplaced:
            console.log("Connection Replaced, Another New Session Opened, Please Restart Bot");
            process.exit();
        case DisconnectReason.loggedOut:
            console.log(`Device Logged Out, Please Delete Folder Session Kalorize and Scan Again.`);
            process.exit();
        case DisconnectReason.restartRequired:
            console.log("Restart Required, Restarting...");
            await startHisoka();
            break;
        case DisconnectReason.timedOut:
            console.log("Connection TimedOut, Reconnecting...");
            await startHisoka();
            break;
        default:
            console.log(`Unknown DisconnectReason: ${reason}`);
            await startHisoka();
            break;
    }
}

async function handleConnectionOpen(client) {
    const botNumber = await client.decodeJid(client.user.id);
    console.log(color("Bot success connected to server", "green"));
    console.log(color("Type /menu to see menu"));
    await sendMenu(client, botNumber); // Memanggil sendMenu saat koneksi terbuka
}

module.exports = { handleConnectionClose, handleConnectionOpen };
