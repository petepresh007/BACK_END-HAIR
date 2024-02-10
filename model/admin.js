const { Schema, model } = require("mongoose");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const superAdminSchema = new Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        min: 4,
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
        min: 8,
        max: 12
    },
    role: {
        type: String,
        default: "SuperAdmin",
        enum: ["SuperAdmin"],
        required: true,
    }
});

/**MIDDLEWARES */
superAdminSchema.methods.JWT_TOK = function () {
    return JWT.sign({ username: this.username, id: this.id, role: this.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

superAdminSchema.methods.checkPassword = async function (password) {
    const isPassword = await bcrypt.compare(password, this.password);
    return isPassword;
}

const SuperAdmin = model("SuperAdmin", superAdminSchema);


/**ADMIN SCHEMA */
const adminSchema = new Schema({
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
    createdBy: {
        type: String,
        required: [true, "A super admin is required..."]
    },
    role: {
        type: String,
        default: "Admin",
        enum: ["Admin"],
        required: true,
    },
    date: Date
})

const Admin = model("Admin", adminSchema);

module.exports = { Admin, SuperAdmin };