const fs = require('fs');
const path = require('path');

const uploadCsv = async (client, m) => {
    try {
        // Ambil data dari pesan WhatsApp
        const attachment = m.message.imageMessage || m.message.videoMessage || m.message.documentMessage;

        if (!attachment) {
            return m.reply('Mohon sertakan file CSV untuk diupload.');
        }

        // Simpan file CSV ke dalam folder tertentu
        const fileName = `${Date.now()}_${attachment.fileName}`;
        const filePath = path.join(__dirname, '..', 'uploads', fileName);

        const dataBuffer = await client.downloadMediaMessage(m);
        fs.writeFileSync(filePath, dataBuffer);

        // Berhasil upload
        m.reply(`File CSV berhasil diupload dengan nama ${attachment.fileName}.`);
    } catch (error) {
        m.reply(`Gagal upload file CSV. Error: ${error}`);
    }
};

module.exports = { uploadCsv };
