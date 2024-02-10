const { NotAuthorizedError } = require("../errors");
const { verify } = require("jsonwebtoken");


const authentication = (req, res, next) => {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith("Bearer")) {
        throw new NotAuthorizedError("Please provide a valid token");
    }

    const token = authHeaders.split(" ")[1];

    try {
        const decode = verify(token, process.env.JWT_SECRET);
        req.users = { username: decode.username, id: decode.id, role: decode.role }
        next();
    } catch (error) {
        throw new NotAuthorizedError("Token not verified...");
    }
}


module.exports = authentication;