exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get("Cookie").split(";")[3].trim().split("=")[1]
    console.log(req.session.isLoggedIn)
    if (!req.session.isLoggedIn) {
        res.render("auth/login", {docTitle: "Shop - Login", isAuthenticated: req.session.isLoggedIn})
    }
}

exports.postLogin = (req, res, next) => {
    req.session.isLoggedIn = true;
    res.redirect("/")
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => console.log(err));
    res.redirect("/")
}