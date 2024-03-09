const {Sequelize} = require("sequelize")

const sequelize = new Sequelize("eitan-base", "root", "25Greenseed", {
    dialect: 'mysql', 
    host: 'localhost',
    define: {
        timestamps: false
    }
})

module.exports = sequelize