const path = require("path")
const express = require("express")

const productsController = require("../controllers/products")

const router = express.Router()
const adminData = require("./admin")

router.get('/', productsController.getProducts)
router.get("/products", productsController.products)
router.get("/products/:productid", productsController.getProduct)
router.get("/cart", productsController.cart)
router.post("/cart", productsController.postCart)
router.post("/cart-delete-item", productsController.postCartDeleteProduct)
router.get("/orders", productsController.getOrders)
router.get("/admin/adminproducts", productsController.adminProducts)
router.post("/create-order", productsController.postOrder)

module.exports = router;