import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';

jest.mock('../models/model');

beforeEach(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
});
---------------------------------------------------------------
describe("createCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
}) 

import request from 'supertest';
import { app } from '../app';
import { categories } from '../models/model';

jest.mock('../models/model');

beforeEach(() => {
  categories.findOne.mockClear();
  categories.prototype.save.mockClear();
});

describe("createCategory", () => {
  test('should create a new category successfully', async () => {
    // Mock input data
    const reqBody = {
      type: 'testtype',
      color: 'testcolor',
    };

    // Mock categories.findOne method to return null (category doesn't exist)
    categories.findOne.mockResolvedValue(null);

    // Mock categories.prototype.save method
    categories.prototype.save.mockResolvedValue({
      type: reqBody.type,
      color: reqBody.color,
    });

    // Make the request to create a new category
    const response = await request(app).post('/create-category').send(reqBody);

    // Check the response
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      data: {
        type: reqBody.type,
        color: reqBody.color,
      },
    });
    expect(categories.findOne).toHaveBeenCalledWith({ type: reqBody.type });
    expect(categories.prototype.save).toHaveBeenCalled();
  });

  test('should return an error if missing or empty parameters', async () => {
    // Mock input data with missing or empty parameters
    const reqBody = {
      type: '',
      color: 'testcolor',
    };

    // Make the request to create a new category
    const response = await request(app).post('/create-category').send(reqBody);

    // Check the response
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Missing or empty parameters' });
    expect(categories.findOne).not.toHaveBeenCalled();
    expect(categories.prototype.save).not.toHaveBeenCalled();
  });

  test('should return an error if category already exists', async () => {
    // Mock input data with existing category
    const reqBody = {
      type: 'existingtype',
      color: 'testcolor',
    };

    // Mock categories.findOne method to return existing category
    categories.findOne.mockResolvedValue({ type: reqBody.type });

    // Make the request to create a new category
    const response = await request(app).post('/create-category').send(reqBody);

    // Check the response
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Category already exists' });
    expect(categories.findOne).toHaveBeenCalledWith({ type: reqBody.type });
    expect(categories.prototype.save).not.toHaveBeenCalled();
  });
  ---------------------------------------------------------------------------------------------

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
--------------------------------------------------------------
describe("getCategories", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';

jest.mock('../models/model');

beforeEach(() => {
  categories.find.mockClear();
}); 

describe("getCategories", () => {
  test('should return categories data for simple authenticated user', async () => {
    // Mock simple authentication
    const simpleAuthMock = {
      flag: true,
    };
    jest.mock('../auth', () => ({
      verifyAuth: jest.fn(() => simpleAuthMock),
    }));

    // Mock categories.find method to return categories data
    const categoriesData = [
      { type: 'category1', color: 'color1' },
      { type: 'category2', color: 'color2' },
    ];
    categories.find.mockResolvedValue(categoriesData);

    // Make the request to get categories
    const response = await request(app).get('/categories');

    // Check the response
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      data: categoriesData,
      refreshedTokenMessage: undefined,
    });
    expect(categories.find).toHaveBeenCalled();
  });

  test('should return an error if not authenticated as simple user', async () => {
    // Mock simple authentication failure
    const simpleAuthMock = {
      flag: false,
      cause: 'Unauthorized',
    };
    jest.mock('../auth', () => ({
      verifyAuth: jest.fn(() => simpleAuthMock),
    }));

    // Make the request to get categories
    const response = await request(app).get('/categories');

    // Check the response
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
    expect(categories.find).not.toHaveBeenCalled();
  });

  test('should return an error if an error occurs during category retrieval', async () => {
    // Mock simple authentication
    const simpleAuthMock = {
      flag: true,
    };
    jest.mock('../auth', () => ({
      verifyAuth: jest.fn(() => simpleAuthMock),
    }));

    // Mock categories.find method to throw an error
    const errorMessage = 'Error retrieving categories';
    categories.find.mockRejectedValue(new Error(errorMessage));

    // Make the request to get categories
    const response = await request(app).get('/categories');

    // Check the response
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: errorMessage });
    expect(categories.find).toHaveBeenCalled();
  });
});
--------------------------------------------------------------
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
