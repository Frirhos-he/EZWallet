import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
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
    expect(mockRes.json).toHaveBeenCalledWith({
      data: { 
        type: mockReq.body.type,
        color: mockReq.body.color, 
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    })
    expect(categories.findOne).toHaveBeenCalledWith({
      type: mockReq.body.type,
    });
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
    checkMissingOrEmptyParams.mockReturnValue("empty or missing parameters")

    await createCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "empty or missing parameters"
    })
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

  test('should return an error of authentication', async () => {
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

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await createCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
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

    verifyAuth.mockImplementation(() => { throw Error("myerror")})
    
    await createCategory(mockReq,mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
    //expect(mockRes.json).toHaveProperty("error");            // Additional assertions for the response if needed
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
    checkMissingOrEmptyParams.mockReturnValue("empty or missing parameters")

    await updateCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "empty or missing parameters"
    })
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

  test('should return an error of authentication', async () => {
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

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await updateCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
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

    verifyAuth.mockImplementation(() => { throw Error("myerror")})
    
    await updateCategory(mockReq,mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
    //expect(mockRes.json).toHaveProperty("error");            // Additional assertions for the response if needed
  });
})

describe("deleteCategory", () => { 
  test('should delete a category successfully', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        types: ['type1']
      },
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(categories, "find").mockImplementation(() => (
        [{
          color: 'color1',
          type: 'type1',
          createdAt: '1'
        },
        {
          color: 'color2',
          type: 'type2',
          createdAt: '2'
        }]
    ))
    jest.spyOn(categories, "findOne").mockImplementation(() => true)

    jest.spyOn(transactions, "updateMany").mockImplementation(() => ({ modifiedCount: 1 }))
    jest.spyOn(categories, "deleteMany").mockImplementation(() => true)

    await deleteCategory(mockReq, mockRes)

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
          message: "Categories deleted",
          count: 1,
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    })
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(categories.find).toHaveBeenCalledWith({});
  });

  test('should return an error if missing field in body', async () => {
          // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        
      },
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(categories, "find").mockImplementation(() => (
        [{
          color: 'color1',
          type: 'type1',
          createdAt: '1'
        },
        {
          color: 'color2',
          type: 'type2',
          createdAt: '2'
        }]
    ))
    jest.spyOn(categories, "findOne").mockImplementation(() => true)

    await deleteCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "types object not inserted" 
    })
  });

  test('should return an error if there\a an empty string', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        types: ['type1', '']
      },
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(categories, "find").mockImplementation(() => (
        [{
          color: 'color1',
          type: 'type1',
          createdAt: '1'
        },
        {
          color: 'color2',
          type: 'type2',
          createdAt: '2'
        }]
    ))
    jest.spyOn(categories, "findOne").mockImplementation(() => true)

    await deleteCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error:  "at least one of the types in the array is an empty string"
    })
  });

  test('should return an error if there\a a category to be deleted that is not in the database', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        types: ['type3', 'type1']
      },
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(categories, "find").mockImplementation(() => (
        [{
          color: 'color1',
          type: 'type1',
          createdAt: '1'
        },
        {
          color: 'color2',
          type: 'type2',
          createdAt: '2'
        }]
    ))
    jest.spyOn(categories, "findOne").mockImplementation(() => true).mockReturnValueOnce(false)

    await deleteCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error:  "Category for type 'type3' not found"
    })
  });

  test('should return an error if there\a only one category in the database', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        types: ['type3', 'type1']
      },
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(categories, "find").mockImplementation(() => (
        [{
          color: 'color1',
          type: 'type1',
          createdAt: '1'
        }]
    ))
    jest.spyOn(categories, "findOne").mockImplementation(() => true)

    await deleteCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
        error: "Only one category remaining in database"
    })
  });

  test('should return an error of authentication', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        types: ['type1']
      },
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await deleteCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        types: ['type1']
      },
    };


    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockImplementation(() => { throw Error("myerror")})
    
    await deleteCategory(mockReq,mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
    //expect(mockRes.json).toHaveProperty("error");            // Additional assertions for the response if needed
  });
})

describe("getCategories", () => {
  test('should return all the categories', async () => {
    // Mock input data
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
  
    // Mock simple authentication
    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    // Mock categories.find method to return categories data
    const categoriesData = [
      { type: 'category1', color: 'color1' },
      { type: 'category2', color: 'color2' },
    ];
    categories.find.mockResolvedValue(categoriesData);

    // Make the request to get categories
    await getCategories(mockReq, mockRes)

    // Check the response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: categoriesData,
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
    expect(categories.find).toHaveBeenCalled();
  });
  
  test('should return an error of authentication', async () => {
    // Mock input data
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

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await getCategories(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
     // Mock input data
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

    verifyAuth.mockImplementation(() => { throw Error("myerror")})
    
    await getCategories(mockReq,mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
  });
});

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
        username: ''
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
    checkMissingOrEmptyParams.mockReturnValue("empty or missing parameters")  ///Missing parameters

    await createTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "empty or missing parameters" //message is updated in another function
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

  test('should return an error of authentication', async () => {
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

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await createTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
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

   verifyAuth.mockImplementation(() => { throw Error("myerror")})
   
   await createTransaction(mockReq,mockRes);

   expect(mockRes.status).toHaveBeenCalledWith(400);
   expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
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

  test('should return an error of authentication', async () => {
    // Mock input data
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

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await getAllTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
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

   verifyAuth.mockImplementation(() => { throw Error("myerror")})
   
   await getAllTransactions(mockReq,mockRes);

   expect(mockRes.status).toHaveBeenCalledWith(400);
   expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
  });
})

describe("getTransactionsByUser", () => { 
  test("should return all transactions of a user ", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
      },
      url: "/transactions/users/user1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
    handleAmountFilterParams.mockReturnValue({ date: { $gte: "from", $lte: "to" } })
    handleDateFilterParams.mockReturnValue({amount: { $gte: "minInt", $lte: "maxInt" }})

    jest.spyOn(User, "findOne").mockImplementation(() => true);
    transactions.aggregate.mockResolvedValue([{
      _id: 0,
      username: "user1",
      amount: 10,
      type: "type1",
      categories_info: {
          type: "type1",
          color: "red",
      },
      date: "YYYY-MM-DD",
    }])    

    await getTransactionsByUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({
      data: [{
          username: "user1",
          amount: 10,
          type: "type1",
          color: "red",
          date: "YYYY-MM-DD",
      }],
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(transactions.aggregate).toHaveBeenCalled()
  });

  test("should return an error if user doesn't exist ", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
      },
      url: "/transactions/users/user1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(User, "findOne").mockImplementation(() => false);

    await getTransactionsByUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
        error: "the user does not exist"
    });
    expect(transactions.aggregate).not.toHaveBeenCalled()
  });

  test('should return an error of authentication (admin)', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
      },
      url: "/transactions/users/user1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('should return an error of authentication (user)', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
      },
      url: "/users/user1/transactions"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await getTransactionsByUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
      },
      url: "/transactions/users/user1"
    };

   const mockRes = {
     locals: {
         refreshedTokenMessage: "",
     },
     status: jest.fn().mockReturnThis(),
     json: jest.fn(),
   };

   verifyAuth.mockImplementation(() => { throw Error("myerror")})
   
   await getTransactionsByUser(mockReq,mockRes);

   expect(mockRes.status).toHaveBeenCalledWith(400);
   expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
  });
})

describe("getTransactionsByUserByCategory", () => { 
  test('should return all transactions of a user of a specific category ', async () => {
      // Mock input data
      const mockReq = {
        cookies: {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        },
        params: {
          username: "user1",
          category: "type1"
        },
        url: "/transactions/users/user1/categories/type1"
      };

      const mockRes = {
        locals: {
            refreshedTokenMessage: "",
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

      jest.spyOn(User, "findOne").mockImplementation(() => true);
      jest.spyOn(categories, "findOne").mockImplementation(() => true);
      transactions.aggregate.mockResolvedValue([{
        _id: 0,
        username: "user1",
        amount: 10,
        type: "type1",
        categories_info: {
            type: "type1",
            color: "red",
        },
        date: "YYYY-MM-DD",
      }])    

      await getTransactionsByUserByCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        data: [{
            username: "user1",
            amount: 10,
            type: "type1",
            color: "red",
            date: "YYYY-MM-DD",
        }],
        refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
      });

      expect(transactions.aggregate).toHaveBeenCalled()
  });

  test('should return an error if the user doesn\'t exist ', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
        category: "type1"
      },
      url: "/transactions/users/user1/categories/type1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(User, "findOne").mockImplementation(() => false);

    await getTransactionsByUserByCategory(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "The user does not exist"
    });

    expect(transactions.aggregate).not.toHaveBeenCalled()
  });

  test('should return an error if the category doesn\'t exist ', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
        category: "type1"
      },
      url: "/transactions/users/user1/categories/type1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(User, "findOne").mockImplementation(() => true);
    jest.spyOn(categories, "findOne").mockImplementation(() => false);

    await getTransactionsByUserByCategory(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "The category does not exist"
    });

    expect(transactions.aggregate).not.toHaveBeenCalled()
  });

  test('should return an error of authentication (admin)', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
        category: "type1"
      },
      url: "/transactions/users/user1/categories/type1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('should return an error of authentication (user)', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
        category: "type1"
      },
      url: "/users/username1/transactions/category/type1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await getTransactionsByUserByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1",
        category: "type1"
      },
      url: "/transactions/users/user1/categories/type1"
    };


   const mockRes = {
     locals: {
         refreshedTokenMessage: "",
     },
     status: jest.fn().mockReturnThis(),
     json: jest.fn(),
   };

   verifyAuth.mockImplementation(() => { throw Error("myerror")})
   
   await getTransactionsByUserByCategory(mockReq,mockRes);

   expect(mockRes.status).toHaveBeenCalledWith(400);
   expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
  });
})

describe("getTransactionsByGroup", () => { 
  test("should return all transactions of a group ", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        name: "group1",
      },
      url: "/transactions/groups/group1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    
    jest.spyOn(Group, "findOne").mockResolvedValue({
      _id: 0,
      name: "group1",
      members: [
          {
              email: "prova1@gmail.com",
              user: { _id: 0 }
          },
          {
            email: "prova2@gmail.com",
            user: { _id: 1 }
          }
      ]
    });
    jest.spyOn(User, "find").mockResolvedValue([
      { username: "username1"},
      { username: "username2" }
    ]);

    transactions.aggregate.mockResolvedValue([
      {
      _id: 0,
      username: "user1",
      amount: 10,
      type: "type1",
      categories_info: {
          type: "type1",
          color: "red",
      },
      date: "YYYY-MM-DD",},
      {
        _id: 0,
        username: "user2",
        amount: 10,
        type: "type1",
        categories_info: {
            type: "type1",
            color: "red",
        },
        date: "YYYY-MM-DD",
      }
    ])    

    await getTransactionsByGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: [
        {
          username: "user1",
          amount: 10,
          type: "type1",
          color: "red",
          date: "YYYY-MM-DD",
        },
        {
          username: "user2",
          amount: 10,
          type: "type1",
          color: "red",
          date: "YYYY-MM-DD",
        }
    ],
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(transactions.aggregate).toHaveBeenCalled()
  });

  test("should return an error if the group doesn't exist ", async() => {
     // Mock input data
     const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        name: "group1",
      },
      url: "/transactions/groups/group1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    
    jest.spyOn(Group, "findOne").mockResolvedValue(false);


    await getTransactionsByGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "The group doesn't exist"
    });
    expect(transactions.aggregate).not.toHaveBeenCalled()
  })

  test('should return an error of authentication (admin)', async () => {
      // Mock input data
      const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        name: "group1",
      },
      url: "/transactions/groups/group1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(Group, "findOne").mockResolvedValue({
      _id: 0,
      name: "group1",
      members: [
          {
              email: "prova1@gmail.com",
              user: { _id: 0 }
          },
          {
            email: "prova2@gmail.com",
            user: { _id: 1 }
          }
      ]
    });

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await getTransactionsByGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('should return an error of authentication (group)', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        name: "group1",
      },
      url: "/groups/group1/transactions"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(Group, "findOne").mockResolvedValue({
      _id: 0,
      name: "group1",
      members: [
          {
              email: "prova1@gmail.com",
              user: { _id: 0 }
          },
          {
            email: "prova2@gmail.com",
            user: { _id: 1 }
          }
      ]
    });

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await getTransactionsByGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
   // Mock input data
   const mockReq = {
    cookies: {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    },
    params: {
      name: "group1",
    },
    url: "/transactions/groups/group1"
  };


   const mockRes = {
     locals: {
         refreshedTokenMessage: "",
     },
     status: jest.fn().mockReturnThis(),
     json: jest.fn(),
   };

   verifyAuth.mockImplementation(() => { throw Error("myerror")})
   
   await getTransactionsByGroup(mockReq,mockRes);

   expect(mockRes.status).toHaveBeenCalledWith(400);
   expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
  });
})

describe("getTransactionsByGroupByCategory", () => { 
  test("should return all transactions of a group of a category", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        name: "group1",
        category: "type1"
      },
      url: "/transactions/groups/group1/category/type1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(categories, "findOne").mockResolvedValue(true)
    
    jest.spyOn(Group, "findOne").mockResolvedValue({
      _id: 0,
      name: "group1",
      members: [
          {
            email: "prova1@gmail.com",
            user: { _id: 0 }
          },
          {
            email: "prova2@gmail.com",
            user: { _id: 1 }
          }
      ]
    });
    jest.spyOn(User, "find").mockResolvedValue([
      { username: "username1"},
      { username: "username2" }
    ]);

    transactions.aggregate.mockResolvedValue([
      {
      _id: 0,
      username: "user1",
      amount: 10,
      type: "type1",
      categories_info: {
          type: "type1",
          color: "red",
      },
      date: "YYYY-MM-DD",},
      {
        _id: 0,
        username: "user2",
        amount: 10,
        type: "type1",
        categories_info: {
            type: "type1",
            color: "red",
        },
        date: "YYYY-MM-DD",
      }
    ])    

    await getTransactionsByGroupByCategory(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: [
        {
          username: "user1",
          amount: 10,
          type: "type1",
          color: "red",
          date: "YYYY-MM-DD",
        },
        {
          username: "user2",
          amount: 10,
          type: "type1",
          color: "red",
          date: "YYYY-MM-DD",
        }
    ],
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(transactions.aggregate).toHaveBeenCalled()
  });

  test("should return an error if the group doesn't exist ", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        name: "group1",
        category: "type1"
      },
      url: "/transactions/groups/group1/category/type1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(categories, "findOne").mockResolvedValue(true)
    
    jest.spyOn(Group, "findOne").mockResolvedValue(false);

    await getTransactionsByGroupByCategory(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "The group doesn't exist"
    });
    expect(transactions.aggregate).not.toHaveBeenCalled()
  });

  test("should return all transactions of a group of a category", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        name: "group1",
        category: "type1"
      },
      url: "/transactions/groups/group1/category/type1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(categories, "findOne").mockResolvedValue(false)
    
    jest.spyOn(Group, "findOne").mockResolvedValue({
      _id: 0,
      name: "group1",
      members: [
          {
            email: "prova1@gmail.com",
            user: { _id: 0 }
          },
          {
            email: "prova2@gmail.com",
            user: { _id: 1 }
          }
      ]
    });

    await getTransactionsByGroupByCategory(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "the category does not exist"
    });
    expect(transactions.aggregate).not.toHaveBeenCalled()
  });

  test('should return an error of authentication (admin)', async () => {
    // Mock input data
    const mockReq = {
    cookies: {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    },
    params: {
      name: "group1",
      category: "type1"
    },
    url: "/transactions/groups/group1/category/type1"
  };

  const mockRes = {
    locals: {
        refreshedTokenMessage: "",
    },
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  jest.spyOn(Group, "findOne").mockResolvedValue({
    _id: 0,
    name: "group1",
    members: [
        {
            email: "prova1@gmail.com",
            user: { _id: 0 }
        },
        {
          email: "prova2@gmail.com",
          user: { _id: 1 }
        }
    ]
  });

  verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

  await getTransactionsByGroupByCategory(mockReq, mockRes)

  expect(mockRes.status).toHaveBeenCalledWith(401)
  expect(mockRes.json).toHaveBeenCalledWith({
    error: "unauthorized"
  })
  })

  test('should return an error of authentication (group)', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        name: "group1",
        category: "type1"
      },
      url: "/groups/group1/transactions/category/type1"
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(Group, "findOne").mockResolvedValue({
      _id: 0,
      name: "group1",
      members: [
          {
              email: "prova1@gmail.com",
              user: { _id: 0 }
          },
          {
            email: "prova2@gmail.com",
            user: { _id: 1 }
          }
      ]
    });

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await getTransactionsByGroupByCategory(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        name: "group1",
        category: "type1"
      },
      url: "/transactions/groups/group1/category/type1"
    };

 
 
    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
 
    verifyAuth.mockImplementation(() => { throw Error("myerror")})
    
    await getTransactionsByGroupByCategory(mockReq,mockRes);
 
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
   });
})

describe("deleteTransaction", () => { 
  test('should successfully delete a transaction of a specific user', async () => {
    // Mock input data
    const mockDate = "2000-03-10"
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'usertest2'  
      },
      body: {
         _id: '3' 
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

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing or empty body
    User.findOne.mockResolvedValueOnce(true)  //user found
    transactions.findOne.mockResolvedValue({  //Transaction found
      _id: 3,
      username: 'usertest2',
      type: 'food',
      amount: 22,
      date: mockDate,
    })  
    transactions.deleteOne.mockResolvedValue(1)   //Deleted one transaction

    await deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          data: {message: "Transaction deleted"},
          refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    })
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.params.username });
    expect(transactions.findOne).toHaveBeenCalledWith({ _id: mockReq.body._id });
    expect(transactions.deleteOne).toHaveBeenCalledWith({ _id: mockReq.body._id });
  });

  test('should return an error if missing or empty body', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'usertest2'  
      },
      body: {
         _id: '' 
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
    checkMissingOrEmptyParams.mockReturnValue("empty or missing parameters")  //Missing or empty body

    await deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "empty or missing parameters"
    })
    expect(User.findOne).not.toHaveBeenCalled();
    expect(transactions.findOne).not.toHaveBeenCalled();
    expect(transactions.deleteOne).not.toHaveBeenCalled();
  });

  test('should return an error if user does\'t exist', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'usertest2'  
      },
      body: {
         _id: '3' 
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
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing or empty body
    User.findOne.mockResolvedValue(false)   //User not found

    await deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "The user does not exist"
    })
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.params.username });
    expect(transactions.findOne).not.toHaveBeenCalled();
    expect(transactions.deleteOne).not.toHaveBeenCalled();
  });

  test('should return an error if transaction does\'t exist', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'usertest2'  
      },
      body: {
         _id: '3' 
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
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing or empty body
    User.findOne.mockResolvedValue(true)   //User found
    transactions.findOne.mockResolvedValue(false)   //Transaction not found

    await deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "The transaction does not exist"
    })
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.params.username });
    expect(transactions.findOne).toHaveBeenCalledWith({ _id: mockReq.body._id });
    expect(transactions.deleteOne).not.toHaveBeenCalled();
  });

  test('should return an error if transaction isn\'t made by requesting user', async () => {
    // Mock input data
    const mockDate = "1993-10-10"
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'usertest2'  
      },
      body: {
         _id: '3' 
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
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing or empty body
    User.findOne.mockResolvedValue(true)   //User found
    transactions.findOne.mockResolvedValue({  //Transaction found
      _id: 3,
      username: 'userWithDifferentName',
      type: 'food',
      amount: 22,
      date: mockDate,
    }) 
    await deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "The transaction is not made by the requesting user"
    })
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.params.username });
    expect(transactions.findOne).toHaveBeenCalledWith({ _id: mockReq.body._id });
    expect(transactions.deleteOne).not.toHaveBeenCalled();
  });

  test('should return an error of authentication', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'usertest2'  
      },
      body: {
         _id: '3' 
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await deleteTransaction(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: 'usertest2'  
      },
      body: {
         _id: '3' 
      }
    };
 
    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
 
    verifyAuth.mockImplementation(() => { throw Error("myerror")})
    
    await deleteTransaction(mockReq,mockRes);
 
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
   });
})

describe("deleteTransactions", () => { 
  test('should successfully delete multiple transactions', async () => {
    // Mock input data
    const mockDate = "2000-03-10"
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
         _ids: ['0','2','4']
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    const mockFindReturn = [  
    {
      _id: 0,
      username: 'usertest1',
      amount: 25,
      type: 'food',
      date: mockDate,
    },
    {
      _id: 2,
      username: 'usertest2',
      amount: 12,
      type: 'sport',
      date: mockDate,
    },
    {
      _id: 4,
      username: 'usertest3',
      amount: 35,
      type: 'streaming',
      date: mockDate,
    }
  ];
    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing or empty body
    transactions.find.mockResolvedValue(mockFindReturn)  //Transactions found
    transactions.deleteMany.mockResolvedValue(3)   //Deleted one transaction

    await deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          data: {message: "Transactions deleted"},
          refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    })
    expect(transactions.find).toHaveBeenCalledWith({ _id: { $in: mockReq.body._ids } });
    expect(transactions.deleteMany).toHaveBeenCalledWith({ _id: { $in: mockReq.body._ids } });
  });

  test('should return an error if missing or empty body', async () => {
    // Mock input data
    const mockDate = "2000-03-10"
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
         _ids: ['','2','4']
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
    checkMissingOrEmptyParams.mockReturnValue(true)  //Missing or empty body
    
    await deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: true
    })
    expect(transactions.find).not.toHaveBeenCalled();
    expect(transactions.deleteMany).not.toHaveBeenCalled();
  });

  test('should return an error if at least one transaction is not in database', async () => {
    // Mock input data
    const mockDate = "2000-03-10"
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
         _ids: ['0','2','4']
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    const mockFindReturn = [  
    {
      _id: 0,
      username: 'usertest1',
      amount: 25,
      type: 'food',
      date: mockDate,
    },
    {
      _id: 2,
      username: 'usertest2',
      amount: 12,
      type: 'sport',
      date: mockDate,
    }
  ];
    verifyAuth.mockReturnValue({flag: true, cause:"authorized"}) //Authorized
    checkMissingOrEmptyParams.mockReturnValue(false)  //No missing or empty body
    transactions.find.mockResolvedValue(mockFindReturn)  //Transactions found (wrong number)

    await deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
          error: "At least one ID does not have a corresponding transaction."
    })
    expect(transactions.find).toHaveBeenCalledWith({ _id: { $in: mockReq.body._ids } });
    expect(transactions.deleteMany).not.toHaveBeenCalled();
  });

  test('should return an error of authentication', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
         _ids: ['0','2','4']
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({flag: false, cause:"unauthorized"})

    await deleteTransactions(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized"
    })
  })

  test('Exception thrown error catch', async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
         _ids: ['0','2','4']
      }
    };
 
    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
 
    verifyAuth.mockImplementation(() => { throw Error("myerror")})
    
    await deleteTransactions(mockReq,mockRes);
 
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
   });
})
