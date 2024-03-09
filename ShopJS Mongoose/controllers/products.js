const Product = require("../models/product")
const Order = require("../models/order")

// exports are like functions globally like modules
exports.getAddProduct = (req, res, next) => {
    res.render("admin/add-product", {docTitle: "Add Product", editing: false, isAuthenticated: req.session.isLoggedIn})
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description
    const product = new Product({title: title, price: price, description: description, imageUrl: imageUrl, userId: req.user})
    product.save().then(result => {
        console.log(result)
        res.redirect("/")
    }).catch(err => {
        console.log(err)
    })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/")
    }
    const prodId = req.params.productId;
    Product.findById(prodId).then(product => {
        if (!product) {
            return res.redirect("/")
        }
        res.render("admin/edit-product", {docTitle: "Edit Product", editing: editMode, product: product, isAuthenticated: req.session.isLoggedIn})
    }).catch(err => console.log(err))
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    Product.findById(prodId).then(product => {
        product.title = updatedTitle
        product.price = updatedPrice
        product.description = updatedDescription
        product.imageUrl = updatedImageUrl
        return product.save()
    }).then(result => {
        res.redirect("/")
    }).catch(err => console.log(err))
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId).then(() => {
        res.redirect("/admin/adminproducts")
    }).catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
    // .select("title price -_id") selects certain items
    // populate("userId") gets info from user
    Product.find().then(products => {
        res.render("shop/index", {products: products, docTitle: "Shop - Main Page", isAuthenticated: req.session.isLoggedIn})
    }).catch(err => console.log(err))
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productid;
    Product.findById(prodId).then(product => {
        res.render("shop/product-detail", {
            product: product,
            docTitle: product.title,
            isAuthenticated: req.session.isLoggedIn
        })
    }).catch(err => console.log(err));
}

exports.products = (req, res, next) => {
    Product.find().then(products => {
        res.render("shop/product-list", {products: products, docTitle: "Shop - Products", isAuthenticated: req.session.isLoggedIn})
    }).catch(err => console.log(err))
}

exports.cart = (req, res, next) => {
    if (req.session.isLoggedIn === true) {
        req.user.populate("cart.items.productId").then(user => {
            const products = user.cart.items;
            res.render("shop/cart", {docTitle: "Shop - Cart List", products: products, isAuthenticated: req.session.isLoggedIn})
        }).catch(err => console.log(err))
    } else {
        res.redirect("/login")
    }
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then(product => {
        return req.user.addToCart(product)
    }).then(result => {
        console.log(result);
        res.redirect("/cart")
    }).catch(err => console.log(err))
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteItemFromCart(prodId).then(result => {
        res.redirect("/cart")
    }).catch(err => console.log(err))
}

exports.adminProducts = (req, res, next) => {
    const products = Product.find().then(products => {
        res.render("admin/products", {products: products, docTitle: "Shop - Admin Products", isAuthenticated: req.session.isLoggedIn})
    }).catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
    if (req.session.isLoggedIn === true) {
        Order.find({"user.userId": req.user._id}).then(orders => {
            res.render("shop/orders", {docTitle: "Shop - Orders", orders: orders, isAuthenticated: req.session.isLoggedIn})
        }).catch(err => console.log(err))
    } else {
        res.redirect("/login")
    }
}

exports.postOrder = (req, res, next) => {
    req.user.populate("cart.items.productId").then(user => {
        const products = user.cart.items.map(i => {
            return {quantity: i.quantity, product: {...i.productId._doc}}
        });
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            products: products
        })
        return order.save().then(result => {
            return req.user.clearCart();
        }).then(() => {
            res.redirect("/orders")
        }).catch(err => console.log(err))
    })
}