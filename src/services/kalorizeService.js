const { getRecommendationFood } = require('../services/recommService');
const { sendMenu } = require('../helpers/menu');
const { uploadCsv } = require('./uploadCsvService');
const { downloadCsvTemplate } = require('./downloadCsvTemplateService');
const fs = require('fs');
const chalk = require('chalk');
const util = require('util');


const kalorize = async (client, m, chatUpdate, id) => {
    try {
        var body =
            m.mtype === 'conversation'
                ? m.message.conversation
                : m.mtype == 'imageMessage'
                ? m.message.imageMessage.caption
                : m.mtype == 'videoMessage'
                ? m.message.videoMessage.caption
                : m.mtype == 'extendedTextMessage'
                ? m.message.extendedTextMessage.text
                : m.mtype == 'buttonsResponseMessage'
                ? m.message.buttonsResponseMessage.selectedButtonId
                : m.mtype == 'listResponseMessage'
                ? m.message.listResponseMessage.singleSelectReply.selectedRowId
                : m.mtype == 'templateButtonReplyMessage'
                ? m.message.templateButtonReplyMessage.selectedId
                : m.mtype === 'messageContextInfo'
                ? m.message.buttonsResponseMessage?.selectedButtonId ||
                  m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
                  m.text
                : '';
        if (m.mtype === 'viewOnceMessageV2') return;
        var budy = typeof m.text == 'string' ? m.text : '';
        var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : '/';
        const isCmd2 = body.startsWith(prefix);
        const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || 'No Name';
        const botNumber = await client.decodeJid(client.user.id);
        const itsMe = m.sender == botNumber ? true : false;
        let text = (q = args.join(' '));
        const arg = budy.trim().substring(budy.indexOf(' ') + 1);
        const arg1 = arg.trim().substring(arg.indexOf(' ') + 1);

        const from = m.chat;
        const reply = m.reply;
        const sender = m.sender;
        const mek = chatUpdate.messages[0];

        const color = (text, color) => {
            return !color ? chalk.green(text) : chalk.keyword(color)(text);
        };

        // Group
        const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : '';
        const groupName = m.isGroup ? groupMetadata.subject : '';

        // Push Message To Console
        let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

        if (isCmd2 && !m.isGroup) {
            console.log(
                chalk.black(chalk.bgWhite('[ LOGS ]')),
                color(argsLog, 'turquoise'),
                chalk.magenta('From'),
                chalk.green(pushname),
                chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`)
            );
        } else if (isCmd2 && m.isGroup) {
            console.log(
                chalk.black(chalk.bgWhite('[ LOGS ]')),
                color(argsLog, 'turquoise'),
                chalk.magenta('From'),
                chalk.green(pushname),
                chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`),
                chalk.blueBright('IN'),
                chalk.green(groupName)
            );
        }

        if (isCmd2) {
            switch (id) {
                case '1': {
                    await getRecommendationFood(client, m, chatUpdate, id);
                    await sendMenu(client, m.key.remoteJid);
                    break;
                }
                case '2': {
                    client.sendMessage(m.chat, 'Anda memilih Upload Data CSV.');
                    await uploadCsv(client, m, chatUpdate, id);
                    if (isCmd2 && budy.toLowerCase() != undefined) {
                        if (m.chat.endsWith('broadcast')) return;
                        if (m.isBaileys) return;
                        if (!budy.toLowerCase()) return;
                        if (argsLog || (isCmd2 && !m.isGroup)) {
                            console.log(
                                chalk.black(chalk.bgRed('[ ERROR ]')),
                                color('command', 'turquoise'),
                                color(`${prefix}${command}`, 'turquoise'),
                                color('tidak tersedia', 'turquoise')
                            );
                        } else if (argsLog || (isCmd2 && m.isGroup)) {
                            console.log(
                                chalk.black(chalk.bgRed('[ ERROR ]')),
                                color('command', 'turquoise'),
                                color(`${prefix}${command}`, 'turquoise'),
                                color('tidak tersedia', 'turquoise')
                            );
                        }
                    }
                    await sendMenu(client, m.key.remoteJid);

                    break;
                }
                case '3': {
                    client.sendMessage(m.chat, 'Anda memilih Minta data template CSV.');
                    await downloadCsvTemplate(client, m, chatUpdate, id);
                    if (isCmd2 && budy.toLowerCase() != undefined) {
                        if (m.chat.endsWith('broadcast')) return;
                        if (m.isBaileys) return;
                        if (!budy.toLowerCase()) return;
                        if (argsLog || (isCmd2 && !m.isGroup)) {
                            console.log(
                                chalk.black(chalk.bgRed('[ ERROR ]')),
                                color('command', 'turquoise'),
                                color(`${prefix}${command}`, 'turquoise'),
                                color('tidak tersedia', 'turquoise')
                            );
                        } else if (argsLog || (isCmd2 && m.isGroup)) {
                            console.log(
                                chalk.black(chalk.bgRed('[ ERROR ]')),
                                color('command', 'turquoise'),
                                color(`${prefix}${command}`, 'turquoise'),
                                color('tidak tersedia', 'turquoise')
                            );
                        }
                    }
                    await sendMenu(client, m.key.remoteJid);

                    break;
                }

                default: {
                    console.log(`Unknown command: ${command}. Sending menu button.`);
                    await sendMenu(client, m.key.remoteJid);
                    break;
                }
            }
        }
    } catch (err) {
        m.reply(util.format(err));
    }
};

module.exports = kalorize;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
