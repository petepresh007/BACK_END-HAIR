const { connect } = require("mongoose");

/**CONNECT DB */
function connectDB() {
    return connect(process.env.URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}


module.exports = connectDB;