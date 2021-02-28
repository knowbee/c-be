import chai from "chai";
import chaiHTTP from "chai-http";
import db from "../src/database";
import { server as app } from "../src/index";
import jwt from "jsonwebtoken";

let expect = chai.expect;
chai.use(chaiHTTP);
let token;

const userInfo = {
  name: "John Doe",
  email: "John@example.com",
  password:
    "$587frg0$ta8r9KNt4254grLRKNnlrlgruYFIiwecWWSx5jTl.korkgnrJNKGR8u/KLMVSGe",
};
const secondUserInfo = {
  name: "Alice Doe",
  email: "Alice@example.com",
  password:
    "$587frg0$ta8r9KNt4254grLRKNnlrlgruYFIiwecWWSx5jTl.korkgnrJNKGR8u/KLMVSGe",
};

let chat;
let firstMessage = {
  sender_id: 1,
  receiver_id: 2,
  message: "Hi",
};
let replyMessage = {
  sender_id: 2,
  receiver_id: 1,
  message: "Hi there",
};
const createUserQuery = `
    INSERT INTO users(name, email, password)
    VALUES($1, $2, $3)
    returning id, name, email
    `;
const userValues = [userInfo.name, userInfo.email, userInfo.password];
const seconduserValues = [
  secondUserInfo.name,
  secondUserInfo.email,
  secondUserInfo.password,
];

describe("Messages", () => {
  before(async () => {
    try {
      await db.query(
        `
        TRUNCATE TABLE users, messages RESTART IDENTITY CASCADE;
        `
      );
      await db
        .query(createUserQuery, userValues)
        .then((response) => {
          const result = response.rows[0];
          expect(result).to.have.property("id");
          expect(result).to.have.property("name");
          expect(result).to.have.property("email");
        })
        .catch((err) => {
          console.log(err);
        });

      await db.query(createUserQuery, seconduserValues).then((response) => {
        const result = response.rows[0];
        expect(result).to.have.property("id");
        expect(result).to.have.property("name");
        expect(result).to.have.property("email");
      });
    } catch (error) {
      console.log(error);
    }
  });
  after(async () => {
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

  describe("/GET get messages", () => {
    const token = jwt.sign(
      {
        id: 1,
        email: userInfo.email,
        name: userInfo.name,
      },
      process.env.SECRET_KEY
    );
    it("It should return unauthorized response", (done) => {
      chai
        .request(app)
        .get("/messages")
        .then((res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.eql("Token is missing");
          done();
        });
    });
    it("It should return Message must not be empty response", (done) => {
      chai
        .request(app)
        .post("/messages")
        .set({ authorization: token })
        .send({})
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.eql("Message must not be empty");
          done();
        });
    });
    it("It should fail to send a message with the wrong user id", (done) => {
      chai
        .request(app)
        .post("/messages")
        .set({ authorization: token })
        .send(replyMessage)
        .then((res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.eql("You are not authorized");
          done();
        });
    });
    it("It should successfully send the message", (done) => {
      chai
        .request(app)
        .post("/messages")
        .set({ authorization: token })
        .send(firstMessage)
        .then((res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.eql("Messages sent");
          done();
        });
    });
    it("It should fetch user messages", (done) => {
      chai
        .request(app)
        .get("/messages")
        .set({ authorization: token })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.eql("Messages retrieved");
          done();
        });
    });
  });
});
