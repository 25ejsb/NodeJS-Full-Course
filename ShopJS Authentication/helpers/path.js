const path = require("path")
const fs = require("fs")

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw (err);
        }
    })
}


module.exports.path = path.dirname(process.mainModule.filename)
module.exports.deleteFile = deleteFile