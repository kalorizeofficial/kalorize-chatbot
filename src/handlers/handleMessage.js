const chalk = require('chalk');
const util = require('util');
const color = require('../helpers/color');
const getMessageBody = require('../helpers/getMessageBody');
const { requestFileUpload, handleFileUpload } = require('../services/uploadXlsx');

const uploadStates = {}; // In-memory state to track file upload status

async function handleMessage(client, simplifiedMsg) {
    try {
        if (simplifiedMsg.mtype === "viewOnceMessageV2") return;

        const { body, prefix, isCmd, command, args } = parseMessageContent(simplifiedMsg);
        const { pushname, sender, isGroup, groupMetadata, groupName } = await getMessageContext(client, simplifiedMsg);

        logReceivedCommand(isCmd, isGroup, sender, pushname, groupName, body);
        const { message, key, id } = simplifiedMsg;
        const messageType = Object.keys(message)[0];

        console.log('Message object:', JSON.stringify(simplifiedMsg, null, 2));
        if (isCmd) {
            switch (command) {
                case "help":
                case "menu":
                case "start":
                case "info":
                    await replyWithMenu(client, simplifiedMsg, prefix);
                    break;
                case "upload":
                    uploadStates[sender] = true;
                    await requestFileUpload(client, simplifiedMsg);
                    break;
                default:
                    await handleUnknownCommand(simplifiedMsg, isGroup, sender, prefix, command);
            }
        } else if (simplifiedMsg.message) {
            // Log for debugging
            // console.log('Message object:', simplifiedMsg.message);s

            if (uploadStates[sender] && simplifiedMsg.message) {
                // Handle file upload if the user is expected to upload a file
                delete uploadStates[sender]; // Clear the state after receiving the file // Logging
                await handleFileUpload(client, simplifiedMsg);
            } else {
                console.log('Non-command message detected.'); // Logging
            }
        }
    } catch (err) {
        console.error('Error in handleMessage:', err); // Logging error
        await simplifiedMsg.reply(util.format(err));
    }
}

function parseMessageContent(simplifiedMsg) {
    const body = getMessageBody(simplifiedMsg);
    const prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi)[0] : "/";
    const isCmd = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);

    return { body, prefix, isCmd, command, args };
}

async function getMessageContext(client, simplifiedMsg) {
    const pushname = simplifiedMsg.pushName || "No Name";
    const sender = simplifiedMsg.sender;
    const isGroup = simplifiedMsg.isGroup;
    const groupMetadata = isGroup ? await client.groupMetadata(simplifiedMsg.chat).catch(() => ({})) : {};
    const groupName = isGroup ? groupMetadata.subject : "";

    return { pushname, sender, isGroup, groupMetadata, groupName };
}

function logReceivedCommand(isCmd, isGroup, sender, pushname, groupName, body) {
    if (!isCmd) return;

    const argsLog = body.length > 30 ? `${body.substring(0, 30)}...` : body;
    const senderLog = chalk.yellow(`[ ${sender.replace("@s.whatsapp.net", "")} ]`);

    if (isGroup) {
        console.log(
            chalk.black(chalk.bgWhite("[ LOGS ]")),
            color(argsLog, "turquoise"),
            chalk.magenta("From"),
            chalk.green(pushname),
            senderLog,
            chalk.blueBright("IN"),
            chalk.green(groupName)
        );
    } else {
        console.log(
            chalk.black(chalk.bgWhite("[ LOGS ]")),
            color(argsLog, "turquoise"),
            chalk.magenta("From"),
            chalk.green(pushname),
            senderLog
        );
    }
}

async function replyWithMenu(client, simplifiedMsg, prefix) {
    const buttons = [
        { buttonId: "id1", buttonText: { displayText: 'Template 🪄' } },
        { buttonId: "id2", buttonText: { displayText: 'Generate Recommendation 👾' } },
        { buttonId: "id3", buttonText: { displayText: 'Update Data 🧙' } }
    ];

    const buttonInfo = {
        text: "Kalorize Official",
        buttons: buttons,
        viewOnce: true,
        headerType: 1
    };

    await client.sendMessage(simplifiedMsg.key.remoteJid, buttonInfo);
}

async function handleUnknownCommand(simplifiedMsg, isGroup, sender, prefix, command) {
    const body = getMessageBody(simplifiedMsg);
    if (simplifiedMsg.isBaileys || !body.toLowerCase() || simplifiedMsg.chat.endsWith("broadcast")) {
        return;
    }

    const errorLog = [
        chalk.black(chalk.bgRed("[ ERROR ]")),
        color("command", "turquoise"),
        color(`${prefix}${command}`, "turquoise"),
        color("tidak tersedia", "turquoise")
    ].join(" ");

    console.log(errorLog);
}

module.exports = handleMessage;
