/**
 * Updates the contacts in the contact store.
 * @param {Array} update - The array of contacts to update.
 */
async function updateContacts(client, store, update) {
    for (let contact of update) {
        let id = client.decodeJid(contact.id);
        if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
    }
}

module.exports = updateContacts;
