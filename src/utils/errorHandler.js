
const unhandledRejection = new Map();

function setupErrorHandler(){
    process.on("unhandledRejection", (reason, promise) => {
        console.log("unhandledRejection", reason, promise);
        unhandledRejection.set(promise, reason);
    });

    process.on("rejectionHandled", (promise) => {
        console.log("rejectionHandled", promise);
        unhandledRejection.delete(promise);
    });

    process.on("uncaughtException", (error) => {
        console.log("uncaughtException", error);
        process.exit(1);
    });

    process.on("Something went wrong", (error) => {
        console.log("Something went wrong", error);
        process.exit(1);
    });

}
module.exports = { setupErrorHandler };