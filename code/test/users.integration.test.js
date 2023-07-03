import request from "supertest";
import { app } from "../app";
import { User, Group } from "../models/User.js";
import { transactions, categories } from "../models/model";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { handleAmountFilterParams } from "../controllers/utils";

dotenv.config();

const adminToken = jwt.sign(
  {
    email: "token@token.token",
    id: "0",
    username: "tokenadmin",
    role: "Admin",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "1h" }
);

const userToken = jwt.sign(
  {
    email: "token@token.token",
    id: "0",
    username: "tokenuser",
    role: "Regular",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "1h" }
);

const wrongUserToken = jwt.sign(
  {
    email: "wrong@wrong.wrong",
    id: "0",
    username: "wronguser",
    role: "Regular",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "1h" }
);

const thirdUser = jwt.sign(
  {
    email: "third@third.third",
    id: "0",
    username: "thirdUser",
    role: "Regular",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "1h" }
);

beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
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

describe("getUsers", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
    })
  });

  test("Nominal scenario", (done) => {
 
      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toStrictEqual({
            data: [
              { email: "test@test.com", role: "Regular", username: "tester" },
            ],
            refreshedTokenMessage: ""
          });

          done();
        })
        .catch((err) => done(err));
  });

  test("Exception authentication (user token)", (done) => {

      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body).toStrictEqual({ error: "Mismatch role" });

          done();
        })
        .catch((err) => done(err));
  });

  afterAll(async () => {
    await User.deleteMany({});
  });
});

describe("getUser", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeAll(async () => {
    await User.deleteMany({});
    await User.create({
      username: "tokenuser",
      email: "token@token.token",
      password: "token",
      role: "Regular",
      refreshToken: userToken,
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .get("/api/users/tokenuser")
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: {
            email: "token@token.token",
            role: "Regular",
            username: "tokenuser",
          },
          refreshedTokenMessage: ""
        });
        expect(response.status).toBe(200);

        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error when the user doesn't exist", (done) => {
    request(app)
      .get("/api/users/wronguser")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "User not found",
        });

        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error of authentication (wrong user token)", (done) => {
    request(app)
      .get("/api/users/pippo")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "Mismatch role",
        });

        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await User.deleteMany({});
  });
});

describe("createGroup", () => {
  beforeEach(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    await User.create({
      username: "tokenuser",
      email: "token@token.token",
      password: "token",
      role: "Regular",
    });
    await User.create({
      username: "wronguser",
      email: "wrong@wrong.wrong",
      password: "token",
      role: "Regular",
    });
    await Group.create({
      name: "groupTest",
      members: [{ email: "token@token.token" }],
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "group1",
        memberEmails: [
          "wrong@wrong.wrong",
          "token@token.token",
          "missing@missing.missing",
        ],
      })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: {
            group: {
              name: "group1",
              members: [{ email: "wrong@wrong.wrong" }],
            },
            alreadyInGroup: [{ email: "token@token.token" }],
            membersNotFound: ["missing@missing.missing"],
          },
          refreshedTokenMessage: ""
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if the body is incomplete", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        memberEmails: [
          "wrong@wrong.wrong",
          "token@token.token",
          "missing@missing.missing",
        ],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Missing values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if the name in the body is an empty string", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "",
        memberEmails: [
          "wrong@wrong.wrong",
          "token@token.token",
          "missing@missing.missing",
        ],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty string values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error when there's already a group with the same name", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "groupTest",
        memberEmails: [
          "wrong@wrong.wrong",
          "token@token.token",
          "missing@missing.missing",
        ],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "There is already an existing gruop with the same name",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if all members are already in a group or don't exist", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "group2",
        memberEmails: ["token@token.token", "missing@missing.missing"],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error:
            "All the members have emails that don't exist or are already inside another group",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if the user who calls the api is already in a group", (done) => {
    request(app)
      .post("/api/groups")
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .send({
        name: "group2",
        memberEmails: [
          "wrong@wrong.wrong",
          "token@token.token",
          "missing@missing.missing",
        ],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "User who called the Api is in a group",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if an email is invalid", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "group1",
        memberEmails: ["tokenoken.token", "missing@missing.missing"],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Invalid email format",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if an email is an empty string", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "group1",
        memberEmails: ["", "missing@missing.missing"],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty email",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error of authentication (missing token)", (done) => {
    request(app)
      .post("/api/groups")
      .send({
        name: "group1",
        memberEmails: [
          "wrong@wrong.wrong",
          "token@token.token",
          "missing@missing.missing",
        ],
      })
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "Unauthorized",
        });
        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});

describe("getGroups", () => {
  beforeAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    await User.create({
      username: "tokenuser",
      email: "token@token.token",
      password: "token",
      role: "Regular",
    });

    await User.create({
      username: "wronguser",
      email: "wrong@wrong.wrong",
      password: "token",
      role: "Regular",
    });
    await Group.create({
      name: "groupTest",
      members: [{ email: "token@token.token" }],
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .get("/api/groups")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: [
            {
              name: "groupTest",
              members: [{ email: "token@token.token" }],
            },
          ],
          refreshedTokenMessage: ""
        });
        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error of authentification (user token)", (done) => {
    request(app)
      .get("/api/groups")
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "Mismatch role",
        });
        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});

describe("getGroup", () => {
  beforeAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    await User.create({
      username: "tokenuser",
      email: "token@token.token",
      password: "token",
      role: "Regular",
    });

    await User.create({
      username: "wronguser",
      email: "wrong@wrong.wrong",
      password: "token",
      role: "Regular",
    });

    await Group.create({
      name: "groupTest",
      members: [{ email: "token@token.token" }],
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .get("/api/groups/groupTest")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: {
            group: {
              name: "groupTest",
              members: [{ email: "token@token.token" }],
            },
          },
          refreshedTokenMessage: ""
        });
        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if the group doesn't exist", (done) => {
    request(app)
      .get("/api/groups/groupnotfound")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: "The group doesn't exist",
        });
        expect(response.status).toBe(400);
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error of authentification (user is not in the group)", (done) => {
    request(app)
      .get("/api/groups/groupTest")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "User is not in the group",
        });
        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});

describe("addToGroup", () => {
  beforeAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    await User.create({
      username: "tokenuser",
      email: "token@token.token",
      password: "token",
      role: "Regular",
    });

    await User.create({
      username: "wronguser",
      email: "wrong@wrong.wrong",
      password: "token",
      role: "Regular",
    });

    await User.create({
      username: "thirUser",
      email: "third@third.third",
      password: "third",
      role: "Regular",
    });

    await Group.create({
      name: "groupTest",
      members: [{ email: "token@token.token" }],
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .patch("/api/groups/groupTest/insert")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .send({
        emails: ["wrong@wrong.wrong"],
      })
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: {
            group: {
              name: "groupTest",
              members: [
                { email: "token@token.token" },
                { email: "wrong@wrong.wrong" },
              ],
            },
            alreadyInGroup: [],
            membersNotFound: [],
          },
          refreshedTokenMessage: ""
        });
        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if the body doesn't contain all attributes", (done) => {
    request(app)
      .patch("/api/groups/groupTest/insert")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .send({})
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "member emails not defined",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if the group doesn't exist", (done) => {
    request(app)
      .patch("/api/groups/wrongGroup/insert")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .send({
        emails: ["wrong@wrong.wrong"],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The group doesn't exist",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if all the emails are already in group or not existing", (done) => {
    request(app)
      .patch("/api/groups/groupTest/insert")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .send({
        emails: ["token@token.token"],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error:
            "All the members have emails that don't exist or are already inside another group",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if at least one email is invalid (format)", (done) => {
    request(app)
      .patch("/api/groups/groupTest/insert")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .send({
        emails: ["wrong.wrong"],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Invalid email format",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error if at least one email is an empty string", (done) => {
    request(app)
      .patch("/api/groups/groupTest/insert")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .send({
        emails: [""],
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty email",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error of authentication (user is not in the group)", (done) => {
    request(app)
      .patch("/api/groups/groupTest/add")
      .set("Cookie", `accessToken=${thirdUser};refreshToken=${thirdUser}`)
      .send({
        emails: ["third@third.third"],
      })
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: "User is not in the group",
        });
        expect(response.status).toBe(401);
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error of authentication (user using wrong path)", (done) => {
    request(app)
      .patch("/api/groups/groupTest/insert")
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .send({
        emails: ["wrong@wrong.wrong"],
      })
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "Mismatch role",
        });
        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});

describe("removeFromGroup", () => {
  var bulma, pluto, pippo, goku;
  beforeAll(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    pippo = await User.create({
      username: "pippo",
      email: "pippo@h.it",
      password: "pippo",
      role: "Admin",
      refreshToken: adminToken,
    });
    pluto = await User.create({
      username: "pluto",
      email: "pluto@h.it",
      password: "pluto",
      refreshToken: userToken,
      role: "Regular",
    });
    bulma = await User.create({
      username: "bulma",
      email: "bulma@h.it",
      password: "bulma",
      refreshToken: adminToken,
      role: "Regular",
    });
    goku = await User.create({
      username: "goku",
      email: "goku@h.it",
      password: "goku",
      refreshToken: adminToken,
      role: "Regular",
    });

    await Group.create({
      name: "g1",
      members: [
        {
          email: pluto.email,
          user: pluto._id,
        },
        {
          email: pippo.email,
          user: pippo._id,
        },
      ],
    });
    await Group.create({
      name: "g2",
      members: [
        {
          email: bulma.email,
          user: bulma._id,
        },
      ],
    });
  });

  test("nominal scenario", (done) => {
    request(app)
      .patch("/api/groups/g1/pull")
      .send({ emails: [pluto.email] })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: {
            group: {
              name: "g1",
              members: [
                {
                  email: pippo.email,
                },
              ],
            },
            membersNotFound: [],
            notInGroup: [],
          },
          refreshedTokenMessage: ""
        });
        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });

  test("The group doesn t exist", (done) => {
    request(app)
      .patch("/api/groups/g3/pull")
      .send({ emails: [pluto.email] })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: "The group doesn't exist",
        });
        expect(response.status).toBe(400);
        done();
      })
      .catch((err) => done(err));
  });

  test("member emails not defined", (done) => {
    request(app)
      .patch("/api/groups/g1/pull")
      .send({})
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: "member emails not defined",
        });
        expect(response.status).toBe(400);
        done();
      })
      .catch((err) => done(err));
  });

  test("Empty email", (done) => {
    request(app)
      .patch("/api/groups/g1/pull")
      .send({ emails: [""] })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: "Empty email",
        });
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty email",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Regex failed email", (done) => {
    request(app)
      .patch("/api/groups/g1/pull")
      .send({ emails: ["wrongemail"] })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: "Invalid email format",
        });
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Invalid email format",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("all the members don't exits or are not in the group", (done) => {
    request(app)
      .patch("/api/groups/g1/pull")
      .send({ emails: ["notexisting@gmail.com"] })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: "All the members either don't exist or are not in the group",
        });
        expect(response.status).toBe(400);
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error of authentication (user try admin route)", (done) => {
    request(app)
      .patch("/api/groups/g1/pull")
      .send({ emails: [pluto.email] })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: " adminAuth: Mismatch role",
        });
        expect(response.status).toBe(401);
        done();
      })
      .catch((err) => done(err));
  });

  test("should return an error of authentication (user not in Group)", (done) => {
    request(app)
      .patch("/api/groups/g1/remove")
      .send({ emails: [pluto.email] })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: "groupAuth: User is not in the group",
        });
        expect(response.status).toBe(401);
        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  });
});

describe("deleteUser", () => {
  var bulma, pluto, pippo, goku;
  beforeAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    pippo = await User.create({
      username: "pippo",
      email: "pippo@h.it",
      password: "pippo",
      role: "Admin",
      refreshToken: adminToken,
    });
    pluto = await User.create({
      username: "pluto",
      email: "pluto@h.it",
      password: "pluto",
      refreshToken: userToken,
      role: "Regular",
    });
    bulma = await User.create({
      username: "bulma",
      email: "bulma@h.it",
      password: "bulma",
      refreshToken: adminToken,
      role: "Regular",
    });
    goku = await User.create({
      username: "goku",
      email: "goku@h.it",
      password: "goku",
      refreshToken: adminToken,
      role: "Regular",
    });

    await Group.create({
      name: "g1",
      members: [
        {
          email: pluto.email,
          user: pluto._id,
        },
        {
          email: pippo.email,
          user: pippo._id,
        },
      ],
    });
    await Group.create({
      name: "g2",
      members: [
        {
          email: bulma.email,
          user: bulma._id,
        },
      ],
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .delete("/api/users")
      .send({ email: goku.email })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: {
            deletedFromGroup: false,
            deletedTransactions: 0,
          },
          refreshedTokenMessage: ""
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("user in a group alone", (done) => {
    request(app)
      .delete("/api/users")
      .send({ email: bulma.email })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {

        expect(response.body).toStrictEqual({
          "data": {
                 "deletedFromGroup": true,
                 "deletedTransactions": 0,
               },
               "refreshedTokenMessage": "",
              }
        );

        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });

  test("missing params admin", (done) => {
    request(app)
      .delete("/api/users")
      .send({ email: " " })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Empty string values" });
        //TODO
        done();
      })
      .catch((err) => done(err));
  });

  test("not admin", (done) => {
    request(app)
      .delete("/api/users")
      .send({ email: bulma.email })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({ error: "Mismatch role" });
        //TODO
        done();
      })
      .catch((err) => done(err));
  });

  test("email wrong format", (done) => {
    request(app)
      .delete("/api/users")
      .send({ email: "b.it" })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Invalid email format" });
        //TODO
        done();
      })
      .catch((err) => done(err));
  });

  test("email doens't exists", (done) => {
    request(app)
      .delete("/api/users")
      .send({ email: "b@h.it" })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The user doesn't exist",
        });
        //TODO
        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
   await Group.deleteMany({});
   await User.deleteMany({});
  });
});

describe("deleteGroup", () => {
  var bulma, pluto, pippo;
  beforeAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    pippo = await User.create({
      username: "pippo",
      email: "pippo@h.it",
      password: "pippo",
      role: "Admin",
      refreshToken: adminToken,
    });
    pluto = await User.create({
      username: "pluto",
      email: "pluto@h.it",
      password: "pluto",
      refreshToken: userToken,
      role: "Regular",
    });
    bulma = await User.create({
      username: "bulma",
      email: "bulma@h.it",
      password: "bulma",
      refreshToken: adminToken,
      role: "Regular",
    });

    await Group.create({
      name: "g1",
      members: [
        {
          email: pluto.email,
          user: pluto._id,
        },
        {
          email: pippo.email,
          user: pippo._id,
        },
      ],
    });
  });

  test("nominal scenario", (done) => {
    request(app)
      .delete("/api/groups")
      .send({ name: "g1" })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: { message: "Group deleted successfully" },
          refreshedTokenMessage: ""
        });
        //TODO
        done();
      })
      .catch((err) => done(err));
  });

  test("missing params", (done) => {
    request(app)
      .delete("/api/groups")
      .send({ name: " " })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Empty string values" });
        //TODO
        done();
      })
      .catch((err) => done(err));
  });

  test("not admin", (done) => {
    request(app)
      .delete("/api/groups")
      .send({ name: "group" })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({ error: "Mismatch role" });
        //TODO
        done();
      })
      .catch((err) => done(err));
  });

  test("group doesn't exist", (done) => {
    request(app)
      .delete("/api/groups")
      .send({ name: "g2" })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          error: "The group doesn't exist",
        });
        expect(response.status).toBe(400);

        //TODO
        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});
