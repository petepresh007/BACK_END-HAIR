const fs = require("fs");
/**FUNCTION TO DEL IMAGES */
async function deleteImages(imagepath) {
    fs.unlink(imagepath, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("image has been deleted successfully")
        }
    })
}
/**FUNCTION TO DEL IMAGES */

module.exports = deleteImages;