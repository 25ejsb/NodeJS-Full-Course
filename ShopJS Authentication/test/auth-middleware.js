const expect = import("chai").expect
const sinon = import("sinon")
const jwt = import("jsonwebtoken")

const authMiddleware = import("../middleware/is-auth")

describe("Auth middleware", function() {
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
        sinon.stub(jwt, "verify");
        jwt.verify.returns({userId: "abc"});
        authMiddleware(this, req, {}, () => {});
        expect(req).to.have.property("userId");
        jwt.verify.restore();
    })
})