const CustomApiError = require("./customApiError");

class NotAuthorizedError extends CustomApiError {
    constructor(message) {
        super(message);
        this.statusCode = 401;
    }
}

module.exports = NotAuthorizedError;