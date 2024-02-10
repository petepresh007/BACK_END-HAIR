const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./upload")
    },
    filename: function (req, file, callback) {
        const pictureCode = Date.now() + "-" + Math.floor(Math.random() * 1e9);
        const filename = file.originalname.split(".")[0];
        callback(null, filename + "-" + pictureCode + ".jpg")
    }
})

/**FILE TYPE */
const fileFilter = (req, file, cb) => {
    // Check if the file type is acceptable
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3, //5mb
    },
    fileFilter: fileFilter
});

module.exports = upload;
