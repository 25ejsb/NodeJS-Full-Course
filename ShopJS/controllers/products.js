const Product = require("../models/product")
const Cart = require("../models/cart")

// exports are like functions globally like modules
exports.getAddProduct = (req, res, next) => {
    res.render("admin/add-product", {docTitle: "Add Product", editing: false})
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description
    const product = new Product(null, title, imageUrl, description, price);
    product.save()
    res.redirect("/")
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if (!editMode) {
        return res.redirect("/")
    }
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect("/")
        }
        res.render("admin/edit-product", {docTitle: "Edit Product", editing: editMode, product: product})
    })
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedDescription, updatedPrice)
    updatedProduct.save()
    res.redirect("/admin/adminproducts")
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId);
    res.redirect("/admin/adminproducts")
}

exports.getProducts = (req, res, next) => {
    // products is the callback in product
    const products = Product.fetchAll(products => {
        res.render("shop/index", {products: products, docTitle: "Shop - Main Page"})
    })
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productid;
    Product.findById(prodId, product => {
        res.render("shop/product-detail", {docTitle: `Product - ${product.title}`, product: product})
    })
}

exports.products = (req, res, next) => {
    const products = Product.fetchAll(products => {
        res.render('shop/product-list', {products: products, docTitle: 'Products'})
    })
}

exports.cart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id)
                if (cartProductData) {
                    cartProducts.push({productData: product, qty: cartProductData.qty});
                }
            }
            res.render("shop/cart", {docTitle: "Shop - Cart List", products: cartProducts})
        })
    })
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId
    Product.findById(prodId, (product) => {
        Cart.addProduct(prodId, product.price)
    })
    res.redirect("/cart")
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, product => {
        Cart.deleteProduct(prodId, product.price);
        res.redirect("/cart")
    })
}

exports.getOrders = (req, res, next) => {
    res.render("shop/orders", {docTitle: "Shop - Orders"})
}

exports.adminProducts = (req, res, next) => {
    const products = Product.fetchAll(products => {
        res.render("admin/products", {products: products, docTitle: "Shop - Admin Products"})
    })
}