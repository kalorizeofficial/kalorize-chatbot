// clientsUtil.js
const { DisconnectReason } = require("@whiskeysockets/baileys");

// Your existing code


async function handleConnectionClose(client, reason, startHisoka) {
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

function handleConnectionOpen(client) {
    console.log("Connection opened successfully!");
    // Lakukan inisialisasi tambahan atau tindakan lain yang diperlukan saat koneksi terbuka
}

module.exports = { handleConnectionClose, handleConnectionOpen };
