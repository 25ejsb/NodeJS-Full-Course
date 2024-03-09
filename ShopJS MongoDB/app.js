const express = require("express");
const bodyParser = require("body-parser")
const path = require("path")

const app = express()

const mongoConnect = require("./helpers/database").mongoConnect;
const User = require("./models/user")

app.set('ejs', path.join(__dirname, 'views'))
app.set("view engine", 'ejs')

const adminRoutes = require("./routes/admin")
const shopRoutes = require("./routes/shop");

const routes404 = require("./controllers/404")

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

// make main middleware at the bottom

app.use((req, res, next) => {
    User.findById("6529d9817c7043c7d6304741").then(user => {
        req.user = new User(user.name, user.email, user.cart, user._id);
        next()
    }).catch(err => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(routes404.get404Page)

mongoConnect((client) => {
    console.log(client);
    app.listen(5000)
})