const { NotFoundError, BadRequestError, NotAuthorizedError } = require("../errors");
const { SuperAdmin, Admin } = require("../model/admin");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

/**LOGIN ADMIN */
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError("All fields are required....")
    }
    /**FIND USER */
    const Admins = await Admin.findOne({ email });

    if (!Admins) {
        throw new NotFoundError(`No user was found with the email ${email}`)
    }
    /**CHECK IF PASSWORD IS VALID */
    const ispasswordOk = await bcrypt.compare(password, Admins.password);
    if (!ispasswordOk) {
        throw new NotAuthorizedError("Please enter valid credentials ")
    }

    /**GENERATING A TOKEN */
    const token = JWT.sign({ username: Admins.username, id: Admins._id, role: Admins.role }, process.env.JWT_SECRET, { expiresIn: "30d" })
    return res.status(200).json({ admin: { username: Admin.username, token } });
}

const modifyAdmin = async (req, res) => {

    const { username, email } = req.body;
    const { Aid } = req.params;

    if (!username && !email) {
        throw new BadRequestError("enter either username or email")
    }

    // Fetch the existing admin
    const existingAdmin = await Admin.findOne({ _id: Aid, createdBy: req.users.id });

    if (!existingAdmin) {
        throw new NotFoundError(`No Admin found with userID ${id}`);
    }

    // Update only the specified fields
    existingAdmin.username = username ? username : existingAdmin.username;
    existingAdmin.email = email ? email : existingAdmin.email;

    // Save the updated admin
    const modifiedAdmin = await existingAdmin.save();

    res.status(200).json({ msg: `Admin updated successfully...`, data: modifiedAdmin });

}

/**GET ALL ADMIN */
const getAllAdmin = async (req, res) => {
    const findAdmin = await Admin.find({ createdBy: req.users.id }).select("-password -__v");

    if (!findAdmin) {
        throw new NotFoundError(`No Admin found in our database`);
    }

    /**FIND SUPER ADMIN */
    const super_admin = await SuperAdmin.findById(req.users.id);
    if (!super_admin) {
        throw new NotFoundError(`no super admin with the id: ${req.users.id} was found`);
    }

    const created_admin = findAdmin.map((admin) => ({
        username: admin.username,
        email: admin.email,
        id: admin._id,
        date: admin.date.toDateString()
    }));

    res.status(200).json({
        super_admin_name: super_admin.username,
        created_admin: created_admin
    });
}

/**GET SINGLE ADMIN */
const getSingleAdmin = async (req, res) => {
    const { params: { Aid }, users: { id } } = req;

    const findSingleUser = await Admin.findOne({ _id: Aid, createdBy: id }).select("-password -__v");
    if (!findSingleUser) {
        throw new NotFoundError(`No user with the id: ${Aid} was found`);
    }

    res.status(200).json({ msg: findSingleUser })
}

/**DELETE SINGLE ADMIN */
const deletAdmin = async (req, res) => {
    const { params: { Aid }, users: { id } } = req;

    const removeAdmin = await Admin.findOneAndDelete({ createdBy: id, _id: Aid });

    if (!removeAdmin) {
        throw new BadRequestError(`No Admin with the id: ${id} was found`);
    }

    res.status(200).json({ msg: `${removeAdmin.username} has been deleted successfully...` });
}

/**DELETE ALL ADMIN */
const removeAllAdmin = async (req, res) => {

    /**DELETE ALL ADMIN CREATED BY A SUPER ADMIN*/
    const removeAllAdmin = await Admin.deleteMany({ createdBy: req.users.id });
    if (removeAllAdmin) {
        res.status(200).json({ msg: `All admin deleted successfully...` });
    } else {
        throw new NotFoundError(`Super Admin with the userID ${id} has not created any admin yet`)
    }
}

/**ADMIN CHANGE USERNAME AND PASSWORD*/
async function adminUpdateProfile() {
    const { AdminID } = req.params;
    const updateAdmin = await Admin.findByIdAndUpdate(AdminID, req.body, { returnOriginal: false, new: true });
    if (updateAdmin) {
        res.status(200).json(`your profile has been updated successfully`);
    }
}

/**ADMIN STAY ONLINE */
async function adminLoggedIn(){
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

module.exports = { removeAllAdmin, deletAdmin, getSingleAdmin, getAllAdmin, modifyAdmin, loginAdmin, adminUpdateProfile, adminLoggedIn };