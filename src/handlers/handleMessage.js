const chalk = require('chalk');
const util = require('util');
const color = require('../helpers/color');
const getMessageBody = require('../helpers/getMessageBody');

/**
 * Handles a simplified message object.
 * @param {Object} client - The WhatsApp client instance.
 * @param {Object} simplifiedMsg - The simplified message object.
 */
async function handleMessage(client, simplifiedMsg) {
    try {
        if (simplifiedMsg.mtype === "viewOnceMessageV2") return;

        const { body, prefix, isCmd, command, args } = parseMessageContent(simplifiedMsg);
        const { pushname, sender, isGroup, groupMetadata, groupName } = await getMessageContext(client, simplifiedMsg);

        // Log the received command
        logReceivedCommand(isCmd, isGroup, sender, pushname, groupName, body);

        // Handle the command
        if (isCmd) {
            switch (command) {
                case "help":
                case "menu":
                case "start":
                case "info":
                    await replyWithMenu(client, simplifiedMsg, prefix);
                    break;
                default:
                    await handleUnknownCommand(simplifiedMsg, isGroup, sender, prefix, command);
            }
        }
    } catch (err) {
        await simplifiedMsg.reply(util.format(err));
    }
}

/**
 * Parses the message content and extracts relevant information.
 * @param {Object} simplifiedMsg - The simplified message object.
 * @returns {Object} An object containing the parsed message content.
 */
function parseMessageContent(simplifiedMsg) {
    const body = getMessageBody(simplifiedMsg);
    const prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi)[0] : "/";
    const isCmd = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);

    return { body, prefix, isCmd, command, args };
}

/**
 * Retrieves the message context information.
 * @param {Object} client - The WhatsApp client instance.
 * @param {Object} simplifiedMsg - The simplified message object.
 * @returns {Promise<Object>} A promise resolving to an object containing the message context information.
 */
async function getMessageContext(client, simplifiedMsg) {
    const pushname = simplifiedMsg.pushName || "No Name";
    const sender = simplifiedMsg.sender;
    const isGroup = simplifiedMsg.isGroup;
    const groupMetadata = isGroup ? await client.groupMetadata(simplifiedMsg.chat).catch(() => ({})) : {};
    const groupName = isGroup ? groupMetadata.subject : "";

    return { pushname, sender, isGroup, groupMetadata, groupName };
}

/**
 * Logs the received command information.
 * @param {boolean} isCmd - Indicates if the message is a command.
 * @param {boolean} isGroup - Indicates if the message is from a group.
 * @param {string} sender - The sender's ID.
 * @param {string} pushname - The sender's push name.
 * @param {string} groupName - The group name (if applicable).
 * @param {string} body - The message body.
 */
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

/**
 * Replies with the menu message.
 * @param {Object} simplifiedMsg - The simplified message object.
 * @param {string} prefix - The command prefix.
 * @returns {Promise<void>} A promise that resolves when the menu is sent.
 */
async function replyWithMenu(client, simplifiedMsg, prefix) {
    const menuMessage = `Kalorize 👾`;
    await simplifiedMsg.reply(menuMessage);
}

/**
 * Handles unknown commands.
 * @param {Object} simplifiedMsg - The simplified message object.
 * @param {boolean} isGroup - Indicates if the message is from a group.
 * @param {string} sender - The sender's ID.
 * @param {string} prefix - The command prefix.
 * @param {string} command - The unknown command.
 * @returns {Promise<void>} A promise that resolves when the unknown command is handled.
 */
async function handleUnknownCommand(simplifiedMsg, isGroup, sender, prefix, command) {
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