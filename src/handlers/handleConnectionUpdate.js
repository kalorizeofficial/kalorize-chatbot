// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const { Boom } = require('@hapi/boom');
const { DisconnectReason } = require('@whiskeysockets/baileys');
const color = require('../helpers/color');
const fs = require('fs');
const path = require('path');

// Configuration constants
const MAX_RETRIES = process.env.MAX_RETRIES || 5;  // Maximum number of reconnection attempts
const RETRY_INTERVAL = process.env.RETRY_INTERVAL || 5000;  // Delay between reconnection attempts (in milliseconds)

// Get SESSION_NAME from .env, or use 'default_session' if not defined
const SESSION_NAME = process.env.SESSION_NAME || 'default_session';

/**
 * Deletes the session folder.
 * This function is called when the bot is logged out to clean up session data.
 */
function deleteSessionFolder() {
    const sessionPath = path.join(process.cwd(), SESSION_NAME);
    if (fs.existsSync(sessionPath)) {
        fs.rmdirSync(sessionPath, { recursive: true });
        console.log(color(`Session folder ${SESSION_NAME} deleted.`, "yellow"));
    } else {
        console.log(color(`Session folder ${SESSION_NAME} not found.`, "yellow"));
    }
}

/**
 * Creates a connection update handler for the WhatsApp bot with retry mechanism.
 * @param {Object} client - The WhatsApp client instance.
 * @param {Function} connectToWhatsApp - Function to restart the bot.
 * @returns {Function} An async function that handles connection updates.
 */
function handleConnectionUpdate(client, connectToWhatsApp) {
    let retries = 0;  // Counter for reconnection attempts
    let botNumber;  // Store the bot's number

    /**
     * Gets the bot's number, fetching it if not already stored.
     * @returns {Promise<string>} The bot's number.
     */
    const getBotNumber = async () => {
        if (!botNumber) {
            botNumber = await client.decodeJid(client.user.id);
        }
        return botNumber;
    };

    /**
     * Sends a notification message to the bot's own number.
     * @param {string} message - The message to send.
     */
    const sendNotification = async (message) => {
        try {
            const number = await getBotNumber();
            await client.sendMessage(number, { text: message });
        } catch (err) {
            console.error(color("Error sending notification:", "red"), err);
        }
    };

    /**
     * Attempts to reconnect to WhatsApp.
     * This function is called when the connection is lost or needs to be restarted.
     */
    const reconnect = async () => {
        if (retries >= MAX_RETRIES) {
            console.log(color("Max retries reached. Exiting...", "red"));
            process.exit(1);
        }

        retries++;
        console.log(color(`Attempting to reconnect... (Attempt ${retries}/${MAX_RETRIES})`, "yellow"));
        
        setTimeout(async () => {
            try {
                await connectToWhatsApp();
            } catch (err) {
                console.error(color("Reconnection failed:", "red"), err);
                await reconnect();
            }
        }, RETRY_INTERVAL);
    };

    /**
     * The main connection update handler.
     * @param {Object} update - The connection update object.
     */
    return async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "close") {
            const error = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(color(`Connection closed. Error: ${error}`, "red"));

            // Handle different disconnect reasons
            switch (error) {
                case DisconnectReason.badSession:
                    console.log(`Bad Session File, Please Delete Session and Scan Again`);
                    deleteSessionFolder();
                    await sendNotification(`Kalorize Bot Logged Out! : Bad Session File, Please Delete Session and Scan Again`);
                    process.exit(1);
                    break;
                case DisconnectReason.connectionClosed:
                    console.log("Connection closed, reconnecting....");
                    await reconnect();
                    break;
                case DisconnectReason.connectionLost:
                    console.log("Connection Lost from Server, reconnecting...");
                    await reconnect();
                    break;
                case DisconnectReason.connectionReplaced:
                    console.log("Connection Replaced, Another New Session Opened, Please Restart Bot");
                    process.exit();
                    break;
                case DisconnectReason.loggedOut:
                    console.log(`Device Logged Out, Deleting Session Folder ${SESSION_NAME} and Exiting.`);
                    deleteSessionFolder();
                    await sendNotification(`Kalorize Bot Logged Out!`);
                    process.exit(1);
                    break;
                case DisconnectReason.restartRequired:
                    console.log("Restart Required, Restarting...");
                    await reconnect();
                    break;
                case DisconnectReason.timedOut:
                    console.log("Connection TimedOut, Reconnecting...");
                    await reconnect();
                    break;
                default:
                    console.log(`Unknown DisconnectReason: ${error}|${connection}`);
                    await reconnect();
                    break;
            }
        } else if (connection === "open") {
            retries = 0; // Reset retry counter on successful connection
            // Create random number from 0 - 1000
            const random = Math.floor(Math.random() * 1000);
            console.log(color("Bot successfully connected to server", "green"));
            await sendNotification(`Kalorize Bot Started! randID(${random})`);
        }
    };
}

// Export the function for use in other modules
module.exports = handleConnectionUpdate;