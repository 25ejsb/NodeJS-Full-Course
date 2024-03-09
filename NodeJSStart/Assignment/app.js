const http = require("http")

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
    if (url === "/") {
        res.write("<body><form action='/users' method='POST'><input type='text' name='users'><button type='submit'>Submit</button></form></body>")
        return res.end()
    }
    if (url === "/users" && method === "POST") {
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk)
        })
        let message
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString()
            message = parsedBody.split("=")[1]
            res.write(`<h1>Hello ${message}</h1>`)
            console.log(message)
        })
    }
    res.setHeader("Content-Type", "text/html")
    res.end()
})
server.listen(5000)