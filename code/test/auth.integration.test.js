import request from "supertest";
import { app } from "../app";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userToken = jwt.sign(
  {
    email: "b@h.it",
    id: "0",
    username: "b",
    role: "Regular",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "1h" }
);

const userNotFoundToken = jwt.sign(
  {
    email: "n@h.it",
    id: "0",
    username: "n",
    role: "Regular",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "1h" }
);

const testerAccessTokenExpired = jwt.sign(
  {
    email: "tester@test.com",
    username: "tester",
    role: "Regular",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "0s" }
);

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("register", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    const passwordGen = await bcrypt.hash("testPassword", 12);
    await User.create({
      username: "existing",
      email: "existing@h.it",
      password: passwordGen,
      role: "Regular",
      refreshToken: userToken,
    });
  });
  test("Nominal scenario", (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "u",
        email: "u@h.it",
        password: "password",
      })
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: {
            message: "User added successfully",
          },
        });
        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });
  test('No username " " ', (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: " ",
        email: "u@h.it",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Empty string values" });
        done();
      })
      .catch((err) => done(err));
  });
  test("no email regex ", (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "u",
        email: "uh.it",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Invalid email format" });
        done();
      })
      .catch((err) => done(err));
  });
  test("Existing username ", (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "existing",
        email: "v@h.it",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Username is already registered",
        });
        done();
      })
      .catch((err) => done(err));
  });
  test("Existing email ", (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "u",
        email: "existing@h.it",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Email is already registered",
        });
        done();
      })
      .catch((err) => done(err));
  });
  afterAll(async () => {
    await User.deleteMany({});
  });
});

describe("registerAdmin", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    const passwordGen = await bcrypt.hash("testPassword", 12);
    await User.create({
      username: "existing",
      email: "existing@h.it",
      password: passwordGen,
      role: "Regular",
      refreshToken: userToken,
    });
  });
  test("Nominal scenario", (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "a",
        email: "a@h.it",
        password: "password",
      })
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: {
            message: "admin added successfully",
          },
        });
        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });
  test('No username " " ', (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: " ",
        email: "u@h.it",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Empty string values" });
        done();
      })
      .catch((err) => done(err));
  });
  test("no email regex ", (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "u",
        email: "uh.it",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Invalid email format" });
        done();
      })
      .catch((err) => done(err));
  });
  test("Existing username ", (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "existing",
        email: "v@h.it",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Username is already registered",
        });
        done();
      })
      .catch((err) => done(err));
  });
  test("Existing email ", (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "u",
        email: "existing@h.it",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Email is already registered",
        });
        done();
      })
      .catch((err) => done(err));
  });
  afterAll(async () => {
    await User.deleteMany({});
  });
});

describe("login", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    const passwordGen = await bcrypt.hash("testPassword", 12);
    await User.create({
      username: "b",
      email: "b@h.it",
      password: passwordGen,
      role: "Regular",
      refreshToken: userToken,
    });
  });
  test("Nominal scenario", (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: "b@h.it",
        password: "testPassword",
      })
      .then((response) => {
        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });
  test("existing user no scenario", (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: "c@h.it",
        password: "testPassword",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "please you need to register",
        });
        done();
      })
      .catch((err) => done(err));
  });
  test("existing user no scenario", (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: "b@h.it",
        password: "Password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "wrong credentials" });
        done();
      })
      .catch((err) => done(err));
  });
  test('No email " " ', (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: " ",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Empty string values" });
        done();
      })
      .catch((err) => done(err));
  });
  test("no email regex ", (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: "uh.it",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Invalid email format" });
        done();
      })
      .catch((err) => done(err));
  });
  afterAll(async () => {
    await User.deleteMany({});
  });
});

describe("logout", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await User.create({
      username: "b",
      email: "b@h.it",
      password: "password",
      role: "Regular",
      refreshToken: userToken,
    });
  });
  test("Nominal scenario", (done) => {
    bcrypt.hash("testPassword", 12).then((hashedPassword) => {
      request(app)
        .get("/api/logout")
        .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
        .then((response) => {
          expect(response.body).toStrictEqual({
            data: { message: "User logged out" },
          });
          expect(response.status).toBe(200);

          done();
        })
        .catch((err) => done(err));
    });
  });
  test("no authentification", (done) => {
    bcrypt.hash("testPassword", 12).then((hashedPassword) => {
      request(app)
        .get("/api/logout")
        .set(
          "Cookie",
          `accessToken=${testerAccessTokenExpired};refreshToken=${testerAccessTokenExpired}`
        )
        .then((response) => {
          expect(response.body).toStrictEqual({ error: "Perform login again" });
          expect(response.status).toBe(401);

          done();
        })
        .catch((err) => done(err));
    });
  });
  test("user not found", (done) => {
    bcrypt.hash("testPassword", 12).then((hashedPassword) => {
      request(app)
        .get("/api/logout")
        .set(
          "Cookie",
          `accessToken=${userNotFoundToken};refreshToken=${userNotFoundToken}`
        )
        .then((response) => {
          expect(response.body).toStrictEqual({ error: "user not found" });
          expect(response.status).toBe(400);

          done();
        })
        .catch((err) => done(err));
    });
  });
  afterAll(async () => {
    await User.deleteMany({});
  });
});
