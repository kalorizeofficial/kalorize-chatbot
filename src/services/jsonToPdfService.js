const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');

function generatePDF(jsonData) {
    const doc = new jsPDF();

    const tableColumn = ["No", "Tanggal", "Menu", "Gizi"];
    const tableRows = [];

    // Function to format nutrition info
    function formatNutrition(nutritionInfo) {
        if (!nutritionInfo) return "-";
        
        const mainItems = [
            { name: "Kalori", value: nutritionInfo.calories, unit: "kcal" },
            { name: "Protein", value: nutritionInfo.protein, unit: "g" },
            { name: "Lemak", value: nutritionInfo.fat, unit: "g" },
            { name: "Karbohidrat", value: nutritionInfo.carbohydrate, unit: "g" }
        ];

        const etcItems = nutritionInfo.etc || [];

        // Create a formatted string for main nutrition info
        const mainNutrition = mainItems.map(item => 
            `${item.name.padEnd(10)}: ${item.value.toString().padStart(4)}${item.unit}`
        ).join('\n');

        // Add a separator line
        const separator = '-'.repeat(30);

        // Create a formatted string for additional nutrition info
        const etcNutrition = etcItems.length > 0
            ? 'Tambahan:\n' + etcItems.map(item => '  ' + item).join('\n')
            : '';

        // Combine main and additional nutrition info with separator
        return `${mainNutrition}\n${separator}\n${etcNutrition}`;
    }

    // Loop through data and push it to tableRows
    jsonData.recommendations.menu.forEach((menu, index) => {
        const nutritionInfo = jsonData.nutrition.menu.find(item => item.name === menu);
        const nutritionDetails = formatNutrition(nutritionInfo);
        const rowData = [
            index + 1,
            jsonData.created_at.split("T")[0],
            menu,
            nutritionDetails
        ];
        tableRows.push(rowData);
    });

    // Start at Y position 20 for the table
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
            // Change fill color to bold yellow
            fillColor: [255, 255, 0],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 25 },
            2: { cellWidth: 50 },
            3: { cellWidth: 'auto' }
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        }
    });

    const pdfOutput = doc.output();
    fs.writeFileSync('output.pdf', pdfOutput, 'binary');
}


// Contoh JSON data (sesuai dengan struktur yang Anda berikan)
const jsonData = {
    "recommendations": {
        "menu": [
            "Nasi ayam sayur asem",
            "Nasi ayam goreng dan telur sambal",
            "Soto ayam dan nasi",
            "Ayam bakar dan nasi"
        ]
    },
    "nutrition": {
        "menu": [
            {
                "name": "Nasi ayam sayur asem",
                "calories": 500,
                "protein": 20,
                "fat": 10,
                "carbohydrate": 70,
                "etc": [
                    "Vitamin A: 10mg",
                    "Vitamin C: 20mg",
                ]
            },
            {
                "name": "Nasi ayam goreng dan telur sambal",
                "calories": 600,
                "protein": 25,
                "fat": 15,
                "carbohydrate": 80,
                "etc": [
                    "Zat besi: 5mg",
                    "Kalsium: 100mg",
                ]
            },
            {
                "name": "Soto ayam dan nasi",
                "calories": 550,
                "protein": 22,
                "fat": 12,
                "carbohydrate": 75,
                "etc": [
                    "Magnesium: 15mg",
                    "Kalium: 200mg",
                ]
            }
        ]
    },
    "requested_by": "6285770327304@s.whatsapp.net",
    "bot_jid": "6285161504205@s.whatsapp.net",
    "created_at": "2021-10-06T15:00:00Z",
    "dataset_version": "2021-10-06",
    "language": "id"
};

// Generate PDF from JSON data
generatePDF(jsonData);