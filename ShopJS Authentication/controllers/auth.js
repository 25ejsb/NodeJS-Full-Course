const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const sendgridTransport = require("nodemailer-sendgrid-transport")
const { validationResult } = require("express-validator")

const User = require("../models/user")

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: "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"
    }
}))

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get("Cookie").split(";")[3].trim().split("=")[1]
    if (!req.session.isLoggedIn) {
        res.render("auth/login", {docTitle: "Shop - Login", errorMessage: req.flash('error'), oldInput: {email: "", password: ""}, validationErrors: []})
    } else {
        res.redirect("/")
    }
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/login", {
            docTitle: "Shop - Login",
            errorMessage: errors.array()[0].msg,
            oldInput: {email: email, password: password},
            validationErrors: errors.array()
        })
    }
    User.findOne({email: email}).then(user => {
        if (!user) {
            req.flash('error', 'Invalid email or password.')
            return res.redirect("/login")
        }
        bcrypt.compare(password, user.password).then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true
                req.session.user = user
                req.user = user
                return req.session.save(err => {
                    console.log(err)
                    res.redirect("/")
                })
            } else {
                req.flash('error', 'Invalid email or password.')
            }
            res.redirect("/login")
        }).catch(err => {
            console.log(err);
        })
    })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/")
    })
}

exports.getSignUp = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        res.render("auth/signup", {
            docTitle: "Shop - Sign Up", 
            errorMessage: req.flash("confirm"),
            oldInput: {email: "", password: "", confirmPassword: ""},
            validationErrors: []
    })
    } else {
        res.redirect("/")
    }
}

exports.postSignUp = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.passwordconfirm
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            docTitle: "Shop - Sign Up",
            errorMessage: errors.array()[0].msg,
            oldInput: {email: email, password: password, confirmPassword: confirmPassword},
            validationErrors: errors.array()
        })
    }
    if (confirmPassword === password) {
        User.findOne({email: email}).then(userDoc => {
            if (userDoc) {
                return res.redirect("/signup")
            }
            if (email.length > 0 && password.length > 0) {
                return bcrypt.hash(password, 12).then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: {items: []}
                    })
                    return user.save()
                }).then(result => {
                    res.redirect("/login")
                    return transporter.sendMail({
                        to: email,
                        from: "eitantravels25@gmail.com",
                        subject: "Signup succeed",
                        html: "<h1>Successfully signed up</h1>"
                    })
                }).catch(err => console.log(err))
            } else {
                req.flash("confirm", "Put in email and password.")
                return res.redirect("/signup")
            }
        }).catch(err => console.log(err))
    } else {
        req.flash("confirm", "Please confirm password next time.")
        res.redirect("/signup")
    }
}

exports.getReset = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        res.render("auth/reset", {
            docTitle: "Shop - Reset Password",
            errorMessage: req.flash('error')
        })
    } else {
        res.redirect("/")
    }
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/reset")
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email}).then(user => {
            if (!user) {
                req.flash("error", "No account with that email found")
                return res.redirect("/reset")
            }
            user.resetToken = token;
            user.resetTokenExpriration = Date.now() + 3600000
            return user.save()
        }).then(result => {
            return transporter.sendMail({
                to: req.body.email,
                from: "eitantravels25@gmail.com",
                subject: "Password reset",
                html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:5000/reset/${token}">link</a> to set a new password</p>
                `
            })
        }).then(result => {
            req.flash("error", "Email was sent, please reset password there")
            res.redirect("/reset")
        }).catch(err => console.log(err))
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    // $gt meaning greater than
    User.findOne({resetToken: token, resetTokenExpriration: {$gt: Date.now()}}).then(user => {
        let message = req.flash("error")
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render("auth/new-password", {
            docTitle: 'Shop - New Password',
            errorMessage: req.flash("error"),
            userId: user._id.toString(),
            passwordToken: token
        })
    })
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    const confirmPassword = req.body.confirmPassword
    if (confirmPassword !== newPassword) {
        req.flash("error", "Confirm password doesn't match password")
        return res.redirect(`/reset/${passwordToken}`)
    }
    let resetUser;
    
    // $gt meaning greater than
    User.findOne({resetToken: passwordToken, resetTokenExpriration: {$gt: Date.now()}, _id: userId}).then(user => {
        resetUser = user
       return bcrypt.hash(newPassword, 12)
    }).then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpriration = undefined;
        return resetUser.save()
    }).then(result => {
        res.redirect("/login")
    }).catch(err => console.log(err))
}