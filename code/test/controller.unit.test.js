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

describe("createCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
---------------------------------------------------------------------------
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
