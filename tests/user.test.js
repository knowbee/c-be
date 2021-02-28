import chai from "chai";
import chaiHTTP from "chai-http";
import db from "../src/database";
import { server as app } from "../src/index";

let expect = chai.expect;
chai.use(chaiHTTP);
let token;
describe("User", () => {
  before(async () => {
    try {
      await db.query(
        `
        TRUNCATE TABLE users, messages RESTART IDENTITY CASCADE;
        `
      );
    } catch (error) {
      console.log(error);
    }
  });

  /* Creating user*/
  describe("User registration", () => {
    describe("/auth/register", () => {
      it("should return the user information if the registration has succeeded", (done) => {
        chai
          .request(app)
          .post("/auth/register")
          .send({
            name: "Bruce",
            email: "bruce@gmail.com",
            password: "bruce@123",
          })
          .then((res) => {
            expect(res.status).to.equal(201);
            done();
          });
      });
    });
    describe("/auth/register", () => {
      it("should return Sorry, User with this email already exists", (done) => {
        chai
          .request(app)
          .post("/auth/register")
          .send({
            name: "Bruce",
            email: "bruce@gmail.com",
            password: "bruce@123",
          })
          .then((res) => {
            expect(res.status).to.equal(500);
            expect(res.body)
              .to.have.property("message")
              .eql("Sorry, User with this email already exists");
            done();
          });
      });
    });
  });
  // Authenticating user
  describe("User login", () => {
    describe("/auth/login", () => {
      it("login with empty email or password should fail", (done) => {
        chai
          .request(app)
          .post("/auth/login")
          .send({
            email: "",
            password: "",
          })
          .then((res) => {
            expect(res.status).to.equal(500);
            expect(res.body.data).to.eql(null);
            done();
          });
      });
    });
    describe("/auth/login", () => {
      it("should successfuly login the user", (done) => {
        chai
          .request(app)
          .post("/auth/login")
          .send({
            email: "bruce@gmail.com",
            password: "bruce@123",
          })
          .then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("data");
            expect(res.body.data).to.have.property("token");
            expect(res.body.data)
              .to.have.property("message")
              .eql("User successfully logged in");
            token = res.body.data.token;
            done();
          });
      });
    });
    describe("/auth/login", () => {
      it("invalid user password should fail", (done) => {
        chai
          .request(app)
          .post("/auth/login")
          .send({
            email: "bruce@gmail.com",
            password: "bruce@1234",
          })
          .then((res) => {
            expect(res.status).to.equal(500);
            expect(res.body)
              .to.have.property("message")
              .eql("Invalid credentials");
            done();
          });
      });
    });
  });

  /* Fetch users*/
  describe("Users", () => {
    describe("/users", () => {
      it("should return Users retrieved", (done) => {
        chai
          .request(app)
          .get("/users")
          .set({ authorization: token })
          .then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("data");
            expect(res.body).to.have.property("message").eql("Users retrieved");
            done();
          });
      });
    });
    describe("/users", () => {
      it("should fail to fetch users when not logged in", (done) => {
        chai
          .request(app)
          .get("/users")
          .then((res) => {
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("data").eql(null);
            expect(res.body)
              .to.have.property("message")
              .eql("Token is missing");
            done();
          });
      });
    });
  });
});
