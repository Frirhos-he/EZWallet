import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
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

jest.mock('../controllers/utils')
jest.mock("../models/User.js")

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  jest.clearAllMocks()
  //additional `mockClear()` must be placed here
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

describe("deleteUser", () => { })

describe("deleteGroup", () => { })