const { Schema, model, default: mongoose } = require("mongoose");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { SuperAdmin, Admin } = require("../model/admin");

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        min: 8,
        max: 12
    },
    email: {
        type: String,
        required: [true, "please, enter an email address"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true
    },
    password: {
        type: String,
        required: [true, "password is required to loging...."],
        max: 4,
        min: 8
    },
    adminID: {
        type: mongoose.Types.ObjectId,
        ref: "SuperAdmin",
    },
    superAdminID: {
        type: mongoose.Types.ObjectId,
        ref: "Admin",
    },
    role: {
        type: String,
        default: "users",
        enum: ["users"],
        required: true,
    },
    userVerificationToken: String
}, { timestamps: true });

/**SCHEMA METHODS */
userSchema.methods.JWT_TOK = function () {
    return JWT.sign({ username: this.username, id: this.id, role: this.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
}
//checkpassword
userSchema.methods.isPasswordOk = async function (pass) {
    const isPasswordOk = await bcrypt.compare(pass, this.password);
    console.log(isPasswordOk)
    return isPasswordOk;
}

/**USER VERIFICATION METHOD */
userSchema.methods.createUserVerificationToken = function () {
    const resetTok = crypto.randomBytes(32).toString("hex");
    this.userVerificationToken = crypto.createHash("sha256").update(resetTok).digest("hex");

    return resetTok;
}

/**EXPORT */
module.exports = model("Users", userSchema);