const CustomApiError = require("./customApiError");

class ConflictError extends CustomApiError {
    constructor(message) {
        super(message);
        this.statusCode = 409;
    }
}

module.exports = ConflictError;