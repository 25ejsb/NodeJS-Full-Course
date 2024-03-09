const express = require("express")
const bodyParser = require("body-parser")

const helpers = require("../helpers/path")
const api = require("./api")

const router = express.Router()

router.get("/", (req, res, next) => {
    console.log(api.accounts)
    res.render("index", {docTitle: "Register", accounts: api.accounts})
})

module.exports = router;