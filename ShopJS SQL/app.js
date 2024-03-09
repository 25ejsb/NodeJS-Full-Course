const express = require("express");
const bodyParser = require("body-parser")
const path = require("path")
const expressHbs = require("express-handlebars")

const app = express()

const sequelize = require("./helpers/database")
const User = require("./models/user")

app.set('ejs', path.join(__dirname, 'views'))
app.set("view engine", 'ejs')

const adminRoutes = require("./routes/admin")
const shopRoutes = require("./routes/shop")
const routes404 = require("./controllers/404");
const Product = require("./models/product");
const Cart = require("./models/cart")
const CartItem = require("./models/cart-item")
const Order = require("./models/order")
const OrderItem = require("./models/order-items")

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        req.user = user;
        next();
    })
})

// make main middleware at the bottom

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(routes404.get404Page)

// relationships
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});

sequelize.
sync()
.then(result => {
    return User.findByPk(1);
    // console.log(result);
  })
.then(result => {
    if (!result) {
        return User.create({name: "Eitan", email: "eitantravels25@gmail.com"})
    }
    return result;
}).then(user => {
    return user.createCart()
}).then(

).then(user => {
    console.log(user)
    app.listen(5000)
}).catch(err => {
    console.log(err)
})
