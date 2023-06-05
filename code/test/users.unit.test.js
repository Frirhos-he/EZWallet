import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import jwt from 'jsonwebtoken';
import {
  getUsers,
  getUser,
  createGroup,
  getGroups,
  getGroup,
  addToGroup,
  removeFromGroup,
  deleteUser,
  deleteGroup
} from "../controllers/users"
import { verifyAuth, checkMissingOrEmptyParams, handleAmountFilterParams, handleDateFilterParams } from '../controllers/utils';
import {deleteGroup} from '../controllers/users';

jest.mock('jsonwebtoken');
jest.mock('../controllers/utils')
jest.mock("../models/User.js")
jest.mock('../controllers/utils');

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  jest.clearAllMocks()
});

describe("getUsers", () => {
  test("should retrieve list of all users", async () => {
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

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(User, "find").mockResolvedValue(
      [{
        username: "user1",
        email: "email@prova.it",
        password: "ciao",
        refreshToken: "token",
        role: "admin"
      }]
    )

    await getUsers(mockReq, mockRes)

    expect(mockRes.json).toHaveBeenCalledWith({ 
      data: [{
        username: "user1",
        email: "email@prova.it",
        role: "admin"
      }], 
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200)
  })

  test("should an empty list if no users in the db", async () => {
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

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(User, "find").mockResolvedValue([])

    await getUsers(mockReq, mockRes)

    expect(mockRes.json).toHaveBeenCalledWith({ 
      data: [], 
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200)
  })
})

describe("getUser", () => { 
  test("should retrieve infos of a specific users", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1"
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

    jest.spyOn(User, "findOne").mockResolvedValue(
      {
        username: "user1",
        email: "email@prova.it",
        password: "ciao",
        refreshToken: "token",
        role: "admin"
      }
    )

    await getUser(mockReq, mockRes)

    expect(mockRes.json).toHaveBeenCalledWith({ 
      data: {
        username: "user1",
        email: "email@prova.it",
        role: "admin"
      }, 
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    expect(mockRes.status).toHaveBeenCalledWith(200)
  })

  test("should return an error when the user doesn't exist", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
        username: "user1"
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

    jest.spyOn(User, "findOne").mockResolvedValue(false)

    await getUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
      error: "User not found"
    });
  })

  test("should return an error when the params are not present or empty strings", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      params: {
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
    checkMissingOrEmptyParams.mockReturnValue("Missing parameters")

    await getUser(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ 
      error: "Missing parameters"
    });
  })
})

describe("createGroup", () => {
  test("should create a group successfully", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        name: "newgroup",
        memberEmails: ["email1@gmail.com", "notexisting@gmail.com", "alreadyingroup@gmail.com"]
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const foundInGroup = [
      {
        members: [{
          email: "alreadyingroup@gmail.com",
          _id: "2"
        }],
      },
    ]

    const allUsers = [
      {
        email: "email1@gmail.com",
        _id: "0"
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2"
      },
      {
        email: "other@gmail.com",
        _id: "3"
      }
    ]

    const memberEmails = [
      {
        email: "email1@gmail.com",
        _id: "0"
      },
      {
        email: "notexisting@gmail.com",
        _id: "1"
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2"
      }
    ]

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(Group, "findOne")
    .mockResolvedValue(false)

    jest.spyOn(User, "find")
    .mockImplementationOnce(async () => memberEmails)
    .mockImplementationOnce(async () => foundInGroup)
    .mockImplementationOnce(async () => allUsers)
    .mockImplementationOnce(async () => foundInGroup)

    Group.prototype.save.mockResolvedValue({
      name: "newgroup",
      memberEmails: ["email1@gmail.com"]
    });

    jwt.verify.mockReturnValue({email: "email1@gmail.com"})

    await createGroup(mockReq, mockRes)

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group: {
          name: "newgroup",
          members: [{ email: "email1@gmail.com", user: "0"}]
        },
        alreadyInGroup: foundInGroup[0].members,
        membersNotFound: ["notexisting@gmail.com"]
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    })
    expect(mockRes.status).toHaveBeenCalledWith(200)
  })

  test("should return an error if the body is incomplete", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        memberEmails: ["email1@gmail.com", "notexisting@gmail.com", "alreadyingroup@gmail.com"]
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

    await createGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Missing values'
    })
  })

  test("should return an error if the name in the body is an empty string", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        name: "",
        memberEmails: ["email1@gmail.com", "notexisting@gmail.com", "alreadyingroup@gmail.com"]
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    await createGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Empty string values"
    })
  })

  test("should return an error when there's already a group with the same name", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        name: "newgroup",
        memberEmails: ["email1@gmail.com", "notexisting@gmail.com", "alreadyingroup@gmail.com"]
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

    jest.spyOn(Group, "findOne")
    .mockResolvedValue(true)

    await createGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'There is already an existing gruop with the same name'
    })
  })

  test("should return an error if all members are already in a group or don't exist", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        name: "newgroup",
        memberEmails: ["email1@gmail.com", "notexisting@gmail.com", "alreadyingroup@gmail.com"]
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const foundInGroup = [
      {
        members: [
          {
            email: "email1@gmail.com",
            _id: "0"
          },
          {
            email: "alreadyingroup@gmail.com",
            _id: "2"
          }
        ],
      },
    ]

    const allUsers = [
      {
        email: "email1@gmail.com",
        _id: "0"
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2"
      },
      {
        email: "other@gmail.com",
        _id: "3"
      }
    ]

    const memberEmails = [
      {
        email: "email1@gmail.com",
        _id: "0"
      },
      {
        email: "notexisting@gmail.com",
        _id: "1"
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2"
      }
    ]

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(Group, "findOne")
    .mockResolvedValue(false)

    jest.spyOn(User, "find")
    .mockImplementationOnce(async () => memberEmails)
    .mockImplementationOnce(async () => foundInGroup)
    .mockImplementationOnce(async () => allUsers)
    .mockImplementationOnce(async () => foundInGroup)

    Group.prototype.save.mockResolvedValue({
      name: "newgroup",
      memberEmails: ["email1@gmail.com"]
    });

    jwt.verify.mockReturnValue({email: "emailcreator@gmail.com"})

    await createGroup(mockReq, mockRes)
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'All the members have emails taht don\'t exist or are already inside anothre group'
    })
  })

  test("should return an error if the user who calls the api is already in a group", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        name: "newgroup",
        memberEmails: ["email1@gmail.com", "notexisting@gmail.com", "alreadyingroup@gmail.com"]
      }
    };

    const mockRes = {
      locals: {
          refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const foundInGroup = [
      {
        members: [
          {
            email: "alreadyingroup@gmail.com",
            _id: "2"
          },
          {
            email: "email1@gmail.com",
            _id: "0"
          }
        ],
      },
    ]

    const allUsers = [
      {
        email: "email1@gmail.com",
        _id: "0"
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2"
      },
      {
        email: "other@gmail.com",
        _id: "3"
      }
    ]

    const memberEmails = [
      {
        email: "email1@gmail.com",
        _id: "0"
      },
      {
        email: "notexisting@gmail.com",
        _id: "1"
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2"
      }
    ]

    verifyAuth.mockReturnValue({flag: true, cause:"authorized"})

    jest.spyOn(Group, "findOne")
    .mockResolvedValue(false)

    jest.spyOn(User, "find")
    .mockImplementationOnce(async () => memberEmails)
    .mockImplementationOnce(async () => foundInGroup)
    .mockImplementationOnce(async () => allUsers)
    .mockImplementationOnce(async () => foundInGroup)

    Group.prototype.save.mockResolvedValue({
      name: "newgroup",
      memberEmails: ["email1@gmail.com"]
    });

    jwt.verify.mockReturnValue({email: "email1@gmail.com"})

    await createGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'User who called the Api is in a group'
    })
  })

  test("should return an error if an email is invalid", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        name: "newgroup",
        memberEmails: ["email1@gmail.com", "wronggmail.com", "alreadyingroup@gmail.com"]
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

    await createGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid email format"
    })
  })

  test("should return an error if an email is an empty string", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
      body: {
        name: "newgroup",
        memberEmails: ["email1@gmail.com", "", "alreadyingroup@gmail.com"]
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

    await createGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Empty email"
    })
  })

})

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => {})



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
  verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
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
  verifyAuth.mockReturnValue({flag: true, cause:"Authenticated"})
  jest.spyOn(Group, "deleteOne").mockImplementation(() => {throw new Error("eccomi")})
  await deleteGroup(mockReq,mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalled();
  expect(mockRes.json).toHaveBeenCalledWith({ error: "eccomi" });
  }) 
  
})