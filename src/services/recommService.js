const axios = require('axios');
const generatePDF = require('../utils/generatePDF');

// Fungsi untuk mengambil rekomendasi makanan dari API ML
const getRecommendationFood = async (client, m, chatUpdate, id) => {
    try {
        // Simulasi data yang akan dikirim ke API ML
        const requestData = {
            userId: m.sender, // Ganti dengan data yang sesuai dari pesan masuk
            messageType: m.mtype,
            chatData: m.message,
            // Tambahkan data lain sesuai kebutuhan (misalnya waktu, konteks percakapan, dll)
        };

        // Ganti dengan URL endpoint yang sesuai dengan API ML
        const apiUrl = 'https://api.example.com/recommendation';

        // Kirim permintaan POST ke API ML
        const response = await axios.post(apiUrl, requestData);

        // Periksa status respons dari API
        if (response.status === 200) {
            const recommendationData = response.data;

            // Generate PDF berdasarkan data rekomendasi
            const pdfFileName = await generatePDF(recommendationData);

            // Kirim PDF yang dihasilkan sebagai balasan pesan
            const filePath = `./recommendations/${pdfFileName}`; // Sesuaikan dengan lokasi penyimpanan PDF
            await client.sendFile(m.chat, filePath, pdfFileName, `Berikut rekomendasi makanan untuk Anda`, m);

            console.log('Recommendation PDF sent successfully.');
        } else {
            console.error('Failed to get recommendation from API ML.');
            throw new Error('Failed to get recommendation from API ML.');
        }
    } catch (error) {
        console.error('Error in getRecommendationFood:', error);
        throw error;
    }
};

module.exports = {
    getRecommendationFood,
};
