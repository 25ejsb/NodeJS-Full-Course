const https = require("https");
const fs = require("fs")
const express = require("express");
const bodyParser = require("body-parser")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoDBStore = require("connect-mongodb-session")(session)
const csrf = require("csurf")
const flash = require("connect-flash")
const multer = require("multer")
const crypto = require("crypto")
const compression = require("compression")

const MONGODB_URI = `mongodb+srv://Eitan:25Greenseed@atlascluster.0hwwlzn.mongodb.net/shop`
console.log(MONGODB_URI)

const app = express()
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
    connectionOptions: {
      family: 4
    }
})
const csrfProtection = csrf();

// const privateKey = fs.readFileSync("server.key")
// const certificate = fs.readFileSync("server.cert")

const mongoConnect = require("./helpers/database").mongoConnect;
const User = require("./models/user")

app.set('ejs', path.join(__dirname, 'views'))
app.set("view engine", 'ejs')

const adminRoutes = require("./routes/admin")
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth")

const routes404 = require("./controllers/404");
const router = require("./routes/admin");
const morgan = require("morgan");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, `./images`)
  },
  filename: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + "-" + file.originalname.split(".")[0] + path.extname(file.originalname))
    })
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

app.use(bodyParser.urlencoded({extended: false}))
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('imageUrl'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
// IMPORTANT, without trust proxy, the server would run much slower
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'dosilddusnnsaioda',
  resave: false,
  saveUninitialized: true,
  store: store
}))
app.use(csrfProtection)
app.use(flash())
app.use(compression())
app.use(morgan("combined"))

//make main middleware at the bottom

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => {
        console.log(err);
        next(new Error(err))
      });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use(routes404.get404Page)
app.use(routes404.get500)

mongoose.connect(MONGODB_URI, {family: 4}).then(result => {
  // https.createServer({key: privateKey, cert: certificate}, app).listen(8080)
  app.listen(8080)
  console.log("http://localhost:8080")
}).catch(err => console.log(err))