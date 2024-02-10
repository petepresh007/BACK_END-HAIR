const Product = require("../model/product");
const { SuperAdmin, Admin } = require("../model/admin");
const { ConflictError, NotAuthorizedError } = require("../errors")
const deleteFiles = require("../middleware/deletefiles");
const { join } = require("path");
const { existsSync } = require("fs");

const createProduct = async (req, res) => {
    const { name, description, price, productType, date } = req.body;
    const admin = req.users.id === "SuperAdmin" ? await SuperAdmin.findById(req.user.id) : await SuperAdmin.findById(req.user.id);

    /**FILE TO STORE */
    const files = req.file
    const file_upload = join(files.filname);

    /**MAKE SURE AN EMPTY FIELD IS NOT SUBMITTED*/
    if (!name || !description || !price || !productType || !files) {

    }

    /**CHECK FOR ADMIN */
    if (!admin) {
        throw new NotAuthorizedError(`No admin with the id: ${req.users.id}`);
    }

    const existingProduct = await Product.findOne({ description: description, file: file_upload });

    /**CHECKING IF RECORD EXISTS */
    if (existingProduct) {
        const file_path = join(__dirname, "upload", files.filename);
        if (existsSync(file_path)) {
            deleteFiles(file_path)
        }
        throw new ConflictError("The product already exists")
    }

    /**CREATE NEW RECORD */
    const createdProduct = new Product({
        name: name,
        description: description,
        price: price,
        file: file_upload,
        productType: productType,
        date: date ? new Date(date) : new Date()
    });

    if(createdProduct){
        res.status(201).json(createdProduct);
    }

}



module.exports = {createProduct}