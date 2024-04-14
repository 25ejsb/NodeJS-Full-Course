const expect = require("chai").expect

const authMiddleware = require("../middleware/is-auth")

it("should throw an error if there's no authorization header is present", function() {
    const req = {
        get: function() {
            return null;
        }
    }
    expect(authMiddleware.bind(req, {}, () => {})).to.throw("Not authenticated.")
})

it("show throw an errorif the authorization header is only one string", function() {
    const req = {
        get: function(headerName) {
            return 'xyz'
        }
    }
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw()
})

it("should throw an error if the token cannot be verified", function() {
    const req = {
        get: function() {
            return "Bearer xyz";
        }
    }
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw()
})