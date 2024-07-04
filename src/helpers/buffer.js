const axios = require("axios");
const fs = require("fs");

async function getBuffer(url, options = {}) {
    try {
        const res = await axios({
            method: "get",
            url,
            headers: {
                DNT: 1,
                "Upgrade-Insecure-Request": 1,
            },
            ...options,
            responseType: "arraybuffer",
        });
        return res.data;
    } catch (err) {
        return err;
    }
}

module.exports = { getBuffer };
