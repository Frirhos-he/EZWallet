import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'


dotenv.config();

const adminToken = jwt.sign({
  email: "token@token.token",
  id: "0",
  username: "tokenuser",
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
dotenv.config();
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
        
          done() // Notify Jest that the test is complete
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
        
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

})

describe("getUser", () => { 
  beforeEach(async () => {
    await User.deleteMany({})
  });
  test("nominal scenario", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
    }).then(() => {
      request(app)
        .get("/api/users/tester")
        .set(
          "cookies",
          `accessToken=${adminToken};refreshToken=${adminToken}`
        )
        .then((response) => {
          expect(response.body).toStrictEqual(
            {"error":"Mismatch role"})
          expect(response.status).toBe(200)
          
        
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
    })
})

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })
