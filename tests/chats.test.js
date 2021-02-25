import chai from "chai";
import chaiHTTP from "chai-http";
import db from "../src/database";
import app from "../src/index";
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

const newChat = {
  title: "Alice_John",
  user_id: 1,
  participant: 2,
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

describe("Chats", () => {
  beforeEach(async () => {
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

    await db
      .query(createUserQuery, seconduserValues)
      .then((response) => {
        const result = response.rows[0];
        expect(result).to.have.property("id");
        expect(result).to.have.property("name");
        expect(result).to.have.property("email");
      })
      .catch((err) => {
        console.log(err);
      });
  });
  afterEach(async () => {
    try {
      await db.query(
        `TRUNCATE users, chats RESTART IDENTITY CASCADE;
        `
      );
    } catch (error) {
      console.log(error);
    }
  });

  /*
   @GET {array} all chats
   */

  describe("/GET all chats", () => {
    const token = jwt.sign(
      {
        id: 1,
        email: userInfo.email,
        name: userInfo.name,
      },
      process.env.SECRET_KEY
    );
    it("It should return token missing response", (done) => {
      chai
        .request(app)
        .get("/chats")
        .then((res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.eql("Token is missing");
          done();
        });
    });
    it("It should return an empty array for authenticated users without chats", (done) => {
      chai
        .request(app)
        .get("/chats")
        .set({ authorization: token })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.message).to.eql("Chats retrieved");
          done();
        });
    });
  });
  /*
   @POST {object}  one chat
   */

  describe("/POST create chats", () => {
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
        .post("/chats")
        .send({})
        .then((res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.eql("You are not authorized");
          done();
        });
    });
    it("It should return Failed to create chat response", (done) => {
      chai
        .request(app)
        .post("/chats")
        .set({ authorization: token })
        .send({})
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.eql("Failed to create chat");
          done();
        });
    });
    // successfully create a chat
    it("It should successfully create a chat", (done) => {
      chai
        .request(app)
        .post("/chats")
        .set({ authorization: token })
        .send(newChat)
        .then((res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.message).to.eql("Created chat");
          done();
        });
    });
  });
});
