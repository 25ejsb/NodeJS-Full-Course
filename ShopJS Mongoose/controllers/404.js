exports.get404Page = (req, res, next) => {
    res.status(404).render("404", {docTitle: "Page 404 Not Found", isAuthenticated: req.session.isLoggedIn})
}