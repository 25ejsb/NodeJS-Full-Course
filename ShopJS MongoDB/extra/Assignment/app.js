const express = require("express")
const fs = require("fs")
const app = express()

app.use("/users", (req, res, next) => {
    const method = req.method
    if (method === "POST") {
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        });
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString()
            const message = parsedBody.split("=")[1].replace("+", " ")
            fs.writeFileSync("user.txt", message)
        })
    }
    res.send("Hello")
})

app.use("/", (req, res, next) => {
    res.send("<body><form action='/users' method='POST'><input type='text' name='users'><button type='submit'>Submit</button></form></body>")
})

app.listen(5000)