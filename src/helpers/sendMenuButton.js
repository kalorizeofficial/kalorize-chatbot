async function sendMenuButton(client, jid) {
    const buttons = [
        { buttonId: 'id1', buttonText: { displayText: 'Rekomendasi Makanan' }, type: 1 },
        { buttonId: 'id2', buttonText: { displayText: 'Upload Data CSV' }, type: 1 },
        { buttonId: 'id3', buttonText: { displayText: 'Minta data template CSV' }, type: 1 }
    ];
    const buttonMessage = {
        text: 'Halo sobat Kalorize, selamat datang di menu ChatBot!:',
        footer: 'Silahkan tekan salah satu:',
        buttons: buttons,
        viewOnce: true,
        headerType: 1
    };
    await client.sendMessage(jid, buttonMessage);
}

module.exports = { sendMenuButton };