/**
   * Formats a JID (WhatsApp ID) as an international phone number.
   * @param {string} jid - The JID (WhatsApp ID) to format.
   * @returns {string} The formatted phone number in international format.
   */
const formatPhoneNumber = (jid) => {
    return PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
};

module.exports = formatPhoneNumber;