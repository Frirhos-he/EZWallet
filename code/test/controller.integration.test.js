import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import { Group, User } from "../models/User";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"

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
/*
describe("createCategory", () => { 
      beforeAll(async () => {
        await categories.create({
            type: "gym",
            color: "#FFFFFF",
        });
    });
    
    test('should create a new category successfully', (done) => {

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
                expect(response.body).toStrictEqual({
                    data: {
                        type: "investment",
                        color: "blue",
                    },
                });
                expect(response.status).toBe(200);
                done();
            })
            .catch((err) => done(err));
    });
    
    test("should return an error if an user try to call the api", (done) => {
        request(app)
            .post("/api/categories")
            .send({
                type: "investment",
                color: "blue",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.json).toStrictEqual({
                    error: "Mismatch role"
                })
                done();
            })
            .catch((err) => done(err));
    });
    
    test("should return an error if missing field in body", (done) => {
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
    
    test("should return an error if a field is an empty string", (done) => {

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
    
    test('should return an error if category already exists', (done) => {
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

    test('should return an error if the tokens are not present', (done) => {
        
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

    afterAll(async () => {
        await categories.deleteMany();
    });
})
*/
describe("updateCategory", () => { 
    const today = new Date();
    beforeAll(async () => {
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

    test('should update a category successfully', (done) => {
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

    test('should return an error if missing parameters', (done) => {
        request(app)
            .patch("/api/categories/investment")
            .send({
                type: "joker",
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

    test('should return an error if empty strings parameters', (done) => {
        request(app)
            .patch("/api/categories/investment")
            .send({
                type: "joker",
                color: "",
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

    test('should return an error if category in route parameters doesn\'t exists', (done) => {
        request(app)
            .patch("/api/categories/wrong")
            .send({
                type: "joker",
                color: "blue",
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Category of type 'wrong' not found"
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error if category in body already exists', (done) => {
        request(app)
            .patch("/api/categories/work")
            .send({
                type: "third",
                color: "blue",
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Category of type 'third' already exists",
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error of authentication (user token)', (done) => {
        request(app)
            .patch("/api/categories/investment")
            .send({
                type: "joker",
                color: "blue",
            })
            .set(
                "Cookie",
                `accessToken=${userToken};refreshToken=${userToken}`
            )
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "Mismatch role"
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error of authentication (missing token)', (done) => {
        request(app)
            .patch("/api/categories/investment")
            .send({
                type: "joker",
                color: "blue",
            })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "Unauthorized"
                });
                done();
            })
            .catch((err) => done(err));
    });
    
    afterAll(async () => {
        await categories.deleteMany();
        await transactions.deleteMany();
    });
})

describe("deleteCategory", () => { 
    const today = new Date();
    beforeAll(async () => {
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

    test('should delete a category successfully', (done) => {
        
        request(app)
            .delete("/api/categories")
            .send({
                types: ["work"],
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: { message: "Categories deleted", count: 2 },
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error if missing field in body', (done) => {
        
        request(app)
            .delete("/api/categories")
            .send({
                
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "types object not inserted" 
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error if there\a an empty string', (done) => {
        
        request(app)
            .delete("/api/categories")
            .send({
                types: [""],
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error:  "at least one of the types in the array is an empty string"
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error if there\a a category to be deleted that is not in the database', (done) => {
        
        request(app)
            .delete("/api/categories")
            .send({
                types: ["wrong"],
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error:  "Category for type 'wrong' not found"
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error if there\a only one category in the database', (done) => {
        request(app)
            .delete("/api/categories")
            .send({
                types: ["investment"],
            })
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Only one category remaining in database"
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error of authentication (user token)', (done) => {
        
        request(app)
            .delete("/api/categories")
            .send({
                types: ["work"],
            })
            .set(
                "Cookie",
                `accessToken=${userToken};refreshToken=${userToken}`
            )
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "Mismatch role"
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error of authentication (missing token)', (done) => {
        
        request(app)
            .delete("/api/categories")
            .send({
                types: ["work"],
            })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "Unauthorized"
                });
                done();
            })
            .catch((err) => done(err));
    });

    afterAll(async () => {
        await categories.deleteMany();
        await transactions.deleteMany();
    });
})

describe("getCategories", () => { 
    beforeAll(async () => {
        await categories.create({
            type: "investment",
            color: "blue",
        });
        await categories.create({
            type: "work",
            color: "red",
        });
    });

    test('should return all the categories', (done) => {
        request(app)
            .get("/api/categories")
            .set(
                "Cookie",
                `accessToken=${adminToken};refreshToken=${adminToken}`
            )
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
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('should return an error of authentication (missing token)', (done) => {
        request(app)
            .get("/api/categories")
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toEqual({
                    error: "Unauthorized"
                });
                done();
            })
            .catch((err) => done(err));
    });

    afterAll(async () => {
        await categories.deleteMany();
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
