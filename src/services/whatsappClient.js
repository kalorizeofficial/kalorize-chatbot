const sessionName = "kalorize";

const {
    default: makeWaSocket,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    DisconnectReason,
    Browsers,
    jidDecode,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const figlet = require("figlet");
const { Boom } = require("@hapi/boom");
const { getAuthState } = require("../config/auth");
const { handleMessage } = require("../controllers/messageHandler");
const { color } = require("../helpers/color");
const { setupErrorHandler } = require("../utils/errorHandler");
const _ = require("lodash");
const smsg = require("../helpers/smsg");

const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" }),
});

async function startHisoka() {
    const { state, saveCreds } = await getAuthState();
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
    console.log(
        color(
            figlet.textSync("Wa-OpenAI", {
                font: "Standard",
                horizontalLayout: "default",
                vertivalLayout: "default",
                whitespaceBreak: false,
            }),
            "green"
        )
    );

    const client = makeWaSocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        browser: Browsers.macOS("Desktop"),
        auth: state,
    });

    store.bind(client.ev);

    client.ev.on("messages.upsert", async (chatUpdate) => {
        handleMessage(client, chatUpdate, store);
    });

    // Error Handling import from utils/errorHandler
    setupErrorHandler();

    // Setting
    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (
                (decode.user && decode.server && decode.user + "@" + decode.server) ||
                jid
            );
        } else return jid;
    };

    client.ev.on("contacts.update", (update) => {
        if (update.contacts) {
            for (let contact of update.contacts) {
                let id = client.decodeJid(contact.id);
                if (store && store.contacts)
                    store.contacts[id] = { id, name: contact.notify };
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
                resolve(
                    v.name ||
                    v.subject ||
                    PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
                        "international"
                    )
                );
            });
        else
            v =
                id === "0@s.whatsapp.net"
                    ? {
                        id,
                        name: "WhatsApp",
                    }
                    : id === client.decodeJid(client.user.id)
                        ? client.user
                        : store.contacts[id] || {};
        return (
            (withoutContact ? "" : v.name) ||
            v.subject ||
            v.verifiedName ||
            PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
                "international"
            )
        );
    };

    client.public = true;

    client.serializeM = (m) => smsg(client, m, store);

    client.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.badSession) {
                console.log(`Bad Session File, Please Delete Session and Scan Again`);
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log("Connection closed, reconnecting....");
                startHisoka();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log("Connection Lost from Server, reconnecting...");
                startHisoka();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log(
                    "Connection Replaced, Another New Session Opened, Please Restart Bot"
                );
                process.exit();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(
                    `Device Logged Out, Please Delete Folder Session Kalorize and Scan Again.`
                );
                process.exit();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Restart Required, Restarting...");
                startHisoka();
            } else if (reason === DisconnectReason.timedOut) {
                console.log("Connection TimedOut, Reconnecting...");
                startHisoka();
            } else {
                console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
                startHisoka();
            }
        } else if (connection === "open") {
            const botNumber = await client.decodeJid(client.user.id);
            console.log(color("Bot success connected to server", "green"));
            console.log(color("Type /menu to see menu"));
            client.sendMessage(botNumber, {
                text: `Bot started!\n\nKALORIZE NIH BOS SENGGOL DONG !!!`,
            });
        }
    });

    client.ev.on("creds.update", saveCreds);

    const { getBuffer } = require("../helpers/buffer");

    client.sendImage = async (jid, path, caption = "", quoted = "", options) => {
        let buffer = Buffer.isBuffer(path)
            ? path
            : /^data:.*?\/.*?;base64,/i.test(path)
                ? Buffer.from(path.split`,`[1], "base64")
                : /^https?:\/\//.test(path)
                    ? await getBuffer(path)
                    : fs.existsSync(path)
                        ? fs.readFileSync(path)
                        : Buffer.alloc(0);
        return await client.sendMessage(
            jid,
            { image: buffer, caption: caption, ...options },
            { quoted }
        );
    };

    client.sendText = (jid, text, quoted = "", options) =>
        client.sendMessage(jid, { text: text, ...options }, { quoted });

    client.cMod = (
        jid,
        copy,
        text = "",
        sender = client.user.id,
        options = {}
    ) => {
        let mtype = Object.keys(copy.message)[0];
        let isEphemeral = mtype === "ephemeralMessage";
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
        }
        let msg = isEphemeral
            ? copy.message.ephemeralMessage.message
            : copy.message;
        let content = msg[mtype];
        if (typeof content === "string") msg[mtype] = text || content;
        else if (content.caption) content.caption = text || content.caption;
        else if (content.text) content.text = text || content.text;
        if (typeof content !== "string")
            msg[mtype] = {
                ...content,
                ...options,
            };
        if (copy.key.participant)
            sender = copy.key.participant = sender || copy.key.participant;
        else if (copy.key.participant)
            sender = copy.key.participant = sender || copy.key.participant;
        if (copy.key.remoteJid.includes("@s.whatsapp.net"))
            sender = sender || copy.key.remoteJid;
        else if (copy.key.remoteJid.includes("@broadcast"))
            sender = sender || copy.key.remoteJid;
        copy.key.remoteJid = jid;
        copy.key.fromMe = sender === client.user.id;

        return proto.WebMessageInfo.fromObject(copy);
    };

    return client;
}

module.exports = { startHisoka };
