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
  username: "tokenadmin",
  role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '1h' })

const userToken = jwt.sign({
  email: "token@token.token",
  id: "0",
  username: "tokenuser",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1h' })

const wrongUserToken = jwt.sign({
  email: "token@token.token",
  id: "0",
  username: "wronguser",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1h' })

beforeAll(async () => {
const dbName = "testingDatabaseController";
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
  var bulma,pluto,pippo;
  beforeEach(async () => {
     pippo = await User.create({
      username: "pippo",
      email: "pippo@h.it",
      password: "pippo",
      role: "Admin",
      refreshToken: adminToken
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
          }
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

  test("nominal scenario admin", (done) => {
    request(app)
      .get("/api/groups")
      .set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.status).toBe(200)
        //TODO
        done();
      })
      .catch((err) => done(err))
    })
})

describe("getGroup", () => {
  var bulma,pluto,pippo;
  beforeEach(async () => {
     pippo = await User.create({
      username: "pippo",
      email: "pippo@h.it",
      password: "pippo",
      role: "Admin",
      refreshToken: adminToken
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
          }
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

  test("nominal scenario admin", (done) => {
    request(app)
      .get("/api/groups/g1")
      .set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.status).toBe(200)
        //TODO
        done();
      })
      .catch((err) => done(err))
    })
 })

describe("addToGroup", () => {
  var bulma,pluto,pippo;
  beforeEach(async () => {
     pippo = await User.create({
      username: "pippo",
      email: "pippo@h.it",
      password: "pippo",
      role: "Admin",
      refreshToken: adminToken
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
          }
      ],
    });

  });

  test("nominal scenario admin", (done) => {
    request(app)
      .patch("/api/groups/g1/insert")
      .send(
        {"members":
        ["bulma@h.it"]}
      )
      .set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.body).toStrictEqual("")
        //TODO
        done();
      })
      .catch((err) => done(err))
    })
 })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })
