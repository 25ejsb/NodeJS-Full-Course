const express = require("express")
const path = require("path")

const rootDir = require("../helpers/path")

router = express.Router()

router.get("/signup", (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'signup.html'))
})

router.post("/register", (req, res, next) => {
    console.log(req.body['input-user'])
    res.redirect("/")
})

module.exports = router