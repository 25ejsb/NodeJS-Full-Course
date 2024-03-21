const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const {v4: uuidv4} = require("uuid")
const multer = require("multer")
const crypto = require("crypto")
const { createServer } = require('node:http');
const {graphqlHTTP} = require("express-graphql")

const fs = require("fs")
const {clearImage} = require("./util/file")

const graphqlSchema = require("./graphql/schema")
const graphqlResolver = require("./graphql/resolvers")
const auth = require("./middleware/auth")

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

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE")
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Authorization')
    if (req.method === "OPTIONS") {
        return res.sendStatus(200)
    }
    next()
})

app.put("/post-image", (req, res, next) => {
    if (!req.file) {
        return res.status(200).json({message: "No file provided!"})
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    return res.status(201).json({message: "File stored", filePath: req.file.path})
})

app.use(auth)

app.use("/graphql", graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
        if (!err.originalError) {
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || "An error occured"
        const code = err.originalError.code || 500;
        return {message: message, status: code, data: data};
    }
}))

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data})
})

mongoose.connect('mongodb+srv://Eitan:25Greenseed@atlascluster.0hwwlzn.mongodb.net/shop').then(result => {
    app.listen(8080)
}).catch(err => console.log(err))