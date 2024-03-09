const Product = require("../models/product")
const Cart = require("../models/cart")
const Order = require("../models/order")

const {Sequelize} = require("sequelize")
const sequelize = require("../helpers/database")

// exports are like functions globally like modules
exports.getAddProduct = (req, res, next) => {
    res.render("admin/add-product", {docTitle: "Add Product", editing: false})
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description
    Product.create({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user.id
    }).then(result => {
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
    Product.findByPk(prodId).then(product => {
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
    Product.findByPk(prodId).then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        product.imageUrl = updatedImageUrl
        return product.save()
    }).then(result => {
        console.log('Updated Product');
        res.redirect("/admin/products")
    }).catch(err => console.log(err))
    res.redirect("/admin/adminproducts")
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByPk(prodId).then(product => product.destroy()).catch(err => console.log(err))
    res.redirect("/admin/adminproducts")
}

exports.getProducts = (req, res, next) => {
    Product.findAll().then(products => {
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
    Product.findByPk(prodId).then(product => {
        res.render("shop/product-detail", {
            product: product,
            docTitle: product.title
        })
    }).catch(err => console.log(err));
}

exports.products = (req, res, next) => {
    Product.findAll().then(products => {
        res.render("shop/product-list", {products: products, docTitle: "Shop - Products"})
    }).catch(err => console.log(err))
}

exports.cart = (req, res, next) => {
    req.user.getCart().then(cart => {
        return cart.getProducts().then(products => {
            res.render("shop/cart", {docTitle: "Shop - Cart List", products: products})
        })
    }).catch(err => console.log(err))
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user
    .getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({where: {id: prodId}})
    }).then(products => {
        let product;
        if (products.length > 0) {
            product = products[0]
        }
        if (product) {
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            return product
        }
        return Product.findByPk(prodId)
    }).then(product => {
        return fetchedCart.addProduct(product, {
            through: {quantity: newQuantity}
        })
    }
    ).then(() => {
        res.redirect("/cart")
    }).catch(err => console.log(err))
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart().then(cart => {
        return cart.getProducts({where: {id: prodId}})
    }).then(products => {
        const product = products[0];
        return product.products.destroy()
    }).then(result => {
        res.redirect("/cart")
    }).catch(err => console.log(err))
}

exports.adminProducts = (req, res, next) => {
    const products = Product.findAll().then(products => {
        res.render("admin/products", {products: products, docTitle: "Shop - Admin Products"})
    }).catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']}).then(orders => {
        res.render("shop/orders", {docTitle: "Shop - Orders", orders: orders})
    }).catch(err => console.log(err))
}

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart().then(cart => {
        fetchedCart = cart;
        return cart.getProducts()
    }).then(products => {
        return req.user.createOrder().then(order => {
            return order.addProducts(products.map(product => {
                product.orderItem = {quantity: product.cartItem.quantity}
                return product;
            }))
        }).catch(err => console.log(err))
    }).then(result => {
        return fetchedCart.setProducts(null)
    }).then(result => {
        res.redirect("/orders")
    }).catch(err => console.log(err))
}