const fs = require("fs")

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;
    if (url === "/") {
        res.write("<body><form action='/message' method='POST'><input type='text' name='message'><button type='submit'>Send</button></form></body>")
        return res.end()
    }
    if (url === "/message" && method === "POST") {
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }); 
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split("=")[1]
            fs.writeFileSync("message.txt", message, err => {
                res.statusCode = 302;
                res.setHeader("Location", "/")
                return res.end()
            })
        })
    }
    // process.exit()
    res.setHeader("Content-Type", "text/html")
    res.write("<h1>Hello world</h1>")
    res.end()
};

// module.exports = {
//     handler: requestHandler,
//     someText: 'Some hard coded text'
// };

exports.handler = requestHandler;
exports.someText = 'Some hard coded text';