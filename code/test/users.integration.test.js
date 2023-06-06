import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'


dotenv.config();

const adminToken = jwt.sign({
  email: "tester@token.token",
  id: "0",
  username: "tester",
  role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '1h' })

const userToken = jwt.sign({
  email: "token@token.token",
  id: "0",
  username: "tokenuser",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1h' })
/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
beforeEach(async () => {
  await categories.deleteMany({})
  await transactions.deleteMany({})
  await User.deleteMany({})
  await Group.deleteMany({})
})


describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeEach(async () => {
    await User.deleteMany({})
  });

  test("should return empty list if there are no users", (done) => {
    request(app)
      .get("/api/users")
      .set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body).toStrictEqual({"data": []})
        done();
      })
      .catch((err) => done(err))
    })

  test("should retrieve list of all users", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
    }).then(() => {
      request(app)
        .get("/api/users")
        .set(
          "Cookie",
          `accessToken=${adminToken};refreshToken=${adminToken}`
        )
        .then((response) => {
          expect(response.status).toBe(200)
          expect(response.body).toStrictEqual(
            {"data": [{"email": "test@test.com", "role": "Regular", "username": "tester"}]})
        
          done() 
        })
        .catch((err) => done(err))
    })
  })
  test("user is called", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
    }).then(() => {
      request(app)
        .get("/api/users")
        .set(
          "Cookie",
          `accessToken=${userToken};refreshToken=${userToken}`
        )
        .then((response) => {
          expect(response.status).toBe(401)
          expect(response.body).toStrictEqual(
            {"error":"Mismatch role"})
        
          done()
        })
        .catch((err) => done(err))
    })
  })

})

describe("getUser", () => { 
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
    beforeEach(async () => {
      await User.create({
        username: "pippo",
        email: "pippo@h.it",
        password: "pippo",
        role: "Admin",
        refreshToken: adminToken
      });
    });
  
    test("nominal scenario admin", (done) => {
      request(app)
        .get("/api/users/pippo")
        .set(
          "Cookie",
          `accessToken=${adminToken};refreshToken=${adminToken}`
        )
        .then((response) => {
          expect(response.body).toStrictEqual(
            {"data": {
                 email: "pippo@h.it",
                 role: "Admin",
                 username: "pippo",
               }})
          expect(response.status).toBe(200)

          done();
        })
        .catch((err) => done(err))
      })
})

/*
describe("createGroup", () => {
  let testUserId;
  const testObjectId = mongoose.Types.ObjectId();

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

    const testerUser = await User.create({
      username: "tester",
      email: "tester@token.token",
      password: "tester",
      role: "Admin",
    });

    testUserId = testerUser._id;

    await User.create({
      username: "User",
      email: "user@test.com",
      password: "user",
      role: "Regular",
      _id: testObjectId,
    });

    await Group.create({
      name: "groupTest",
      emails: ["tester@token.token"],
    });
  });

  test("nominal scenario", async () => {
    const response = await request(app)
      .post("/api/groups")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .send({
        name: "g",
        memberEmails: ["user@test.com"],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        
      },
    });
  });

  test("missing name value", async () => {
    const response = await request(app)
      .post("/api/groups")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .send({
        memberEmails: ["user@test.com"],
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Missing values",
    });
  });

  // Add more test cases to cover other scenarios

});
*/
describe("getGroups", () => {
  beforeEach(async () => {
    await User.create({
      username: "pippo",
      email: "pippo@h.it",
      password: "pippo",
      role: "Admin",
      refreshToken: adminToken
    });
    await Group.create({
      name: "group",
      emails:["pippo@h.it"]
    });
  });

  test("nominal scenario admin", (done) => {
    request(app)
      .get("/api/groups")
      .set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.body).toStrictEqual({
          "data":  [
                  {
                   "members": ["pippo@h.it"],
                   "name": "group"
                  }]})
        expect(response.status).toBe(200)

        done();
      })
      .catch((err) => done(err))
    })
})

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })
