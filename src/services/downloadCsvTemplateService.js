const fs = require('fs');
const path = require('path');

const downloadCsvTemplate = async (client, m) => {
    try {
        // Lokasi template CSV
        const templatePath = path.join(__dirname, '..', 'templates', 'template.csv');

        // Kirim template CSV ke pengguna
        await client.sendFile(m.chat, templatePath, 'template.csv', 'Ini adalah template CSV yang dapat Anda gunakan.');

        // Berhasil mengirim template
        console.log('Template CSV telah dikirim.');
    } catch (error) {
        m.reply(`Gagal mengirim template CSV. Error: ${error}`);
    }
};

module.exports = { downloadCsvTemplate };
