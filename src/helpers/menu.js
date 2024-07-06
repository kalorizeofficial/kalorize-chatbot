async function sendMenu(client, jid) {
    const menuText = `
Halo sobat Kalorize, selamat datang di menu ChatBot!
Silahkan pilih salah satu dengan mengirimkan angka:
1. Rekomendasi Makanan
2. Upload Data CSV
3. Minta data template CSV
`;

    try {
        console.log(`Mengirim pesan ke ${jid} dengan menu teks.`);
        const result = await client.sendMessage(jid, { text: menuText });
        console.log(`Pesan berhasil dikirim ke ${jid}`, result);
    } catch (error) {
        console.error(`Gagal mengirim pesan ke ${jid}`, error);
        throw error;
    }
}

module.exports = { sendMenu };
