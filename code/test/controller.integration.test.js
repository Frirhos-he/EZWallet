import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import { Group, User } from "../models/User";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const adminToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFAaC5pdCIsImlkIjoiNjQ3NjM3MDkxNzQzMTYwY2ZhMzNlMmMwIiwidXNlcm5hbWUiOiJhIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNjg2MDQ3NzMxLCJleHAiOjE2ODY2NTI1MzF9.zOR658eOOeaH-ixDii4q9m3S-V-tri3STVxgViSPc8s";

const userToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVAaC5pdCIsImlkIjoiNjQ3NWEyOGE2ZjlhZTU5ZmQ0YjZiOTM4IiwidXNlcm5hbWUiOiJVc2VyIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODYwNDcwMTYsImV4cCI6MTY4NjA1MDYxNn0.tDNqdUIwwdhPlq6e4dg-Uni9_XcmStDiYMOy1rAGiHo";

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
        await User.create({
            username: "test",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });
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
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: {
                        type: "investment",
                        color: "blue",
                    },
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception user", (done) => {
        request(app)
            .post("/api/categories")
            .send({
                type: "investment",
                color: "blue",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception no type", (done) => {
        request(app)
            .post("/api/categories")
            .send({
                color: "blue",
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Missing values",
                });
                done();
            })
            .catch((err) => done(err));
    });
      test("Exception empty type", (done) => {

        request(app)
            .post("/api/categories")
            .send({
                type: "",
                color: "blue",
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Empty string values",
                });
                done();
            })
            .catch((err) => done(err));
    });
        test("Exception category already present", (done) => {
        request(app)
            .post("/api/categories")
            .send({
                type: "investment",
                color: "blue",
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Category already exists",
                });
                done();
            })
            .catch((err) => done(err));
    });
        afterAll(async () => {
        await categories.deleteMany();
        await User.deleteMany();
    });
})

describe("updateCategory", () => { 
        const today = new Date();
        beforeEach(async () => {
        await categories.create({
            type: "investment",
            color: "blue",
        });
        await categories.create({
            type: "work",
            color: "red",
        });

        await User.create({
            username: "u",
            email: "u@h.it",
            password: "p",
            refreshToken: userToken,
            role: "Regular",
        });

        await User.create({
            username: "a",
            email: "a@h.it",
            password: "p",
            refreshToken: adminToken,
            role: "Admin",
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
    test("Nominal scenario admin ", (done) => {
        request(app)
            .patch("/api/categories/investment")
            .send({
                type: "joker",
                color: "blue",
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: {
                        message: "Category successfully updated",
                        count: 1,
                    },
                });
                done();
            })
            .catch((err) => done(err));
    });
})

describe("deleteCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getCategories", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getAllTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUser", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUserByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroup", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroupByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
