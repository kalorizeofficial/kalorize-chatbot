/**
 * Retrieves the contact name or group name for a given JID (WhatsApp ID).
 * @param {Object} client - The WhatsApp client instance.
 * @param {Object} store - The contact store instance.
 * @param {string} jid - The JID (WhatsApp ID) to get the name for.
 * @param {boolean} [withoutContact=false] - Flag to exclude contact name from the result.
 * @returns {Promise<string|Object>} A promise that resolves to the contact name, group name, or an object containing the JID and name.
 */
const getContactName = async (client, store, jid, withoutContact = false) => {
    const decodedJid = client.decodeJid(jid);
    const useWithoutContact = client.withoutContact || withoutContact;
  
    // Check if the decoded JID is a group
    if (decodedJid.endsWith("@g.us")) {
      try {
        /**
         * Retrieves the group metadata for the given JID.
         * @type {Object}
         * @property {string} name - The name of the group.
         * @property {string} subject - The subject of the group.
         */
        let groupMetadata = store.contacts[decodedJid] || {};
        if (!(groupMetadata.name || groupMetadata.subject)) {
          groupMetadata = await client.groupMetadata(decodedJid) || {};
        }
  
        // Return the group name or subject, or a formatted phone number if not available
        return groupMetadata.name || groupMetadata.subject || formatPhoneNumber(decodedJid);
      } catch (error) {
        console.error(`Error getting group metadata for ${decodedJid}:`, error);
        return formatPhoneNumber(decodedJid);
      }
    }
  
    // Check if the decoded JID is a special case ("0@s.whatsapp.net") representing WhatsApp system account
    if (decodedJid === "0@s.whatsapp.net") {
      return {
        id: decodedJid,
        name: "WhatsApp",
      };
    }
  
    // Check if the decoded JID belongs to the current user
    if (decodedJid === client.decodeJid(client.user.id)) return client.user;

  
    /**
     * Retrieves the contact information for the given JID from the contact store.
     * @type {Object}
     * @property {string} name - The name of the contact.
     * @property {string} verifiedName - The verified name of the contact.
     */
    const contactInfo = store.contacts[decodedJid] || {};
  
    // Return the contact name if available and not using withoutContact, or a formatted phone number
    return useWithoutContact ? "" : contactInfo.name || contactInfo.verifiedName || formatPhoneNumber(jid);
  };
  module.exports = getContactName;