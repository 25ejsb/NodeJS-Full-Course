const fs = require("fs")
const path = require("path")

const Product = require("../models/product")
const Order = require("../models/order")

const fileHelper = require("../helpers/path")

const mongoose = require("mongoose")

const PDFDocument = require("pdfkit")

const stripe = require("stripe")(process.env.STRIPE_KEY);

const { validationResult } = require("express-validator")

const ITEMS_PER_PAGE = 3;

// exports are like functions globally like modules
exports.getAddProduct = (req, res, next) => {
    if (req.session.isLoggedIn) {
        res.render("admin/add-product", {docTitle: "Add Product", errorMessage: "", validationErrors: [], oldInput: {title: "", imageUrl: "", price: "", description: ""}, editing: false})
    } else {
        res.redirect("/login")
    }
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description
    console.log(image)
    if (image === undefined) {
        return res.status(422).render("admin/add-product", {
            docTitle: "Add Product",
            errorMessage: "Attached file is not an image",
            oldInput: {title: title, price: price, description: description},
            editing: false,
            validationErrors: []
        })
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/add-product", {
            docTitle: "Add Product",
            errorMessage: errors.array()[0].msg,
            oldInput: {title: title, price: price, description: description},
            editing: false,
            validationErrors: errors.array()
        })
    }
    const imageUrl = image.path;
    const product = new Product({title: title, price: price, description: description, imageUrl: imageUrl, userId: req.user})
    product.save().then(result => {
        console.log(result)
        res.redirect("/admin/adminproducts")
    }).catch(err => {
        console.log(err);
        const error = new Error("Creating a product failed.")
        error.httpStatusCode = 500
        return next(error)
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
        res.render("admin/edit-product", {docTitle: "Edit Product", editing: editMode, oldInput: {title: "", imageUrl: "", price: "", description: ""}, errorMessage: "", validationErrors: [], product: product})
    }).catch(err => {
        console.log(err);
        const error = new Error("Creating a product failed.")
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.file;
    const updatedDescription = req.body.description;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        Product.findById(prodId).then(product => {
            return res.status(422).render("admin/edit-product", {
                docTitle: "Edit Product",
                editing: true,
                oldInput: {title: updatedTitle, price: updatedPrice, description: updatedDescription},
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
                product: product
            })
        })
    }
    Product.findById(prodId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect("/")
        }
        product.title = updatedTitle
        product.price = updatedPrice
        product.description = updatedDescription
        if (updatedImageUrl) {
            fileHelper.deleteFile(product.imageUrl)
            product.imageUrl = updatedImageUrl.path;
        }
        return product.save()
    }).then(result => {
        res.redirect("/")
    }).catch(err => {
        console.log(err);
        const error = new Error("Creating a product failed.")
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then(product => {
        if (!product) {
            return next(new Error("Product not found"))
        }
        fileHelper.deleteFile(product.imageUrl)
    }).catch(err => next(err))
    Product.deleteOne({_id: prodId, userId: req.user._id}).then(() => {
        res.status(200).json({message: "Success"})
    }).catch(err => {
        res.status(500).json({message: err})
    })
}

exports.getProducts = (req, res, next) => {
    // .select("title price -_id") selects certain items
    // populate("userId") gets info from user
    const page = +req.query.page || 1;
    let totalItems;

    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts
        return Product.find().skip((page-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    }).then(products => {
        res.render("shop/index", {
            products: products,
            docTitle: "Shop - Main Page", 
            csrfToken: req.csrfToken(), 
            currentPage: page,
            totalProducts: totalItems, 
            hasNextPage: ITEMS_PER_PAGE*page<totalItems, 
            hasPreviousPage: page > 1, 
            nextPage: page + 1, 
            previousPage: page-1, 
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        })
    }).catch(err => {
        console.log(err);
        const error = new Error("Creating a product failed.")
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productid;
    Product.findById(prodId).then(product => {
        res.render("shop/product-detail", {
            product: product,
            docTitle: product.title,
            isAuthenticated: req.session.isLoggedIn
        })
    }).catch(err => {
        console.log(err);
        const error = new Error("Creating a product failed.")
        error.httpStatusCode = 500
        return next(error)
    });
}

exports.products = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts
        return Product.find().skip((page-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    }).then(products => {
        res.render("shop/product-list", {
            products: products, 
            docTitle: "Shop - Products",
            currentPage: page,
            totalProducts: totalItems, 
            hasNextPage: ITEMS_PER_PAGE*page<totalItems, 
            hasPreviousPage: page > 1, 
            nextPage: page + 1, 
            previousPage: page-1, 
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        })
    }).catch(err => {
        console.log(err);
        const error = new Error("Creating a product failed.")
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.cart = (req, res, next) => {
    if (req.session.isLoggedIn === true) {
        req.user.populate("cart.items.productId").then(user => {
            const products = user.cart.items;
            res.render("shop/cart", {docTitle: "Shop - Cart List", products: products})
        }).catch(err => {
            console.log(err);
            const error = new Error("Creating a product failed.")
            error.httpStatusCode = 500
            return next(error)
        })
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
    }).catch(err => {
        console.log(err);
        const error = new Error("Creating a product failed.")
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteItemFromCart(prodId).then(result => {
        res.redirect("/cart")
    }).catch(err => {
        console.log(err);
        const error = new Error("Creating a product failed.")
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.adminProducts = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        res.redirect("/login")
    }
    const page = +req.query.page || 1;
    let totalItems;
    Product.find({userId: req.user.id}).countDocuments().then(numProducts => {
        totalItems = numProducts
        return Product.find({userId: req.user.id}).skip((page-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    }).then(products => {
        res.render("admin/products", {
            products: products,
            docTitle: "Shop - Admin Products",
            currentPage: page,
            totalProducts: totalItems, 
            hasNextPage: ITEMS_PER_PAGE*page<totalItems, 
            hasPreviousPage: page > 1, 
            nextPage: page + 1, 
            previousPage: page-1, 
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        })
    }).catch(err => {
        console.log(err);
        const error = new Error("Creating a product failed.")
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.getOrders = (req, res, next) => {
    if (req.session.isLoggedIn === true) {
        Order.find({"user.userId": req.user._id}).then(orders => {
            res.render("shop/orders", {docTitle: "Shop - Orders", orders: orders})
        }).catch(err => {
            console.log(err);
            const error = new Error("Creating a product failed.")
            error.httpStatusCode = 500
            return next(error)
        })
    } else {
        res.redirect("/login")
    }
}

exports.getCheckoutSuccess = (req, res, next) => {
    req.user.populate("cart.items.productId").then(user => {
        const products = user.cart.items.map(i => {
            return {quantity: i.quantity, product: {...i.productId._doc}}
        });
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        })
        return order.save().then(result => {
            return req.user.clearCart();
        }).then(() => {
            res.redirect("/orders")
        }).catch(err => {
            console.log(err);
            const error = new Error("Creating a product failed.")
            error.httpStatusCode = 500
            return next(error)
        })
    })
}

exports.postOrder = (req, res, next) => {
    req.user.populate("cart.items.productId").then(user => {
        const products = user.cart.items.map(i => {
            return {quantity: i.quantity, product: {...i.productId._doc}}
        });
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        })
        return order.save().then(result => {
            return req.user.clearCart();
        }).then(() => {
            res.redirect("/orders")
        }).catch(err => {
            console.log(err);
            const error = new Error("Creating a product failed.")
            error.httpStatusCode = 500
            return next(error)
        })
    })
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error("No order found."))
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error("Not authorized for this order."))
        }
        const invoiceName = "invoice-" + orderId + ".pdf"
        const invoicePath = path.join('data', 'invoices', invoiceName)

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition', 
            'inline; filename="' + invoiceName + '"'
        )
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        
        pdfDoc.fontSize(26).text("Invoice", {align: "center"})
        pdfDoc.text("---------------------------", {align: "center"})
        let totalPrice = 0;
        order.products.forEach(e => {
            totalPrice += e.quantity * e.product.price;
            pdfDoc.fontSize(16).text(e.product.title + " - " + e.quantity + " x $" + e.product.price, {align: "center"})
        })
        pdfDoc.text("Total Price: $" + totalPrice, {align: "center"})

        pdfDoc.end()
        // fs.readFile(invoicePath, (err, data) => {
        //     if (err) {
        //         return next(err);
        //     }
        //     res.setHeader('Content-Type', 'application/pdf')
        //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
        //     res.send(data);
        // })
        // const file = fs.createReadStream(invoicePath);

        // file.pipe(res);
    }).catch(err => next(err))
}

exports.getCheckout = (req, res, next) => {
    let products;
    let total = 0;
    if (req.session.isLoggedIn === true) {
        req.user.populate("cart.items.productId").then(user => {
            products = user.cart.items;
            total = 0;
            products.forEach(p => {
                total += p.quantity * p.productId.price
            })
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => ({
                    quantity: p.quantity,
                    price_data: {
                        currency: "usd",
                        unit_amount: p.productId.price * 100,
                        product_data: {
                            name: p.productId.title,
                            description: p.productId.description,
                            images: [req.protocol + "://" + req.get("host") + "/images/" + p.productId.imageUrl.slice(7)]
                        }
                    }
                })),
                mode: 'payment',
                success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
                cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel"
            })
        }).then(session => {
            res.render("shop/checkout", {
                docTitle: "Shop - Checkout", 
                products: products,
                totalSum: total,
                sessionId: session.id
            })
        }).catch(err => {
            console.log(err);
            const error = new Error("Creating a product failed.")
            error.httpStatusCode = 500
            return next(error)
        })
    } else {
        res.redirect("/login")
    }
}

exports.getCancel = (req, res, next) => {
    res.redirect("/checkout")
}