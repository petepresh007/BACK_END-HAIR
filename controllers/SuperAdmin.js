const { SuperAdmin, Admin } = require("../model/admin");
const bcrypt = require("bcrypt");
const { BadRequestError, ConflictError, NotFoundError, NotAuthorizedError } = require("../errors");
const JWT = require("jsonwebtoken");


const registerSuperAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    /**CHECK IF A USER SUBMITS AN EMPTY FORM*/
    if (!username || !email || !password) {
        throw new BadRequestError("All fields are required")
    }

    const superAdmin = await SuperAdmin.findOne({ username });

    /**CHECK IF USER EXISTS*/
    if (superAdmin) {
        throw new ConflictError(`username: ${username} already exists, please enter another username`)
    }

    const harshedPassword = await bcrypt.hash(password, 10);
    const createdUserAdmin = new SuperAdmin({
        username,
        email,
        password: harshedPassword
    });

    if (createdUserAdmin) {
        await createdUserAdmin.save();
        const token = createdUserAdmin.JWT_TOK()
        return res.status(201).json({
            username: createdUserAdmin.username,
            adminUserID: createAdmin._id,
            token,
            role: createdUserAdmin.role
        })
    }

}

/**GET ALL SUPER ADMIN */
const getAllSuperAdmin = async (req, res) => {
    const superAdmin = await SuperAdmin.find({}).select("username email");
    if (!superAdmin) {
        throw new NotFoundError("No user was found")
    }
    return res.status(200).json({ msg: superAdmin });
}

/**LOGIN SUPER ADMIN */
async function loginSuperAdmin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError("All fields are required....")
    }
    /**FIND USER */
    const superAdmin = await SuperAdmin.findOne({ email });

    if (!superAdmin) {
        throw new NotFoundError(`No user was found with the email ${email}`)
    }
    /**CHECK IF PASSWORD IS VALID */
    const ispasswordOk = await superAdmin.checkPassword(password);

    if (!ispasswordOk) {
        throw new ConflictError("Please enter valid credentials ")
    }

    /**GENERATE TOKEN */
    const token = superAdmin.JWT_TOK();

    /**SEND RESPONSE */
    res.status(200).json({ username: superAdmin.username, token, role: superAdmin.role });

}

/**ADMIN STAY LOGGED IN*/
const stayLoggedIn = (req, res) => {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith("Bearer")) {
        throw new NotAuthorizedError("Please provide a valid token");
    }
    const token = authHeaders.split(" ")[1];

    try {
        const decode = JWT.verify(token, process.env.JWT_SECRET);
        res.status(200).json(decode);
    } catch (error) {
        throw new NotAuthorizedError("Token not verified...");
    }
}


/**CREATE ADMIN*/
const createAdmin = async (req, res) => {
    const { SuperAdminID } = req.params;

    const { username, email, password, date } = req.body;

    if (!username || !email || !password) {
        throw new BadRequestError("All fields are required...");
    }

    const superAdmin = await SuperAdmin.findOne({ _id: SuperAdminID });

    if (!superAdmin) {
        throw new NotFoundError(`No user found with the id: ${SuperAdminID}`);
    }
    /**CHECKING IF USER EXISTS */
    const checkAdmin = await Admin.findOne({ username });
    if (checkAdmin) {
        throw new ConflictError("User already exists");
    }

    const harshedPassword = await bcrypt.hash(password, 10)//ten salt roounds

    const admin = new Admin({
        username,
        email,
        password: harshedPassword,
        createdBy: SuperAdminID,
        date: date ? new Date(date) : new Date()
    })

    await admin.save();
    const token = JWT.sign({ username: admin.username, id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
        SuperAdminId: superAdmin._id,
        username: admin.username,
        email: admin.email,
        date: new Date(admin.date).toDateString(),
        message: `you have succesfully created admin: ${admin.username}`,
        token
    })

}

const editSuperAdmin = async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    const editUser = await SuperAdmin.findByIdAndUpdate({ _id: id }, { username, email }, { new: true }).select("-password");
    if (!editUser) {
        throw new NotFoundError(`No user with the id: ${id}`);
    }
    return res.status(200).json({ msg: editUser });
}


const RemoveAllSuperAdmin = async (req, res) => {
    const removeAllSuperAdmin = await SuperAdmin.deleteMany({});
    if (removeAllSuperAdmin) {
        res.status(200).json({ msg: `All superAdmin have been deleted` });
    }
}


module.exports = {
    registerSuperAdmin,
    getAllSuperAdmin,
    createAdmin,
    RemoveAllSuperAdmin,
    editSuperAdmin,
    loginSuperAdmin,
    stayLoggedIn
};
