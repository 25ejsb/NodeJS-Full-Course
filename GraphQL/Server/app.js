const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const {v4: uuidv4} = require("uuid")
const multer = require("multer")
const crypto = require("crypto")
const { createServer } = require('node:http');

const feedRoutes = require("./routes/feed")
const authRoutes = require("./routes/auth")

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)
      
            cb(null, raw.toString('hex') + "-" + file.originalname.split(".")[0] + path.extname(file.originalname))
        })
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png"
    || file.mimetype === "image/jpeg"
    || file.mimetype === "image/jpg") {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const app = express()
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single("image"))
app.use(bodyParser.json())
app.use("/images", express.static(path.join(__dirname, "images")))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE")
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Authorization')
    next()
})

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data})
})

mongoose.connect('mongodb+srv://Eitan:25Greenseed@atlascluster.0hwwlzn.mongodb.net/shop').then(result => {
    const server = app.listen(8080)
    const io = require("./socket").init(server)
    io.on("connection", socket => {
        console.log('Client connected')
    })
}).catch(err => console.log(err))