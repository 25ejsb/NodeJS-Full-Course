const express = require("express")

const accounts = [];

const router = express.Router()

router.post("/account", (req, res, next) => {
    accounts.push(req.body)
    console.log(accounts)
    res.redirect("/")
})

module.exports.router = router;
module.exports.accounts = accounts;