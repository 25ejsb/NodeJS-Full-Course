const path = require("path")
const express = require("express")

const productsController = require("../controllers/products")

const router = express.Router()

router.get('/addproduct', productsController.getAddProduct)

router.post("/product", productsController.postAddProduct)

router.get("/editproduct/:productId", productsController.getEditProduct)

router.post("/editproduct", productsController.postEditProduct)

router.post("/delete", productsController.postDeleteProduct)

module.exports = router;