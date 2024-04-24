const fs = require("fs")

const app = require("express")()

app.get("/", (req, res, next) => {
    fs.readFile("my-page.html", "utf-8", (err, data) => {
        res.send(data)
    })
})

app.listen(8080)