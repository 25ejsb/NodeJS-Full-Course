const path = require("path")
const fs = require("fs")

const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath);
    // deletes the file
    fs.unlink(filePath, err => console.log(err))
}

exports.clearImage = clearImage