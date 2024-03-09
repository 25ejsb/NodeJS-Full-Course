const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")

const app = express()

const mainDir = require("./routes/main")
const usersDir = require("./routes/users")

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

app.use(usersDir)
app.use(mainDir)

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
})

app.listen(5000)