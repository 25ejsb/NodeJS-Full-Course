const express = require("express")
const path = require("path")

const rootDir = require('../helpers/path')

router = express.Router()

router.get("/", (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'index.html'))
})

module.exports = router