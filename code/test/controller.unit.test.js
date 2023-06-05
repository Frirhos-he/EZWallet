import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { User } from '../models/User.js';
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

beforeEach (() =>{
  jest.clearAllMocks();
})

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
    checkMissingOrEmptyParams.mockReturnValue(true)


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
    checkMissingOrEmptyParams.mockReturnValue(false)

    jest.spyOn(categories, "findOne").mockImplementation(() => true)

    await createCategory(mockReq, mockRes)

    // Check the response
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({error: "Category already exists"})
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
    expect(categories.prototype.save).not.toHaveBeenCalled();
  });
})
  

describe("updateCategory", () => { 
  test('should update a category successfully', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        type: 'newvalue',
        color: 'testcolor',
      },
      params: {
        type: 'tobechanged'
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

    jest.spyOn(categories, "findOne").mockImplementation(() => false).mockReturnValueOnce(true)
    //jest.spyOn(categories, "findOne").mockImplementation(() => false)

    jest.spyOn(categories, "updateOne").mockImplementation(() => {})
    jest.spyOn(transactions, "updateMany").mockImplementation(() => ({ modifiedCount: 5 }))

    await updateCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
          message: "Category successfully updated",
          count: 5,
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    })
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
    expect(categories.updateOne).toHaveBeenCalledWith(
      { type: mockReq.params.type },
      { $set: { type: mockReq.body.type,  color: mockReq.body.color } }
    )
    expect(categories.updateMany).toHaveBeenCalledWith(
      { type: mockReq.params.type },
      { $set: { type: mockReq.body.type } }
    )
  });

  test('should return an error if missing or empty parameters', async () => {
      // Mock input data
      const mockReq = {
        cookies: {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        },
        body: {
          type: 'newvalue',
          color: '',
        },
        params: {
          type: 'tobechanged'
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
    checkMissingOrEmptyParams.mockReturnValue(true)

    await updateCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(categories.findOne).not.toHaveBeenCalled();
    expect(categories.updateOne).not.toHaveBeenCalledWith()
    expect(categories.updateMany).not.toHaveBeenCalledWith()
  });

  test('should return an error if category in route parameters doesn\'t exists', async () => {
         // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        type: 'newvalue',
        color: 'testcolor',
      },
      params: {
        type: 'tobechanged'
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

    await updateCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Category of type \'tobechanged\' not found"
    })
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
    expect(categories.updateOne).not.toHaveBeenCalledWith()
    expect(categories.updateMany).not.toHaveBeenCalledWith()
  });

  test('should return an error if category in body already exists', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        type: 'newvalue',
        color: 'testcolor',
      },
      params: {
        type: 'tobechanged'
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

    jest.spyOn(categories, "findOne").mockImplementation(() => true)

    await updateCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Category of type 'newvalue' already exists"
    })
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
    expect(categories.updateOne).not.toHaveBeenCalledWith()
    expect(categories.updateMany).not.toHaveBeenCalledWith()
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
  test('should create a new transaction successfully', async () => {
    // Mock input data
    const mockDate = "YYYY-MM-DD";
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'testusername',
      },
      body: {
        username: 'testusername',
        type: 'testtype',
        amount: 50,
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing params

    jest.spyOn(User, "findOne").mockImplementation(() => true)  //Found username (both route and body)
    jest.spyOn(categories, "findOne").mockImplementation(() => true)  //Found matching category
    transactions.prototype.save.mockResolvedValue({
      username: mockReq.body.username,
      type: mockReq.body.type,
      amount: mockReq.body.amount,
      date: mockDate
    });

    await createTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          data : {username: mockReq.body.username, amount: mockReq.body.amount , type: mockReq.body.type, date: mockDate } ,
          refreshedTokenMessage : mockRes.locals.refreshedTokenMessage 
    })
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username });
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.params.username });
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
    expect(transactions.prototype.save).toHaveBeenCalled();
  });

  test('should return an error when empty or missing parameters', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'testusername',
      },
      body: {
        username: 'testusername'
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(true)  ///Missing parameters

    await createTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "" //message is updated in another function
    })
    expect(User.findOne).not.toHaveBeenCalled();
    expect(categories.findOne).not.toHaveBeenCalled();
    expect(transactions.prototype.save).not.toHaveBeenCalled();
  });

  test('should return an error if amount can\'t be parsed as float', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'testusername',
      },
      body: {
        username: 'testusername',
        type: 'testtype',
        amount: 'invalidamount',
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing params

    await createTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "Invalid amount value"
    })
    expect(User.findOne).not.toHaveBeenCalled();
    expect(categories.findOne).not.toHaveBeenCalled();
    expect(transactions.prototype.save).not.toHaveBeenCalled();
  });
  
  test('should return an error if requesting user doesn\'t match involved user', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'testusername1',
      },
      body: {
        username: 'testusername2',
        type: 'testtype',
        amount: 50,
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing params

    await createTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "Username mismatch"
    })
    expect(User.findOne).not.toHaveBeenCalled();
    expect(categories.findOne).not.toHaveBeenCalled();
    expect(transactions.prototype.save).not.toHaveBeenCalled();
  });

  test('should return an error if involved user doesn\'t exist', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'testusername',
      },
      body: {
        username: 'testusername',
        type: 'testtype',
        amount: 50,
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing params
    User.findOne.mockResolvedValueOnce(false) //Involved user not found

    await createTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "The user does not exist"
    })
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username });
    expect(categories.findOne).not.toHaveBeenCalled();
    expect(transactions.prototype.save).not.toHaveBeenCalled();
  });

  test('should return an error if category doesn\'t exist', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'testusername',
      },
      body: {
        username: 'testusername',
        type: 'testtype',
        amount: 50,
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing params
    User.findOne.mockResolvedValueOnce(true)  //Involved user found
    jest.spyOn(categories, "findOne").mockImplementation(() => false)  //Category not found

    await createTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "The category does not exist"
    })
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username });
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
    expect(transactions.prototype.save).not.toHaveBeenCalled();
  });

  test('should return an error if requesting user doesn\'t exist', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'testusername',
      },
      body: {
        username: 'testusername',
        type: 'testtype',
        amount: 50,
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing params
    User.findOne.mockResolvedValueOnce(true)  //Involved user found
    jest.spyOn(categories, "findOne").mockImplementation(() => true)  //Category found
    User.findOne.mockResolvedValueOnce(false)  //Requesting user not found

    await createTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "The requesting user does not exist"
    })
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username });
    expect(User.findOne).toHaveBeenLastCalledWith({ username: mockReq.params.username });
    expect(User.findOne).toHaveBeenCalledTimes(2);
    expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
    expect(transactions.prototype.save).not.toHaveBeenCalled();
  });
})

describe("getAllTransactions", () => { 
  test('should return all transactions by all users', async () => {
    // Mock input data
    const mockDate = "2000-03-10"
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockDB = [
      {
        _id: 0,
        username: 'usertest1',
        amount: 25,
        type: 'food',
        categories_info: {
            type: 'food',
            color: '#1023BC',
        },
        date: mockDate,
      },
      {
        _id: 1,
        username: 'usertest1',
        amount: 10,
        type: 'gift',
        categories_info: {
            type: 'gift',
            color: '#ABC0FF',
        },
        date: mockDate,
      },
      {
        _id: 2,
        username: 'usertest2',
        amount: 12,
        type: 'sport',
        categories_info: {
            type: 'sport',
            color: '#000000',
        },
        date: mockDate,
      },
      {
        _id: 3,
        username: 'usertest2',
        amount: 22,
        type: 'food',
        categories_info: {
            type: 'food',
            color: '#1023BC',
        },
        date: mockDate,
      },
      {
        _id: 4,
        username: 'usertest3',
        amount: 35,
        type: 'streaming',
        categories_info: {
            type: 'streaming',
            color: '#00FF44',
        },
        date: mockDate,
      },
      {
        _id: 5,
        username: 'usertest2',
        amount: 9,
        type: 'sport',
        categories_info: {
            type: 'sport',
            color: '#000000',
        },
        date: mockDate,
      },
    ];

    const mockAggregateReturn = [
      {
        username: 'usertest1',
        amount: 25,
        type: 'food',
        color: '#1023BC',
        date: mockDate,
      },
      {
        username: 'usertest1',
        amount: 10,
        type: 'gift',
        color: '#ABC0FF',
        date: mockDate,
      },
      {
        username: 'usertest2',
        amount: 12,
        type: 'sport',
        color: '#000000',
        date: mockDate,
      },
      {
        username: 'usertest2',
        amount: 22,
        type: 'food',
        color: '#1023BC',
        date: mockDate,
      },
      {
        username: 'usertest3',
        amount: 35,
        type: 'streaming',
        color: '#00FF44',
        date: mockDate,
      },
      {
        username: 'usertest2',
        amount: 9,
        type: 'sport',
        color: '#000000',
        date: mockDate,
      },
    ];

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    transactions.aggregate.mockResolvedValue(mockDB) //Aggregated transactions

    await getAllTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          data: mockAggregateReturn,
          refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    })
    
    expect(transactions.aggregate).toHaveBeenCalled();
  });

  test('should return empty array when there are no transactions', async () => {
    // Mock input data
    const mockDate = "2000-03-10"
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockDB = [];

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    transactions.aggregate.mockResolvedValue(mockDB) //Empty aggregate

    await getAllTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          data: [],
          refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    })
    
    expect(transactions.aggregate).toHaveBeenCalled();
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
