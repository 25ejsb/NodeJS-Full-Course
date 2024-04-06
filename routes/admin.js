const path = require("path")
const express = require("express")

const {body} = require("express-validator")

const productsController = require("../controllers/products")

const router = express.Router()

router.get('/addproduct', productsController.getAddProduct)

router.post("/product", [
    body("title").isString().isLength({min: 3}).trim(),
    body("price").isFloat(),
    body("description").isString().isLength({max: 100}).trim()
], productsController.postAddProduct)

router.get("/adminproducts", productsController.adminProducts)

router.get("/editproduct/:productId", productsController.getEditProduct)

router.post("/editproduct", [
    body("title").isString().isLength({min: 3}).trim(),
    body("price").isFloat(),
    body("description").isString().isLength({max: 100}).trim()
], productsController.postEditProduct)

router.delete("/product/:productId", productsController.deleteProduct)

module.exports = router;