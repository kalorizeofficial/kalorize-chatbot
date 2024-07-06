// whatsappClient.js
const { default: makeWaSocket, fetchLatestBaileysVersion, makeInMemoryStore, Browsers, jidDecode, PhoneNumber, fetchLatestWaWebVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const figlet = require("figlet");
const { Boom } = require("@hapi/boom");
const { getAuthState } = require("../config/auth");
const { handleMessage } = require("../controllers/messageHandler");
const { color } = require("../helpers/color");
const { setupErrorHandler } = require("../utils/errorHandler");
const smsg = require("../helpers/smsg");
const { handleConnectionClose, handleConnectionOpen } = require("../utils/clientsUtil");

const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" }),
});

async function startHisoka() {
    const { state, saveCreds } = await getAuthState();
    const { version, isLatest } = await fetchLatestWaWebVersion().catch(() => fetchLatestBaileysVersion());
    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
    console.log(color(figlet.textSync("Kalorize ChatBot", { font: "Standard", horizontalLayout: "default", verticalLayout: "default", whitespaceBreak: false }), "orange"));

    const client = makeWaSocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        browser: Browsers.windows("Desktop"),
        auth: state,
    });

    store.bind(client.ev);

    client.ev.on("messages.upsert", async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        if (mek.key && mek.key.remoteJid === "status@broadcast") return;
        if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
        handleMessage(client, chatUpdate, store);
    });

    setupErrorHandler();

    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        } else return jid;
    };

    client.ev.on("contacts.update", (update) => {
        if (update.contacts) {
            for (let contact of update.contacts) {
                let id = client.decodeJid(contact.id);
                if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
            }
        }
    });

    client.getName = (jid, withoutContact = false) => {
        id = client.decodeJid(jid);
        withoutContact = client.withoutContact || withoutContact;
        let v;
        if (id.endsWith("@g.us"))
            return new Promise(async (resolve) => {
                v = store.contacts[id] || {};
                if (!(v.name || v.subject)) v = await client.groupMetadata(id) || {};
                resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
            });
        else v = id === "0@s.whatsapp.net" ? { id, name: "WhatsApp" } : id === client.decodeJid(client.user.id) ? client.user : store.contacts[id] || {};
        return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
    };

    client.public = true;
    client.serializeM = (m) => smsg(client, m, store);

    client.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            handleConnectionClose(client, reason, startHisoka);
        } else if (connection === "open") {
            handleConnectionOpen(client);
        }
    });

    client.ev.on("creds.update", saveCreds);

    client.sendImage = async (jid, path, caption = "", quoted = "", options) => {
        let buffer = await getImageBuffer(path);
        return await client.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted });
    };

    client.sendText = async (jid, text, quoted = "", options) => {
        try {
            const result = await client.sendMessage(jid, { text: text, ...options }, { quoted });
            console.log(`Pesan berhasil dikirim ke ${jid}`, result);
            return result;
        } catch (error) {
            console.error(`Gagal mengirim pesan ke ${jid}`, error);
            throw error;
        }
    };

    client.cMod = (jid, copy, text = "", sender = client.user.id, options = {}) => {
        let mtype = Object.keys(copy.message)[0];
        let isEphemeral = mtype === "ephemeralMessage";
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
        let content = msg[mtype];
        if (typeof content === "string") msg[mtype] = text || content;
        else if (content.caption) content.caption = text || content.caption;
        else if (content.text) content.text = text || content.text;
        if (typeof content !== "string") msg[mtype] = { ...content, ...options };
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        if (copy.key.remoteJid.includes("@s.whatsapp.net")) sender = sender || copy.key.remoteJid;
        else if (copy.key.remoteJid.includes("@broadcast")) sender = sender || copy.key.remoteJid;
        copy.key.remoteJid = jid;
        copy.key.fromMe = sender === client.user.id;

        return proto.WebMessageInfo.fromObject(copy);
    };

    return client;
}

module.exports = { startHisoka };
