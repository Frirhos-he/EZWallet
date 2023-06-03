import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
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
  getTransactionsByUserByCategory
} from "../controllers/controller"
import { verifyAuth, checkMissingOrEmptyParams } from '../controllers/utils';

jest.mock('../models/model.js');
jest.mock('../controllers/utils')

beforeEach(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
});

describe("createCategory", () => {
  test('should create a new category successfully', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        type: 'testtype',
        color: 'testcolor',
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
    checkMissingOrEmptyParams.mockReturnValue(false)

    jest.spyOn(categories, "findOne").mockImplementation(() => false)
    categories.prototype.save.mockResolvedValue({
      type: mockReq.body.type,
      color: mockReq.body.color,
    });

    await createCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
    expect(categories.prototype.save).toHaveBeenCalled();
  });

  test('should return an error if missing or empty parameters', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        color: '',
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
    checkMissingOrEmptyParams.mockReturnThis(true)


    await createCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(categories.findOne).not.toHaveBeenCalledWith();
    expect(categories.prototype.save).not.toHaveBeenCalled();
  });

  test('should return an error if category already exists', async () => {
     // Mock input data
     const mockReq = {
      body: {
        type: 'testtype',
        color: 'testcolor',
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };


    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
    checkMissingOrEmptyParams.mockReturnThis(true)

    categories.findOne.mockResolvedValue({ type: mockReq.body.type });

    //jest.spyOn(categories, "findOne").mockImplementation(() => true)

    await createCategory(mockReq, mockRes)

    // Check the response
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
    expect(categories.prototype.save).not.toHaveBeenCalled();
  });
})
  

describe("updateCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

// describe("getCategories", () => {
//   test('should return categories data for simple authenticated user', async () => {
//     // Mock simple authentication
//     const simpleAuthMock = {
//       flag: true,
//     };
//     jest.mock('../auth', () => ({
//       verifyAuth: jest.fn(() => simpleAuthMock),
//     }));

//     // Mock categories.find method to return categories data
//     const categoriesData = [
//       { type: 'category1', color: 'color1' },
//       { type: 'category2', color: 'color2' },
//     ];
//     categories.find.mockResolvedValue(categoriesData);

//     // Make the request to get categories
//     const response = await request(app).get('/categories');

//     // Check the response
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toEqual({
//       data: categoriesData,
//       refreshedTokenMessage: undefined,
//     });
//     expect(categories.find).toHaveBeenCalled();
//   });

//   test('should return an error if not authenticated as simple user', async () => {
//     // Mock simple authentication failure
//     const simpleAuthMock = {
//       flag: false,
//       cause: 'Unauthorized',
//     };
//     jest.mock('../auth', () => ({
//       verifyAuth: jest.fn(() => simpleAuthMock),
//     }));

//     // Make the request to get categories
//     const response = await request(app).get('/categories');

//     // Check the response
//     expect(response.statusCode).toBe(401);
//     expect(response.body).toEqual({ error: 'Unauthorized' });
//     expect(categories.find).not.toHaveBeenCalled();
//   });

//   test('should return an error if an error occurs during category retrieval', async () => {
//     // Mock simple authentication
//     const simpleAuthMock = {
//       flag: true,
//     };
//     jest.mock('../auth', () => ({
//       verifyAuth: jest.fn(() => simpleAuthMock),
//     }));

//     // Mock categories.find method to throw an error
//     const errorMessage = 'Error retrieving categories';
//     categories.find.mockRejectedValue(new Error(errorMessage));

//     // Make the request to get categories
//     const response = await request(app).get('/categories');

//     // Check the response
//     expect(response.statusCode).toBe(400);
//     expect(response.body).toEqual({ error: errorMessage });
//     expect(categories.find).toHaveBeenCalled();
//   });
// });

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
