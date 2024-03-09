const mongodb = require("mongodb")
const Product = require("../models/product")

const Object = mongodb.ObjectId;

// exports are like functions globally like modules
exports.getAddProduct = (req, res, next) => {
    res.render("admin/add-product", {docTitle: "Add Product", editing: false})
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description
    const product = new Product(title, price, description, imageUrl, null, req.user._id)
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
        res.render("admin/edit-product", {docTitle: "Edit Product", editing: editMode, product: product})
    }).catch(err => console.log(err))
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const product = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, new Object(prodId))
    product.save().then(result => {
        console.log('Updated Product');
        res.redirect("/admin/products")
    }).catch(err => console.log(err))
    res.redirect("/admin/adminproducts")
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId).then(() => {
        res.redirect("/admin/adminproducts")
    }).catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render("shop/index", {products: products, docTitle: "Shop - Main Page"})
    }).catch(err => console.log(err))
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productid;
    // Product.findAll({where: {id: prodId}}).then(products => {
    //     res.render("shop/product-detail", {
    //         product: products[0],
    //         docTitle: products[0].title
    //     })
    // })
    Product.findById(prodId).then(product => {
        res.render("shop/product-detail", {
            product: product,
            docTitle: product.title
        })
    }).catch(err => console.log(err));
}

exports.products = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render("shop/product-list", {products: products, docTitle: "Shop - Products"})
    }).catch(err => console.log(err))
}

exports.cart = (req, res, next) => {
    req.user.getCart().then(products => {
        res.render("shop/cart", {docTitle: "Shop - Cart List", products: products})
    }).catch(err => console.log(err))
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
    const products = Product.fetchAll().then(products => {
        res.render("admin/products", {products: products, docTitle: "Shop - Admin Products"})
    }).catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders().then(orders => {
        res.render("shop/orders", {docTitle: "Shop - Orders", orders: orders})
    }).catch(err => console.log(err))
}

exports.postOrder = (req, res, next) => {
    req.user.addOrder().then(result => {
        res.redirect("/orders")
    }).catch(err => console.log(err))
}