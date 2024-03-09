const express = require("express")
const { check, body } = require("express-validator")

const authController = require("../controllers/auth")
const User = require("../models/user")

const router = express.Router();
router.get("/login", authController.getLogin)
router.post("/login", [
    check("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(), 
    body("password", "Password is incorrect").isLength({min: 5}).isAlphanumeric().trim(),
], authController.postLogin)
router.post("/logout", authController.postLogout)
router.get("/signup", authController.getSignUp)
router.post("/signup", [check('email').isEmail().withMessage("Please enter a valid email").custom((value, {req}) => {
        return User.findOne({email: value}).then(userDoc => {
            if (userDoc) {
                return Promise.reject("E-mail exists already, please pick a different one.");
            }
        })
    }).normalizeEmail(), 
    body(
        "password", 
        "Password can only be alphanumeric characters, min length of 5").isLength({min: 5}
    ).isAlphanumeric().trim(),
    body('confirmPassword').custom((value, {req}) => {
        if (value === req.body.password) {
            throw new Error("Password have to match!")
        }
        return true;
    })
], authController.postSignUp)
router.get("/reset", authController.getReset)
router.post("/reset", authController.postReset)
router.get("/reset/:token", authController.getNewPassword)
router.post("/new-password", authController.postNewPassword)

module.exports = router