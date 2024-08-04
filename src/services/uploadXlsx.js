const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const jsonToPdf = require('./jsonToPdfService');

async function requestFileUpload(client, simplifiedMsg) {
    console.log('Requesting file upload...'); // Logging
    const replyMessage = "Please upload your XLSX file.";
    await client.sendMessage(simplifiedMsg.key.remoteJid, { text: replyMessage });
}

async function handleFileUpload(client, simplifiedMsg) {
    try {
        const documentMessage = simplifiedMsg.message?.documentMessage;
        const replyMessage = "Sedang diproses...";
        await client.sendMessage(simplifiedMsg.key.remoteJid, { text: replyMessage });
        if (!documentMessage) {
            throw new Error('No document message found.');
        }

        console.log('Received documentMessage:', JSON.stringify(documentMessage, null, 2));

        const { fileName, mimeType, directPath, mediaKey } = documentMessage;

        if (!fileName || !directPath || !mediaKey) {
            throw new Error('Incomplete document message.');
        }

        console.log('Document details:', { fileName, mimeType, directPath, mediaKey });

        if (!fileName.endsWith('.xlsx')) {
            throw new Error('Uploaded file is not an XLSX document.');
        }

        const stream = await downloadContentFromMessage(documentMessage, 'document');
        const filePath = path.join(__dirname, fileName);
        const writeStream = fs.createWriteStream(filePath);

        for await (const chunk of stream) {
            writeStream.write(chunk);
        }

        writeStream.end();

        writeStream.on('finish', async () => {
            console.log('File downloaded successfully:', filePath);

            const workbook = xlsx.readFile(filePath);
            const sheetNames = workbook.SheetNames;
            const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

            console.log('Converted JSON data:', jsonData);

            const jsonFileName = `${fileName.split('.').slice(0, -1).join('.')}.json`;
            const jsonFilePath = path.join(__dirname, '../sample', jsonFileName);
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

            console.log('JSON data saved to:', jsonFilePath);

            await client.sendMessage(simplifiedMsg.key.remoteJid, { text: `File has been processed and saved as ${jsonFileName}` });

            await client.sendMessage(simplifiedMsg.key.remoteJid, {
                document: { url: jsonFilePath },
                fileName: jsonFileName,
                mimetype: 'application/json'
            });

            fs.unlinkSync(filePath);

            // Optional: Convert JSON to PDF and send to user
            await jsonToPdf(jsonFilePath, simplifiedMsg.key.remoteJid, client);
        });
    } catch (error) {
        console.error('Error processing file upload:', error);
    }
}

module.exports = {
    requestFileUpload,
    handleFileUpload
};
