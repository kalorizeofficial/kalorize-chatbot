/**
 * Menangani unhandled rejections dan exception yang tidak tertangkap.
 * @param {Object} client - Objek klien WhatsApp.
 */
function handleRejection(client) {
    // Membuat Map untuk menyimpan unhandled rejections
    const unhandledRejections = new Map();

    /**
     * Event listener untuk menangani unhandled rejections.
     * Menyimpan pasangan promise dan alasan rejection ke dalam Map.
     * Mencatat informasi unhandled rejection ke konsol.
     */
    process.on("unhandledRejection", (reason, promise) => {
        unhandledRejections.set(promise, reason);
        console.log("Unhandled Rejection at:", promise, "reason:", reason);
    });

    /**
     * Event listener untuk menangani rejection yang telah ditangani.
     * Menghapus pasangan promise dan alasan rejection dari Map.
     */
    process.on("rejectionHandled", (promise) => {
        unhandledRejections.delete(promise);
    });

    /**
     * Event listener untuk menangani exception yang tidak tertangkap.
     * Mencatat informasi exception ke konsol.
     */
    process.on("Something went wrong", function (err) {
        console.log("Caught exception: ", err);
    });
}

module.exports = handleRejection;