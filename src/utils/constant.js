const sessionName = "kalorize";

const {
    default: makeWaSocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode,
    proto,
    getContentType,
    Browsers,
    fetchLatestWaWebVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const axios = require("axios");
const chalk = require("chalk");
const figlet = require("figlet");
const _ = require("lodash");
const PhoneNumber = require("awesome-phonenumber");

//export 
module.exports = {
    sessionName,
    makeWaSocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode,
    proto,
    getContentType,
    Browsers,
    fetchLatestWaWebVersion,
    pino,
    Boom,
    fs,
    axios,
    chalk,
    figlet,
    _,
    PhoneNumber
};