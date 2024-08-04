require('dotenv').config();

/**
 * Mengimpor modul-modul yang diperlukan dari @whiskeysockets/baileys
 * @typedef {Object} Baileys
 * @property {Function} default - Fungsi untuk membuat koneksi ke WhatsApp
 * @property {Object} DisconnectReason - Objek yang berisi alasan pemutusan koneksi
 * @property {Function} useMultiFileAuthState - Fungsi untuk menggunakan autentikasi multi-file
 * @property {Object} Browsers - Objek yang berisi informasi tentang browser
 * @property {Function} makeInMemoryStore - Fungsi untuk membuat penyimpanan dalam memori
 * @property {Object} proto - Objek yang berisi protokol WhatsApp
 * @property {Function} fetchLatestBaileysVersion - Fungsi untuk mengambil versi terbaru Baileys
 */
const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    Browsers,
    makeInMemoryStore,
    proto,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const { Boom } = require('@hapi/boom');
const chalk = require('chalk');
const pino = require('pino');
const axios = require('axios');
const PhoneNumber = require('awesome-phonenumber');

const color = require('../helpers/color');
const { smsg } = require('../helpers/smsg');
const decodeJid = require('../helpers/jidDecoder');
const handleConnectionUpdate = require('../handlers/handleConnectionUpdate');
const { decode } = require('punycode');
const handleMessage = require('../handlers/handleMessage');
const { getContactName } = require('../helpers/getContactName');
const { formatPhoneNumber } = require('../helpers/formatPhoneNumber');
const updateContacts = require('../helpers/updateContacts');
const handleRejection = require('../handlers/handleRejection');

// Konfigurasi sesi
const SESSION_NAME = process.env.SESSION_NAME || 'default_session';

// Mendapatkan nilai CLIENT_PUBLIC dari environment variable
const CLIENT_PUBLIC = process.env.CLIENT_PUBLIC;

// Membuat penyimpanan lokal dengan logger yang disederhanakan
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

// Variabel untuk menyimpan pesan yang disederhanakan
let simplifiedMsg = "";

// Variabel untuk menyimpan klien WhatsApp
let client = "";

/**
 * Fungsi untuk menghubungkan ke WhatsApp
 * @returns {Promise<Object>} - Objek klien WhatsApp
 */
async function connectToWhatsApp() {
    // Mendapatkan state autentikasi dan fungsi untuk menyimpan kredensial
    const { state, saveCreds } = await useMultiFileAuthState(`./${SESSION_NAME}`);

    // Membuat koneksi ke WhatsApp
    client = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        browser: Browsers.macOS('Desktop'),
        auth: state,
    });

    // Mengikat penyimpanan lokal ke event klien
    store.bind(client.ev);

    // Menambahkan fungsi decodeJid ke klien
    client.decodeJid = decodeJid;

    // Menangani pesan baru yang diterima
    client.ev.on('messages.upsert', handleNewMessages);

    /**
     * Menangani pesan baru yang diterima oleh klien
     * @param {Object} update - Objek pembaruan pesan
     */
    async function handleNewMessages(update) {
        try {
            const message = update.messages[0];

            // Mengabaikan pesan tanpa konten, pembaruan status, dan pesan sementara
            if (!message.message || message.key?.remoteJid === "status@broadcast" || message.key?.id?.startsWith("BAE5") && message.key.id.length === 16) return;

            // Menangani pesan sementara
            message.message = message.message.ephemeralMessage?.message || message.message;

            // Mengabaikan pesan dari pengguna lain jika tidak dalam mode publik
            if (!CLIENT_PUBLIC && !message.key.fromMe && update.type === "notify") return;

            // Menyederhanakan pesan
            simplifiedMsg = smsg(client, message, store);

            // Log for debugging
            // console.log('Simplified message:', JSON.stringify(simplifiedMsg, null, 2));

            await handleMessage(client, simplifiedMsg, store);

        } catch (err) {
            console.error('Error handling new message:', err);
        }
    }

    // Menangani error
    handleRejection(client);

    // Memperbarui kontak saat terjadi pembaruan
    client.ev.on("contacts.update", (update) => updateContacts(client, store, update));

    // Menambahkan fungsi serializeM ke klien
    client.serializeM = (message) => smsg(client, message, store);

    // Menangani pembaruan koneksi
    client.ev.on('connection.update', handleConnectionUpdate(client, connectToWhatsApp));

    // Menyimpan kredensial saat terjadi pembaruan
    client.ev.on('creds.update', saveCreds);

    /**
     * Mengirim pesan teks
     * @param {string} jid - ID penerima
     * @param {string} text - Teks pesan
     * @param {string} [quoted=""] - Pesan yang dikutip
     * @param {Object} [options={}] - Opsi pesan
     */
    client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, { text: text, ...options }, { quoted });

    return client;
}

module.exports = connectToWhatsApp;
