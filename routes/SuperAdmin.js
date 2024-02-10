const { registerSuperAdmin, getAllSuperAdmin, createAdmin, RemoveAllSuperAdmin, editSuperAdmin, loginSuperAdmin, stayLoggedIn } = require("../controllers/SuperAdmin");
const { removeAllAdmin, deletAdmin, getSingleAdmin, getAllAdmin, modifyAdmin, loginAdmin, adminUpdateProfile, adminLoggedIn } = require("../controllers/admin");

const express = require("express");
const router = express.Router();
const { validateRegistration } = require("../middleware/validateUsernameAndPassword");
const authentication = require("../middleware/authentication");

/**ROUTES */
router.post("/", validateRegistration, registerSuperAdmin);
router.get("/", getAllSuperAdmin);
router.patch("/:id", editSuperAdmin);
router.delete("/", RemoveAllSuperAdmin);
router.post("/login_super", /**validateRegistration,*/ loginSuperAdmin);
router.get("/A_profile", stayLoggedIn)
router.get("/admin-stay-log", adminLoggedIn);




/**CREATE ADMIN */
router.post("/:SuperAdminID/admin", validateRegistration, authentication, createAdmin);


/**OTHER ADMIN ROUTES */
router.post("/admin/login_admin", /*validateRegistration,*/ /**authentication,*/ loginAdmin);
router.route("/admin/:Aid").delete(authentication, deletAdmin).patch(authentication, modifyAdmin)//.delete(authentication,removeAllAdmin);
router.get("/admin/:Aid", authentication, getSingleAdmin);

router.get("/admin", authentication, getAllAdmin);
router.delete("/admin", authentication, removeAllAdmin);
router.patch("/adminupdate/:AdminID", validateRegistration, adminUpdateProfile)


module.exports = router;