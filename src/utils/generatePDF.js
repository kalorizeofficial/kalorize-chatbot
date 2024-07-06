const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');

const generatePDF = async (recommendationData) => {
    try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        // Add a new page to the PDF
        const page = pdfDoc.addPage();

        // Get the width and height of the page
        const { width, height } = page.getSize();

        // Set font for the document
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Set up text content
        const textContent = `
        Recommendation Details:
        ------------------------
        User ID: ${recommendationData.userId}
        Message Type: ${recommendationData.messageType}
        Chat Data: ${JSON.stringify(recommendationData.chatData)}
        `;

        // Draw text on the page
        page.drawText(textContent, {
            x: 50,
            y: height - 100,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
        });

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        // Write the PDF bytes to a file
        const fileName = `Recommendation_${Date.now()}.pdf`;
        const filePath = `./recommendations/${fileName}`; // Adjust the path as per your project structure

        fs.writeFileSync(filePath, pdfBytes);

        console.log(`PDF file generated successfully: ${filePath}`);
        return fileName; // Return the file name for further use if needed
    } catch (error) {
        console.error('Error in generatePDF:', error);
        throw error;
    }
};

module.exports = generatePDF;
