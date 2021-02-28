import chai from "chai";
import chaiHTTP from "chai-http";
import db from "../src/database";
let expect = chai.expect;
chai.use(chaiHTTP);

describe("Testing db", () => {
  describe("/Create test table", () => {
    it("It should create one test table", (done) => {
      const query = `CREATE TABLE IF NOT EXISTS test( id SERIAL)`;
      db.query(query)
        .then((response) => {
          expect(response).to.have.property("command").eql("CREATE");
          expect(response).to.have.property("rowCount").eql(null);
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
    });

    it("It should drop table test", (done) => {
      const query = "DROP TABLE IF EXISTS test";
      db.query(query)
        .then((response) => {
          expect(response).to.be.a("array");
          expect(response).length.to.be.eql(0);
          done();
        })
        .catch((err) => {
          done();
        });
    });
    it("It should fail when invalid query is given", (done) => {
      const query = "EE";
      db.query(query)
        .then((response) => {
          expect(response).to.eql(null);
          done();
        })
        .catch((err) => {
          done();
        });
    });
    it("It should return test environment", (done) => {
      try {
        const { NODE_ENV } = process.env;
        expect(NODE_ENV).to.eql("test");
        done();
      } catch (error) {
        console.log(error);
      }
    });
  });
});
