const app = require("express")()

app.get("/", (req, res, next) => {
    res.send("Hello world!")
})

app.listen(5000, () => {
    console.log("Server is running");
})