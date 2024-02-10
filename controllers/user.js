const Users = require("../model/users");
const { BadRequestError, ConflictError, NotFoundError, NotAuthorizedError } = require("../errors");
const sendEmail = require("../middleware/sendEmail");
const crypto = require("crypto");
const { Admin, SuperAdmin } = require("../model/admin");
const bcrypt = require("bcrypt");
const { verify } = require("jsonwebtoken")

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    const { adminID } = req.params;


    const admin = req.users.role === "SuperAdmin" ? await SuperAdmin.findById(adminID) : await Admin.findById(adminID);
    /**CHECK IF USER EXISTS*/
    if (!admin) {
        throw new NotFoundError(`No admin with id: ${adminID} was found...`);
    }

    /**CHECK  IF USERS SUBMIT'S EMPTY FORM*/
    if (!username || !email || !password) {
        throw new BadRequestError("All fields are required...");
    }

    /**CHECK IF USERS EXISTS */
    const users = await Users.findOne({ username });

    if (users) {
        throw new ConflictError("User already exists");
    }

    /**HARSH USER PASSWORD */
    const harshedPassword = await bcrypt.hash(password, 10)//10 salt rounds
    if (admin) {
        const createdUser = new Users({
            username,
            email,
            password: harshedPassword,
            adminID: req.users.role === "Admin" ? req.users.id : admin.createdBy,
            superAdminID: req.users.role === "SuperAdmin" ? req.users.id : admin.createdBy
        });

        if (createdUser) {
            await createdUser.save();

            const randtok = createdUser.createUserVerificationToken();
            const link = `http://localhost:5173/verify-user-page/${randtok}`;

            const token = createdUser.JWT_TOK();

            /**SEND MAIL ALGORITHM */
            const from = process.env.SMTP_MAIL;
            const to = createdUser.email;
            const subject = `Welcome ${createdUser.username}`
            const message = `
            <p>An account has been created for you by <b>${admin.username}</b>\nIf you are not aware of this email, ignore\nclick on the link below to verify your account</p>
            ${link}
        `
            await sendEmail(from, to, subject, message);

            return res.status(201).json({
                createdBy: admin.username,
                message: `You have successfully created a user ${createdUser.username}`,
                token,
                username: createdUser.username
            })
        }
    }
}

/**USER CREATE ACCOUNT*/
const UserRegisterUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
        throw new BadRequestError(`All feilds are required`)
    }

    const user = await Users.findOne({ username });
    if (user) {
        throw new BadRequestError(`the user with username: ${username} already exists`)
    }

    const harshedPassword = await bcrypt.hash(password, 10);

    const userObject = {
        username,
        password: harshedPassword,
        email
    }

    const createdUser = new Users(userObject);

    if (createdUser) {
        await createdUser.save();
        const token = createdUser.JWT_TOK()

        const randtok = createdUser.createUserVerificationToken();
        const link = `http://localhost:5173/verify-user-page/${randtok}`;


        /**SEND MAIL ALGORITHM */
        const from = process.env.SMTP_MAIL;
        const to = createdUser.email;
        const subject = `Welcome ${createdUser.username}`
        const message = `
            <p>Click on the link below to verify your account </p>
            ${link}
        `
        await sendEmail(from, to, subject, message);


        res.status(201).json({
            message: `account created successfully, visit ${email} to verify your account`,
            username: username,
            token: token,
            role: createdUser.role
        })
    }
}


/**VERIFY USER */
const verifyUser = async (req, res) => {
    const token = crypto.createHash("sha256").update(req.params.tokID).digest("hex");

    /**FIND USER */
    const user = await Users.findOne({ userVerificationToken: token });

    if (user) {
        return res.status(200).json({ msg: `${user.username} verified successfully` })
    } else {
        return res.status(400).json({ msg: "No user was found" });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    /**CHECK IF FIELDS ARE EMPTY */
    if (!email || !password) {
        throw new BadRequestError("All fields are required");
    }

    /**FIND USERS */
    const user = await Users.findOne({ email });

    if (!user) {
        throw new NotFoundError("No user was found")
    }

    /**COMPARE PASSWORD */
    const isPassword = await user.isPasswordOk(password);

    if (!isPassword) {
        throw new NotAuthorizedError("Enter a valid password");
    }

    /**TOKEN */
    const token = user.JWT_TOK();

    /**SEND RESPONSE */
    res.status(200).json({
        username: user.username,
        token,
        role: user.role
    });
}

/**ADMIN AND SUPER ADMIN DELETE USER */

const deleteUser = async (req, res) => {
    /**CHECKING FOR ROLE*/
    const { AdminID, Aid } = req.params;

    const admin = req.users.role === "SuperAdmin" ? await SuperAdmin.findById(AdminID) : await Admin.findById(AdminID);

    if (!admin) {
        throw new NotFoundError("No id found for admin or super admin, make sure you are using the correct token");
    }

    if (admin) {
        const deleteUser = await Users.findByIdAndDelete(Aid, { new: false, returnOriginal: true }).select("-password");
        if (!deleteUser) {
            throw new NotFoundError(`No user with the id: ${Aid} was found`)
        }
        res.status(200).json(deleteUser);
    } else {
        throw NotAuthorizedError("You are not authorized to delete this post.")
    }
}

/**SUPER ADMIN REMOVE EVERY */
const deleteRecursively = async (req, res) => {
    const { AdminID } = req.params;

    const admin = req.users.role === "SuperAdmin" ? await SuperAdmin.findById(AdminID) : await Admin.findById(AdminID);

    if (!admin) {
        throw new NotFoundError("No id found for admin or super admin, make sure you are using the correct token");
    }

    if (admin.role === "SuperAdmin") {
        const deleteUser = await Users.deleteMany({});
        if (!deleteUser) {
            throw new NotFoundError(`No user with the id: ${Aid} was found`)
        }
        res.status(200).json({ msg: `Database has cleared of all users` });
    } else {
        throw NotAuthorizedError("You are not authorized to delete this post.")
    }
}


/**SUPER ADMIN AND ADMIN BLOCK USER ACCOUNT */



/**SUPER ADMIN AND ADMIN MODIFY USER*/
const adminModifyUsers = async (req, res) => {
    const { AdminID, Aid } = req.params;
    const { username, email } = req.body;

    const admin = req.users.role === "SuperAdmin" ? await SuperAdmin.findById(AdminID) : await Admin.findById(AdminID);
    /**CHECK FOR ADMIN */
    if (!admin) {
        throw new NotFoundError("No id found for admin and super admin");
    }

    if (admin) {
        const updateUser = await Users.findByIdAndUpdate(Aid, { username, email }, { new: true, returnOriginal: false });
        if (!updateUser) {
            throw new NotFoundError(`No user found with the id: ${Aid}`)
        }
        res.status(200).json({ msg: updateUser })
    } else {
        throw NotAuthorizedError("You are not authorized to delete this post.")
    }
}

/**USER CHANGE USERNAME AND EMAIL */
const userChangeUserNameAndEmail = async (req, res) => {
    const { username, email, password } = req.body;
    const { Aid } = req.params;

    if (password) {
        throw new BadRequestError("you can't change your password via this route");
    }

    /**NODIFYING USERS */
    const modifyUserByUser = await Users.findByIdAndUpdate(Aid, { username, email });
    if (modifyUserByUser) {
        res.status(200).json({ msg: `user modified successfully...` })
    } else {
        throw new NotFoundError(`No user with the id ${Aid} was found`);
    }
}

/**USER CHANGE PASSWORD */

/**USER STAY LOGGED IN */
const stayLoggedIn = (req, res) => {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith("Bearer")) {
        throw new NotAuthorizedError("Please provide a valid token");
    }

    const token = authHeaders.split(" ")[1];

    try {
        const decode = verify(token, process.env.JWT_SECRET);
        res.status(200).json(decode);
    } catch (error) {
        throw new NotAuthorizedError("Token not verified...");
    }
}

const adminGetAllUsers = async (req, res) => {

    const admin = req.users.role === "SuperAdmin" ? await SuperAdmin.findById(req.users.id) : await Admin.findById(req.users.id);

    if (!admin) {
        throw new NotFoundError("No id found for admin or super admin, make sure you are using the correct token");
    }

    if (admin) {
        const adminGetAllUsers = await Users.find({}).select("-password");
        if (!adminGetAllUsers) {
            throw new NotFoundError(`No user was found`)
        }
        res.status(200).json(adminGetAllUsers);
    } else {
        throw NotAuthorizedError("You are not authorized to delete this post.")
    }
}

module.exports = { registerUser, verifyUser, loginUser, deleteUser, userChangeUserNameAndEmail, stayLoggedIn, UserRegisterUser, deleteRecursively, adminModifyUsers, adminGetAllUsers };