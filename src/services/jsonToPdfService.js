const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

async function jsonToPdf(jsonFilePath, remoteJid, client) {
    try {
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

        const doc = new jsPDF();
        const tableColumn = ["No", "Nama", "Porsi", "Kalori", "Protein", "Karbohidrat", "Lemak", "Kategori", "Rekomendasi Pakai Nasi"];
        const tableRows = [];

        jsonData.forEach((entry, index) => {
            const rowData = [
                index + 1,
                entry.nama,
                entry.porsi,
                entry.kalori,
                entry.protein,
                entry.karbohidrat,
                entry.lemak,
                entry.kategori,
                entry.rekomendasi_pakai_nasi
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid',
            styles: {
                overflow: 'linebreak',
                cellPadding: 3,
                fontSize: 8,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [255, 255, 0],
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 30 },
                2: { cellWidth: 15 },
                3: { cellWidth: 15 },
                4: { cellWidth: 20 },
                5: { cellWidth: 25 },
                6: { cellWidth: 20 },
                7: { cellWidth: 30 },
                8: { cellWidth: 40 }
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            }
        });

        const pdfFilePath = path.join(__dirname, '../sample', 'output.pdf');
        doc.save(pdfFilePath);

        await client.sendMessage(remoteJid, { document: { url: pdfFilePath }, fileName: 'output.pdf', mimetype: 'application/pdf' });

        console.log('PDF generated and sent successfully:', pdfFilePath);

        fs.unlinkSync(pdfFilePath);
    } catch (error) {
        console.error('Error generating PDF from JSON:', error);
    }
}

module.exports = jsonToPdf;
