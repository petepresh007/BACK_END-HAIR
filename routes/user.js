const express = require("express");
const { registerUser, loginUser, verifyUser, deleteUser, userChangeUserNameAndEmail, stayLoggedIn, UserRegisterUser, deleteRecursively, adminModifyUsers, adminGetAllUsers } = require("../controllers/user");
const { validateRegistration } = require("../middleware/validateUsernameAndPassword");
const authentication = require("../middleware/authentication");


const router = express.Router();

router.post("/register_user/:adminID", validateRegistration, authentication, registerUser);
router.post("/register_user", validateRegistration, UserRegisterUser)
router.post("/login_user", loginUser);
router.post("/validate_user/:tokID", verifyUser);

/**STAY LOGGED IN */
router.get("/stay_logged_in", stayLoggedIn);

/**USER MODIFY ACCOUNT */
router.patch("/user_modify_account/:Aid", userChangeUserNameAndEmail);
/**ADMIN MODIFY ACC */
router.patch("/admin_update_user/:AdminId/:Aid", adminModifyUsers);


router.delete("/delete_user/:AdminID/:Aid", authentication, deleteUser);
/**CLEAR ALL USERS */
router.delete("/delete_all_user/:AdminID", authentication, deleteRecursively);

router.get("/admin_get_all", authentication, adminGetAllUsers)

module.exports = router;
