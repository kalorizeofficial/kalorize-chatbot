// uploadXlsxService.js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const uploadXlsx = async (client, m) => {
    try {
        // Ambil data dari pesan WhatsApp
        const attachment = m.message.imageMessage || m.message.videoMessage || m.message.documentMessage;

        if (!attachment) {
            return m.reply('Mohon sertakan file XLSX untuk diupload.');
        }

        // Simpan file XLSX ke dalam folder tertentu
        const fileName = `${Date.now()}_${attachment.fileName}`;
        const filePath = path.join(__dirname, '..', 'uploads', fileName);

        const dataBuffer = await client.downloadMediaMessage(m);
        fs.writeFileSync(filePath, dataBuffer);

        // Baca file XLSX
        const workbook = XLSX.readFile(filePath);
        const sheetNameList = workbook.SheetNames;
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

        // Berhasil upload dan baca
        m.reply(`File XLSX berhasil diupload dengan nama ${attachment.fileName}.\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
        m.reply(`Gagal upload file XLSX. Error: ${error}`);
    }
};

module.exports = { uploadXlsx };
