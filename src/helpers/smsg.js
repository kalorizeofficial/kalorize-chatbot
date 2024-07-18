const { proto, getContentType } = require('@whiskeysockets/baileys');

/**
 * Simplifies a message object and adds utility functions.
 * @param {Object} client - The WhatsApp client instance.
 * @param {Object} msg - The message object to simplify.
 * @param {Object} store - The store object for message storage.
 * @returns {Object} The simplified message object.
 */
function smsg(client, msg, store) {
    if (!msg) return msg;
    let M = proto.WebMessageInfo;

    // Add message properties
    if (msg.key) {
        msg.id = msg.key.id;
        msg.isBaileys = msg.id.startsWith("BAE5") && msg.id.length === 16;
        msg.chat = msg.key.remoteJid;
        msg.fromMe = msg.key.fromMe;
        msg.isGroup = msg.chat.endsWith("@g.us");
        msg.sender = client.decodeJid((msg.fromMe && client.user.id) || msg.participant || msg.key.participant || msg.chat || "");
        if (msg.isGroup) msg.participant = client.decodeJid(msg.key.participant) || "";
    }

    // Add message content properties
    if (msg.message) {
        msg.mtype = getContentType(msg.message);
        msg.msg = msg.mtype == "viewOnceMessage" ? msg.message[msg.mtype].message[getContentType(msg.message[msg.mtype].message)] : msg.message[msg.mtype];
        msg.body = msg.message.conversation || msg.msg.caption || msg.msg.text || (msg.mtype == "viewOnceMessage" && msg.msg.caption) || msg.text;
        let quoted = (msg.quoted = msg.msg.contextInfo ? msg.msg.contextInfo.quotedMessage : null);
        msg.mentionedJid = msg.msg.contextInfo ? msg.msg.contextInfo.mentionedJid : [];

        // Add quoted message properties
        if (msg.quoted) {
            let type = getContentType(quoted);
            msg.quoted = msg.quoted[type];
            if (["productMessage"].includes(type)) {
                type = getContentType(msg.quoted);
                msg.quoted = msg.quoted[type];
            }
            if (typeof msg.quoted === "string") msg.quoted = { text: msg.quoted };
            msg.quoted.mtype = type;
            msg.quoted.id = msg.msg.contextInfo.stanzaId;
            msg.quoted.chat = msg.msg.contextInfo.remoteJid || msg.chat;
            msg.quoted.isBaileys = msg.quoted.id ? msg.quoted.id.startsWith("BAE5") && msg.quoted.id.length === 16 : false;
            msg.quoted.sender = client.decodeJid(msg.msg.contextInfo.participant);
            msg.quoted.fromMe = msg.quoted.sender === client.decodeJid(client.user.id);
            msg.quoted.text = msg.quoted.text || msg.quoted.caption || msg.quoted.conversation || msg.quoted.contentText || msg.quoted.selectedDisplayText || msg.quoted.title || "";
            msg.quoted.mentionedJid = msg.msg.contextInfo ? msg.msg.contextInfo.mentionedJid : [];

            /**
             * Gets the quoted message object.
             * @returns {Promise<Object>} The quoted message object.
             */
            msg.getQuotedObj = msg.getQuotedMessage = async () => {
                if (!msg.quoted.id) return false;
                let q = await store.loadMessage(msg.chat, msg.quoted.id, client);
                return exports.smsg(client, q, store);
            };

            let vM = (msg.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: msg.quoted.chat,
                    fromMe: msg.quoted.fromMe,
                    id: msg.quoted.id,
                },
                message: quoted,
                ...(msg.isGroup ? { participant: msg.quoted.sender } : {}),
            }));

            /**
             * Deletes the quoted message.
             * @returns {Promise<Object>} The result of deleting the quoted message.
             */
            msg.quoted.delete = () => client.sendMessage(msg.quoted.chat, { delete: vM.key });

            /**
             * Copies and forwards the quoted message to another chat.
             * @param {string} jid - The destination chat ID.
             * @param {boolean} forceForward - Whether to force forward the message.
             * @param {Object} options - Additional options for forwarding the message.
             * @returns {Promise<Object>} The result of copying and forwarding the quoted message.
             */
            msg.quoted.copyNForward = (jid, forceForward = false, options = {}) => client.copyNForward(jid, vM, forceForward, options);

            /**
             * Downloads the media from the quoted message.
             * @returns {Promise<Buffer>} The downloaded media buffer.
             */
            msg.quoted.download = () => client.downloadMediaMessage(msg.quoted);
        }
    }

    /**
     * Downloads the media from the message.
     * @returns {Promise<Buffer>} The downloaded media buffer.
     */
    if (msg.msg.url) msg.download = () => client.downloadMediaMessage(msg.msg);

    msg.text = msg.msg.text || msg.msg.caption || msg.message.conversation || msg.msg.contentText || msg.msg.selectedDisplayText || msg.msg.title || "";

    /**
     * Replies to the message.
     * @param {string|Object} text - The content of the reply message.
     * @param {string} chatId - The ID of the chat to send the reply message in.
     * @param {Object} options - Additional options for sending the reply message.
     * @returns {Promise<Object>} The result of sending the reply message.
     */
    msg.reply = (text, chatId = msg.chat, options = {}) => (
        Buffer.isBuffer(text) ? 
        client.sendMedia(chatId, text, "file", "", msg, { ...options }) : 
        client.sendText(chatId, text, msg, { ...options })
    );

    /**
     * Creates a copy of the message.
     * @returns {Object} The copied message object.
     */
    msg.copy = () => exports.smsg(client, M.fromObject(M.toObject(msg)));

    return msg;
}

module.exports = { smsg };