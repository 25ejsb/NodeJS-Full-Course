const express = require("express");
const bodyParser = require("body-parser")
const path = require("path")
const expressHbs = require("express-handlebars")

const app = express()

app.engine('handlebars', expressHbs.engine(
    {
        extname: 'hbs',
        defaultLayout: 'layout',
    }
))
app.set('ejs', path.join(__dirname, 'views'))
app.set("view engine", 'ejs')

const adminRoutes = require("./routes/admin")
const shopRoutes = require("./routes/shop")
const routes404 = require("./controllers/404")

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

// make main middleware at the bottom

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(routes404.get404Page)

app.listen(5000)