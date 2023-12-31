import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import { Group, User } from "../models/User";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const adminToken = jwt.sign(
  {
    email: "admin@admin.admin",
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
    email: "wronguser@token.token",
    id: "0",
    username: "wronguser",
    role: "Regular",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "1h" }
);

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

describe("createCategory", () => {
  beforeAll(async () => {
    await categories.deleteMany({});
    await categories.create({
      type: "gym",
      color: "#FFFFFF",
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .post("/api/categories")
      .send({
        type: "investment",
        color: "blue",
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: {
            type: "investment",
            color: "blue",
          },
          refreshedTokenMessage: ""
        });
        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if missing field in body", (done) => {
    request(app)
      .post("/api/categories")
      .send({
        color: "blue",
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Missing values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if a field is an empty string", (done) => {
    request(app)
      .post("/api/categories")
      .send({
        type: "",
        color: "blue",
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty string values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if category already exists", (done) => {
    request(app)
      .post("/api/categories")
      .send({
        type: "investment",
        color: "blue",
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Category already exists",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if the tokens are not present", (done) => {
    request(app)
      .post("/api/categories")
      .send({
        type: "sport",
        color: "#FFFFFF",
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

  test("Should return an error of authentication (user token)", (done) => {
    request(app)
      .post("/api/categories")
      .send({
        type: "investment",
        color: "blue",
      })
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
    await categories.deleteMany({});
  });
});

describe("updateCategory", () => {
  const today = new Date();
  beforeAll(async () => {
    await categories.deleteMany({});
    await transactions.deleteMany({});
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
    await categories.create({
      type: "third",
      color: "yellow",
    });

    await transactions.deleteMany({});
    await transactions.create({
      username: "u",
      amount: 12.54,
      type: "investment",
      date: today,
    });
    await transactions.create({
      username: "u",
      amount: 12.54,
      type: "work",
      date: today,
    });
    await transactions.create({
      username: "a",
      amount: 12.54,
      type: "work",
      date: today,
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .patch("/api/categories/investment")
      .send({
        type: "joker",
        color: "blue",
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: {
            message: "Category successfully updated",
            count: 1,
          },
          refreshedTokenMessage: ""
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if missing parameters", (done) => {
    request(app)
      .patch("/api/categories/investment")
      .send({
        type: "joker",
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Missing values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if empty strings parameters", (done) => {
    request(app)
      .patch("/api/categories/investment")
      .send({
        type: "joker",
        color: "",
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty string values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if category in route parameters doesn't exists", (done) => {
    request(app)
      .patch("/api/categories/wrong")
      .send({
        type: "joker",
        color: "blue",
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Category of type 'wrong' not found",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if category in body already exists", (done) => {
    request(app)
      .patch("/api/categories/work")
      .send({
        type: "third",
        color: "blue",
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Category of type 'third' already exists",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (user token)", (done) => {
    request(app)
      .patch("/api/categories/investment")
      .send({
        type: "joker",
        color: "blue",
      })
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

  test("Should return an error of authentication (missing token)", (done) => {
    request(app)
      .patch("/api/categories/investment")
      .send({
        type: "joker",
        color: "blue",
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
    await categories.deleteMany({});
    await transactions.deleteMany({});
  });
});

describe("deleteCategory", () => {
  const today = new Date();
  beforeAll(async () => {
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
    await transactions.create({
      username: "u",
      amount: 12.54,
      type: "investment",
      date: today,
    });
    await transactions.create({
      username: "u",
      amount: 12.54,
      type: "work",
      date: today,
    });
    await transactions.create({
      username: "a",
      amount: 12.54,
      type: "work",
      date: today,
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .delete("/api/categories")
      .send({
        types: ["work"],
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: { message: "Categories deleted", count: 2 },
          refreshedTokenMessage: ""
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if missing field in body", (done) => {
    request(app)
      .delete("/api/categories")
      .send({})
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "types object not inserted",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if therea an empty string", (done) => {
    request(app)
      .delete("/api/categories")
      .send({
        types: [""],
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "at least one of the types in the array is an empty string",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if therea a category to be deleted that is not in the database", (done) => {
    request(app)
      .delete("/api/categories")
      .send({
        types: ["wrong"],
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Category for type 'wrong' not found",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if therea only one category in the database", (done) => {
    request(app)
      .delete("/api/categories")
      .send({
        types: ["investment"],
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Only one category remaining in database",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (user token)", (done) => {
    request(app)
      .delete("/api/categories")
      .send({
        types: ["work"],
      })
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

  test("Should return an error of authentication (missing token)", (done) => {
    request(app)
      .delete("/api/categories")
      .send({
        types: ["work"],
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
    await transactions.deleteMany({});
    await categories.deleteMany({});
  });
});

describe("getCategories", () => {
  beforeAll(async () => {
    await categories.deleteMany({});
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .get("/api/categories")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          data: [
            {
              type: "investment",
              color: "blue",
            },
            {
              type: "work",
              color: "red",
            },
          ],
          refreshedTokenMessage: ""
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (missing token)", (done) => {
    request(app)
      .get("/api/categories")
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          error: "Unauthorized",
        });
        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await categories.deleteMany({});
  });
});

describe("createTransaction", () => {
  beforeAll(async () => {
    await categories.deleteMany({});
    await User.deleteMany({});
    await User.create({
      username: "tokenuser",
      email: "token@token.com",
      password: "token",
      refreshToken: userToken,
      role: "Regular",
    });
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .post("/api/users/tokenuser/transactions")
      .send({
        username: "tokenuser",
        amount: 43.2,
        type: "investment",
      })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.username).toBe("tokenuser");
        expect(response.body.data.amount).toBe(43.2);
        expect(response.body.data.type).toBe("investment");
        expect(response.body.refreshedTokenMessage).toBe("")
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error when missing parameters", (done) => {
    request(app)
      .post("/api/users/tokenuser/transactions")
      .send({
        username: "tokeuser",
        amount: 43.2,
      })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Missing values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error when empty string parameters", (done) => {
    request(app)
      .post("/api/users/tokenuser/transactions")
      .send({
        username: "tokeuser",
        amount: 43.2,
        type: "",
      })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty string values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if amount can't be parsed as float", (done) => {
    request(app)
      .post("/api/users/tokenuser/transactions")
      .send({
        username: "tokeuser",
        amount: "ciao",
        type: "investment",
      })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Invalid amount value",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if requesting user doesn't match involved user", (done) => {
    request(app)
      .post("/api/users/tokenuser/transactions")
      .send({
        username: "anotheruser",
        amount: 43.2,
        type: "investment",
      })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Username mismatch",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if involved user doesn't exist", (done) => {
    request(app)
      .post("/api/users/wronguser/transactions")
      .send({
        username: "wronguser",
        amount: 43.2,
        type: "investment",
      })
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The user does not exist",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if category doesn't exist", (done) => {
    request(app)
      .post("/api/users/tokenuser/transactions")
      .send({
        username: "tokenuser",
        amount: 43.2,
        type: "wrongone",
      })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The category does not exist",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (wrong user token)", (done) => {
    request(app)
      .post("/api/users/tokenuser/transactions")
      .send({
        username: "tokeuser",
        amount: 43.2,
        type: "investment",
      })
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "Mismatched users",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (missing token)", (done) => {
    request(app)
      .post("/api/users/tokenuser/transactions")
      .send({
        username: "tokeuser",
        amount: 43.2,
        type: "investment",
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
    await categories.deleteMany({});
    await User.deleteMany({});
  });
});

describe("getAllTransactions", () => {
  const today = new Date();
  beforeAll(async () => {
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
    await User.create({
      username: "tokenuser",
      email: "token@token.com",
      password: "token",
      refreshToken: userToken,
      role: "Regular",
    });
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
    await transactions.create({
      username: "tokenuser",
      amount: 12.54,
      type: "investment",
      date: today,
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .get("/api/transactions")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data[0].username).toBe("tokenuser");
        expect(response.body.data[0].amount).toBe(12.54);
        expect(response.body.data[0].type).toBe("investment");
        expect(response.body.data[0].color).toBe("blue");
        expect(response.body.refreshedTokenMessage).toBe("")
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (user token)", (done) => {
    request(app)
      .get("/api/transactions")
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

  test("Should return an error of authentication (missing token)", (done) => {
    request(app)
      .get("/api/transactions")
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
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
  });
});

describe("getTransactionsByUser", () => {
  const today = new Date();
  beforeAll(async () => {
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
    await User.create({
      username: "tokenuser",
      email: "token@token.com",
      password: "token",
      refreshToken: userToken,
      role: "Regular",
    });
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
    await transactions.deleteMany({});
    await transactions.create({
      username: "tokenuser",
      amount: 12.54,
      type: "investment",
      date: today,
    });
    await transactions.create({
      username: "tokenuser",
      amount: 50,
      type: "investment",
      date: today,
    });
    await transactions.create({
      username: "tokenuser",
      amount: 20,
      type: "investment",
      date: today.setDate(today.getDate()-100),
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .get("/api/transactions/users/tokenuser")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data[0].username).toBe("tokenuser");
        expect(response.body.data[0].amount).toBe(12.54);
        expect(response.body.data[0].type).toBe("investment");
        expect(response.body.data[0].color).toBe("blue");
        expect(response.body.refreshedTokenMessage).toBe("")
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if user doesn't exist ", (done) => {
    request(app)
      .get("/api/users/wronguser/transactions")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "the user does not exist",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return all transactions by a specific user filtered date and amount", (done) => {
    request(app)
      .get(`/api/transactions/users/tokenuser/?max=30&from=2023-06-07`)
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data[0].username).toBe("tokenuser");
        expect(response.body.data[0].amount).toBe(12.54);
        expect(response.body.data[0].type).toBe("investment");
        expect(response.body.data[0].color).toBe("blue");
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (user token instead of admin)", (done) => {
    request(app)
      .get("/api/transactions/users/tokenuser")
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

  test("Should return an error of authentication (admin token instead of user)", (done) => {
    request(app)
      .get("/api/users/tokenuser/transactions")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "Mismatched users",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (missing token)", (done) => {
    request(app)
      .get("/api/users/tokenuser/transactions")
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
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
  });
});

describe("getTransactionsByUserByCategory", () => {
  const today = new Date();
  beforeAll(async () => {
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
    await User.create({
      username: "tokenuser",
      email: "token@token.com",
      password: "token",
      refreshToken: userToken,
      role: "Regular",
    });
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
    await transactions.create({
      username: "tokenuser",
      amount: 12.54,
      type: "investment",
      date: today,
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .get("/api/transactions/users/tokenuser/category/investment")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data[0].username).toBe("tokenuser");
        expect(response.body.data[0].amount).toBe(12.54);
        expect(response.body.data[0].type).toBe("investment");
        expect(response.body.data[0].color).toBe("blue");
        expect(response.body.refreshedTokenMessage).toBe("")
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if user doesn't exist ", (done) => {
    request(app)
      .get("/api/users/wronguser/transactions/category/investment")
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The user does not exist",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if category doesn't exist ", (done) => {
    request(app)
      .get("/api/users/tokenuser/transactions/category/wrongone")
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The category does not exist",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (user token instead of admin)", (done) => {
    request(app)
      .get("/api/transactions/users/tokenuser/category/investment")
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

  test("Should return an error of authentication (admin token instead of user)", (done) => {
    request(app)
      .get("/api/users/wronguser/transactions/category/investment")
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "Mismatched users",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (missing token)", (done) => {
    request(app)
      .get("/api/users/wronguser/transactions/category/investment")
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
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
  });
});

describe("getTransactionsByGroup", () => {
  const today = new Date();
  let _id ;
  beforeAll(async () => {

    await transactions.deleteMany({});
    await categories.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});

    const createdUser = await User.create({
      username: "tokenuser",
      email: "token@token.token",
      password: "token",
      refreshToken: userToken,
      role: "Regular",
    });
    _id = createdUser._id; // Assign the _id after user creation
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });

    await transactions.create({
      username: "tokenuser",
      amount: 12.54,
      type: "investment",
      date: today,
    });
    await Group.create({
      name: "group1",
      members: [{ email: "token@token.token", user: _id }]
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .get("/api/groups/group1/transactions")
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data[0].username).toBe("tokenuser");
        expect(response.body.data[0].amount).toBe(12.54);
        expect(response.body.data[0].type).toBe("investment");
        expect(response.body.data[0].color).toBe("blue");
        expect(response.body.refreshedTokenMessage).toBe("")
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if the group doesn't exist ", (done) => {
    request(app)
      .get("/api/groups/groupx/transactions")
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The group doesn't exist",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (user not part of the group)", (done) => {
    request(app)
      .get("/api/groups/group1/transactions")
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

  test("Should return an error of authentication (not admin)", (done) => {
    request(app)
      .get("/api/transactions/groups/group1")
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

  test("Should return an error of authentication (token missing)", (done) => {
    request(app)
      .get("/api/groups/group1/transactions")
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
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
  });
});

describe("getTransactionsByGroupByCategory", () => {
  const today = new Date();
  let _id;
  beforeAll(async () => {

    await categories.deleteMany({});
    await User.deleteMany({});
    await transactions.deleteMany({});
    await Group.deleteMany({});
    const createdUser = await User.create({
        username: "tokenuser",
        email: "token@token.token",
        password: "token",
        refreshToken: userToken,
        role: "Regular",
      });
      _id = createdUser._id; // Assign the _id after user creation

    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
    await transactions.create({
      username: "tokenuser",
      amount: 12.54,
      type: "investment",
      date: today,
    });

    await Group.create({
      name: "group1",
      members: [{ email: "token@token.token", user: _id }],
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .get("/api/groups/group1/transactions/category/investment")
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data[0].username).toBe("tokenuser");
        expect(response.body.data[0].amount).toBe(12.54);
        expect(response.body.data[0].type).toBe("investment");
        expect(response.body.data[0].color).toBe("blue");
        expect(response.body.refreshedTokenMessage).toBe("")
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if the group doesn't exist ", (done) => {
    request(app)
      .get("/api/groups/groupx/transactions/category/investment")
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The group doesn't exist",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (user not part of the group)", (done) => {
    request(app)
      .get("/api/groups/group1/transactions/category/investment")
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

  test("Should return an error of authentication (not admin)", (done) => {
    request(app)
      .get("/api/transactions/groups/group1/category/investment")
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

  test("Should return an error of authentication (token missing)", (done) => {
    request(app)
      .get("/api/groups/group1/transactions")
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
    await categories.deleteMany({});
    await User.deleteMany({});
    await transactions.deleteMany({});
    await Group.deleteMany({});
  });
});

describe("deleteTransaction", () => {
  const today = new Date();
  let transaction1 = "";
  let transaction2 = "";

  beforeAll(async () => {
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
    await User.create({
      username: "tokenuser",
      email: "token@token.token",
      password: "token",
      refreshToken: userToken,
      role: "Regular",
    });
    await User.create({
      username: "tokenadmin",
      email: "admin@admin.admin",
      password: "token",
      refreshToken: adminToken,
      role: "Regular",
    });
    transaction1 = await transactions.create({
      username: "tokenuser",
      amount: 12.54,
      type: "investment",
      date: today,
    });
    transaction2 = await transactions.create({
      username: "tokenuser",
      amount: 14213,
      type: "work",
      date: today,
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .delete("/api/users/tokenuser/transactions")
      .send({
        _id: transaction1.id,
      })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: { message: "Transaction deleted" },
          refreshedTokenMessage: ""
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if missing parameters in body", (done) => {
    request(app)
      .delete("/api/users/tokenuser/transactions")
      .send({})
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Missing values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if empty strings in body", (done) => {
    request(app)
      .delete("/api/users/tokenuser/transactions")
      .send({
        _id: "",
      })
      .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty string values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if user does't exist", (done) => {
    request(app)
      .delete("/api/users/wronguser/transactions")
      .send({
        _id: transaction1.id,
      })
      .set(
        "Cookie",
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The user does not exist",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if transaction isn't made by requesting user", (done) => {
    request(app)
      .delete("/api/users/tokenadmin/transactions")
      .send({
        _id: transaction2.id,
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "The transaction is not made by the requesting user",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (missing token)", (done) => {
    request(app)
      .delete("/api/users/tokenuser/transactions")
      .send({
        _id: transaction1.id,
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
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
  });
});

describe("deleteTransactions", () => {1
  const today = new Date();
  let transaction1 = "";
  let transaction2 = "";

  beforeAll(async () => {
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});

    const tr1 = await transactions.create({
      username: "tokenuser",
      amount: 12.54,
      type: "investment",
      date: today,
    });
    transaction1 = tr1._id
    const tr2 =await transactions.create({
      username: "tokenuser",
      amount: 14213,
      type: "work",
      date: today,
    });
    transaction2 = tr2._id
    await categories.create({
      type: "investment",
      color: "blue",
    });
    await categories.create({
      type: "work",
      color: "red",
    });
    await User.create({
      username: "tokenuser",
      email: "token@token.token",
      password: "token",
      refreshToken: userToken,
      role: "Regular",
    });
    await User.create({
      username: "tokenadmin",
      email: "admin@admin.admin",
      password: "token",
      refreshToken: adminToken,
      role: "Regular",
    });
  });

  test("Nominal scenario", (done) => {
    request(app)
      .delete("/api/transactions")
      .send({
        _ids: [transaction1, transaction2],
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: { message: "Transactions deleted" },
          refreshedTokenMessage: ""
        });
        expect(response.status).toBe(200);
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if missing parameters in body", (done) => {
    request(app)
      .delete("/api/transactions")
      .send({})
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Missing values",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if empty strings in body", (done) => {
    request(app)
      .delete("/api/transactions")
      .send({
        _ids: ["", ""],
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty strings",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error if at least one transaction is not in database", (done) => {
    request(app)
      .delete("/api/transactions")
      .send({
        _ids: [transaction1],
      })
      .set("Cookie", `accessToken=${adminToken};refreshToken=${adminToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "At least one ID does not have a corresponding transaction.",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("Should return an error of authentication (user token)", (done) => {
    request(app)
      .delete("/api/transactions")
      .send({
        _ids: [transaction1, transaction2],
      })
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

  test("Should return an error of authentication (missing token)", (done) => {
    request(app)
      .delete("/api/transactions")
      .send({
        _ids: [transaction1, transaction2],
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
    await transactions.deleteMany({});
    await categories.deleteMany({});
    await User.deleteMany({});
  });
});
