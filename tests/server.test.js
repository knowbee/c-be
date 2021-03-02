import chai from "chai";
import chaiHTTP from "chai-http";
import { server as app } from "../src/index";
let expect = chai.expect;
chai.use(chaiHTTP);

describe("TEST app", () => {
  it("It should ping home", (done) => {
    chai
      .request(app)
      .get("/")
      .then((res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
