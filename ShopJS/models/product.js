const fs = require('fs')
const path = require('path')
const Cart = require('./cart')

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'products.json'
)

const getProductsFromFile = callback => {
    fs.readFile(p, (err, filecontent) => {
        if (err) {
            return callback([])
        } else {
            callback(JSON.parse(filecontent))
        }
    })
}

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const existingProduct = products.findIndex(prod => prod.id === this.id);
                const updatedProducts = [...products]
                updatedProducts[existingProduct] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                    console.log(err)
                });
            } else {
                this.id = Math.random().toString();
                products.push(this)
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log(err)
                });
            }
        })
    }

    static deleteById(id) {
        getProductsFromFile(products => {
            const product = products.find(prod => prod.id === id)
            const updatedProducts = products.filter(prod => prod.id !== id)
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.deleteProduct(id, product.price);
                }
            })
        })
    }

    // static makes the function direct "this" to the function
    static fetchAll(callback) {
        getProductsFromFile(callback)
    }

    static findById(id, callback) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            callback(product)
        })
    }
}