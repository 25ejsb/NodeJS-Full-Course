const express = require("express");
const bodyParser = require("body-parser")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoDBStore = require("connect-mongodb-session")(session)

const MONGODB_URI = "mongodb+srv://Eitan:25Greenseed@atlascluster.0hwwlzn.mongodb.net/shop"

const app = express()
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions"
})

const mongoConnect = require("./helpers/database").mongoConnect;
const User = require("./models/user")

app.set('ejs', path.join(__dirname, 'views'))
app.set("view engine", 'ejs')

const adminRoutes = require("./routes/admin")
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth")

const routes404 = require("./controllers/404")

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
    session({secret: 'dosilddusnnsaioda', resave: false, saveUninitialized: false, store: store})
)

// make main middleware at the bottom

app.use((req, res, next) => {
    if (req.session.isLoggedIn === true) {
        User.findById("6531dfbe56dc686ddd763fca").then(user => {
            req.user = user;
            req.session.user = user;
            next()
        }).catch(err => console.log(err))
    } else {
        next()
    }
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use(routes404.get404Page)

mongoose.connect(MONGODB_URI).then(result => {
    User.findOne().then(user => {
        if (!user) {
            const user = new User({
                name: "Eitan",
                email: "eitantravels25@gmail.com",
                cart: {
                    items: []
                }
            })
            user.save()
        }
    })
    app.listen(5000)
}).catch(err => console.log(err))