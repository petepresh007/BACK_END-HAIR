class CustomApiError extends Error {
    constructor(message) {
        super(message);
        // this.statusCode = statusCode;
    }
}

module.exports = CustomApiError;