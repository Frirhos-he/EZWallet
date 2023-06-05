import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions } from '../models/model.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  createTransaction,
  deleteTransaction,
  deleteTransactions,
  getAllTransactions,
  getTransactionsByUser,
  getTransactionsByUserByCategory,
  getTransactionsByGroup,
  getTransactionsByGroupByCategory
} from "../controllers/controller"
import { verifyAuth, checkMissingOrEmptyParams, handleAmountFilterParams, handleDateFilterParams } from '../controllers/utils';
import {deleteGroup, deleteUser} from '../controllers/users';

jest.mock('../controllers/utils')
jest.mock("../models/model.js")
jest.mock("../models/User.js")

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  jest.clearAllMocks()
});

describe("getUsers", () => {
  test("should return empty list if there are no users", async () => {
    // //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    // jest.spyOn(User, "find").mockImplementation(() => [])
    // const response = await request(app)
    //   .get("/api/users")

    // expect(response.status).toBe(200)
    // expect(response.body).toEqual([])
  })

  test("should retrieve list of all users", async () => {
    // const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }, { username: 'test2', email: 'test2@example.com', password: 'hashedPassword2' }]
    // jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    // const response = await request(app)
    //   .get("/api/users")

    // expect(response.status).toBe(200)
    // expect(response.body).toEqual(retrievedUsers)
  })
})

describe("getUser", () => { })

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => {
  
  test('Nominal scenario', async () => {
    const mockReq = {
      body: {email: "a@h.it"}
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn(),
    locals: {
      refreshedTokenMessage: "",
     }
  };
  verifyAuth.mockReturnValue({flag: true, cause:"Authorized"})
  checkMissingOrEmptyParams.mockReturnValue(false)
  jest.spyOn(User, "findOne").mockImplementation({
    username: "u",
    email: "u@h.it",
    role: "Admin",
    refreshToken: "test"})
    jest.spyOn(Group, "findOne").mockReturnValue([{ members: [{ email: "c@h.it" }, { email: "c@h.it" }] }, { members: [{ email: "c@h.it" }, { email: "c@h.it" }] }]);
  transactions.countDocuments.mockReturnValue(0);
  jest.spyOn(transactions, "deleteMany").mockImplementation(()=>true);
  jest.spyOn(User, "deleteOne").mockImplementation(true);
  jest.spyOn(Group, "updateOne").mockImplementation(() => ({ modifiedCount: 0 }));
  await deleteUser(mockReq,mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalled();
  expect(mockRes.json).toHaveBeenCalledWith({ data: { 
    deletedTransactions: "0",
    deletedFromGroup: false,
  } });
  })
})

describe("deleteGroup", () => { 
 
  test('Nominal scenario', async () => {
    const mockReq = {
      body: {name: "pippo"}
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn(),
    locals: {
      refreshedTokenMessage: "",
     }
  };
  checkMissingOrEmptyParams.mockReturnValue(false)
  jest.spyOn(Group, "findOne").mockImplementation(() => true)
  verifyAuth.mockReturnValue({flag: true, cause:"Authorized"})
  jest.spyOn(Group, "deleteOne").mockImplementation(() => true)
  await deleteGroup(mockReq,mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(200);
  expect(mockRes.json).toHaveBeenCalled();
  expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "Group deleted successfully" }, message: mockRes.locals.refreshedToken });
  })
  test('Missin params scenario', async () => {
    const mockReq = {
      body: {name: " "}
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn(),
    locals: {
      refreshedTokenMessage: "",
     }
  };
  checkMissingOrEmptyParams.mockReturnValue("Missing values")

  await deleteGroup(mockReq,mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalled();
  expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing values" });
  }) 
  test("The group doesn't exist scenario", async () => {
    const mockReq = {
      body: {name: "name"}
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn(),
    locals: {
      refreshedTokenMessage: "",
     }
  };
  checkMissingOrEmptyParams.mockReturnValue(false)
  jest.spyOn(Group, "findOne").mockImplementation(() => false)
 

  await deleteGroup(mockReq,mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalled();
  expect(mockRes.json).toHaveBeenCalledWith({ error: "The group doesn't exist" });
  }) 
  test("admin not authentificated", async () => {
    const mockReq = {
      body: {name: "name"}
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn(),
    locals: {
      refreshedTokenMessage: "",
     }
  };
  checkMissingOrEmptyParams.mockReturnValue(false)
  jest.spyOn(Group, "findOne").mockImplementation(() => true)
  verifyAuth.mockReturnValue({flag: false, cause:"myerror"})
  jest.spyOn(Group, "deleteOne").mockImplementation(() => true)
  await deleteGroup(mockReq,mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(401);
  expect(mockRes.json).toHaveBeenCalled();
  expect(mockRes.json).toHaveBeenCalledWith({ error: " adminAuth: " + "myerror" });
  }) 
  test("throw expection", async () => {
    const mockReq = {
      body: {name: "name"}
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn(),
    locals: {
      refreshedTokenMessage: "",
     }
  };
  checkMissingOrEmptyParams.mockReturnValue(false)
  jest.spyOn(Group, "findOne").mockImplementation(() => true)
  verifyAuth.mockReturnValue({flag: true, cause:"Authorized"})
  jest.spyOn(Group, "deleteOne").mockImplementation(() => {throw new Error("eccomi")})
  await deleteGroup(mockReq,mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalled();
  expect(mockRes.json).toHaveBeenCalledWith({ error: "eccomi" });
  }) 
  
})