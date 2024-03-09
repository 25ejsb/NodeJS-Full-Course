exports.get404Page = (req, res, next) => {
    res.status(404).render("404", {docTitle: "Page 404 Not Found", isAuthenticated: req.session.isLoggedIn})
}

exports.get500 = (req, res, next) => {
    res.status(500).render("500", {
        docTitle: "International Error",
        isAuthenticated: req.session.isLoggedIn
    })
}