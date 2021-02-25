import chai from "chai";
import chaiHTTP from "chai-http";
import app from "../src/index";
let expect = chai.expect;
chai.use(chaiHTTP);

describe("TEST app", () => {
  it("It should return welcome message", (done) => {
    chai
      .request(app)
      .get("/")
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.property("message").eql("Welcome");
        done();
      });
  });
});
