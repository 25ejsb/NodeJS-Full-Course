const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")

const mainDir = require("./routes/main")
const apiDir = require("./routes/api")

const app = express()

app.set("ejs", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

app.use(mainDir)
app.use(apiDir.router)

app.use((req, res, next) => {
    res.status(404).render("404", {docTitle: "Page 404 Not Found"})
})

app.listen(5000)