const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const {createProduct} = require("../controllers/product");
const upload = require("../multer");


router.post("/create-product", upload.single("file") ,authentication, createProduct);



module.exports = router;