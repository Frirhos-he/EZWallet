import request from "supertest";
import { app } from "../app";
import { User, Group } from "../models/User.js";
import jwt from "jsonwebtoken";
import { transactions } from "../models/model.js";
import {
  getUsers,
  getUser,
  createGroup,
  getGroups,
  getGroup,
  addToGroup,
  removeFromGroup,
  deleteUser,
  deleteGroup,
} from "../controllers/users";
import {
  verifyAuth,
  checkMissingOrEmptyParams,
  handleAmountFilterParams,
  handleDateFilterParams,
} from "../controllers/utils";

jest.mock("jsonwebtoken");
jest.mock("../controllers/utils");
jest.mock("../models/model.js");
jest.mock("../models/User.js");

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  jest.resetAllMocks();
});

describe("getUsers", () => {
  test("Nominal scenario", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(User, "find").mockResolvedValue([
      {
        username: "user1",
        email: "email@prova.it",
        password: "ciao",
        refreshToken: "token",
        role: "admin",
      },
    ]);

    await getUsers(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: [
        {
          username: "user1",
          email: "email@prova.it",
          role: "admin",
        },
      ],
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should an empty list if no users in the db", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(User, "find").mockResolvedValue([]);

    await getUsers(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: [],
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return an error of authentication", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: false, cause: "unauthorized" });

    await getUsers(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized",
    });
  });

  test("Exception thrown error catch", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockImplementation(() => {
      throw Error("myerror");
    });

    await getUsers(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "myerror" });
    //expect(mockRes.json).toHaveProperty("error");            // Additional assertions for the response if needed
  });
});

describe("getUser", () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  test("Nominal scenario", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        username: "user1",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);

    jest.spyOn(User, "findOne").mockResolvedValue({
      username: "user1",
      email: "email@prova.it",
      password: "ciao",
      refreshToken: "token",
      role: "admin",
    });

    await getUser(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        username: "user1",
        email: "email@prova.it",
        role: "admin",
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return an error when the user doesn't exist", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        username: "user1",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);

    jest.spyOn(User, "findOne").mockResolvedValue(false);

    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });

  test("should return an error of authentication", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        username: "user1",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: false, cause: "unauthorized" });

    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized",
    });
  });

  test("Exception thrown error catch", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        username: "user1",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockImplementation(() => {
      throw Error("myerror");
    });

    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "myerror" });
    //expect(mockRes.json).toHaveProperty("error");            // Additional assertions for the response if needed
  });
});

describe("createGroup", () => {
  test("Nominal scenario", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
        memberEmails: [
          "email1@gmail.com",
          "notexisting@gmail.com",
          "alreadyingroup@gmail.com",
        ],
      },
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
            _id: "2",
          },
        ],
      },
    ];

    const allUsers = [
      {
        email: "creator@gmail.com",
        _id: "10",
      },
      {
        email: "email1@gmail.com",
        _id: "0",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2",
      },
      {
        email: "other@gmail.com",
        _id: "3",
      },
    ];

    const memberEmails = [
      {
        email: "email1@gmail.com",
        _id: "0",
      },
      {
        email: "notexisting@gmail.com",
        _id: "1",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2",
      },
    ];

    const creatorUser =
    {
      email: "creator@gmail.com",
      _id: "10",
    }

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
    jwt.verify.mockReturnValue({ email: "creator@gmail.com" });
    jest
      .spyOn(Group, "findOne")
      .mockResolvedValueOnce(false)
      .mockReturnValueOnce({
        name: "newgroup",
        memberEmails: [{email:"email1@gmail.com"}],
      });

    jest
      .spyOn(User, "find")
      .mockReturnValueOnce(memberEmails)
      .mockReturnValueOnce(foundInGroup)
      .mockReturnValueOnce(allUsers);

    jest
      .spyOn(User, "findOne")
      .mockReturnValueOnce(creatorUser);

    Group.prototype.save.mockResolvedValue({
      name: "newgroup",
      memberEmails: ["email1@gmail.com"],
    });

    await createGroup(mockReq, mockRes);
    
    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group: {
          name: "newgroup",
          members: [
            { email: "email1@gmail.com" },
            { email: "creator@gmail.com" },
          ],
        },
        alreadyInGroup: [
          Object.assign({}, { email: foundInGroup[0].members[0].email }),
        ],
        membersNotFound: ["notexisting@gmail.com"],
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return an error if the body is incomplete", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        memberEmails: [
          "email1@gmail.com",
          "notexisting@gmail.com",
          "alreadyingroup@gmail.com",
        ],
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing values",
    });
  });

  test("should return an error if the name in the body is an empty string", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "",
        memberEmails: [
          "email1@gmail.com",
          "notexisting@gmail.com",
          "alreadyingroup@gmail.com",
        ],
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Empty string values",
    });
  });

  test("should return an error when there's already a group with the same name", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
        memberEmails: [
          "email1@gmail.com",
          "notexisting@gmail.com",
          "alreadyingroup@gmail.com",
        ],
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue(true);

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "There is already an existing gruop with the same name",
    });
  });

  test("should return an error if all members are already in a group or don't exist", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
        memberEmails: ["notexisting@gmail.com", "alreadyingroup@gmail.com"],
      },
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
            _id: "2",
          },
        ],
      },
    ];

    const allUsers = [
      {
        email: "email1@gmail.com",
        _id: "0",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2",
      },
      {
        email: "other@gmail.com",
        _id: "3",
      },
    ];

    const memberEmails = [
      {
        email: "notexisting@gmail.com",
        _id: "1",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2",
      },
    ];

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue(false);

    jest
      .spyOn(User, "find")
      .mockImplementationOnce(async () => memberEmails)
      .mockImplementationOnce(async () => foundInGroup)
      .mockImplementationOnce(async () => allUsers);

    Group.prototype.save.mockResolvedValue({
      name: "newgroup",
      memberEmails: ["email1@gmail.com"],
    });

    jwt.verify.mockReturnValue({ email: "emailcreator@gmail.com" });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error:
        "All the members have emails that don't exist or are already inside another group",
    });
  });

  test("should return an error if the user who calls the api is already in a group", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
        memberEmails: [
          "email1@gmail.com",
          "notexisting@gmail.com",
          "alreadyingroup@gmail.com",
        ],
      },
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
            _id: "2",
          },
          {
            email: "email1@gmail.com",
            _id: "0",
          },
        ],
      },
    ];

    const allUsers = [
      {
        email: "email1@gmail.com",
        _id: "0",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2",
      },
      {
        email: "other@gmail.com",
        _id: "3",
      },
    ];

    const memberEmails = [
      {
        email: "email1@gmail.com",
        _id: "0",
      },
      {
        email: "notexisting@gmail.com",
        _id: "1",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2",
      },
    ];

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue(false);

    jest
      .spyOn(User, "find")
      .mockImplementationOnce(async () => memberEmails)
      .mockImplementationOnce(async () => foundInGroup)
      .mockImplementationOnce(async () => allUsers)
      .mockImplementationOnce(async () => foundInGroup);

    Group.prototype.save.mockResolvedValue({
      name: "newgroup",
      memberEmails: ["email1@gmail.com"],
    });

    jwt.verify.mockReturnValue({ email: "email1@gmail.com" });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User who called the Api is in a group",
    });
  });

  test("should return an error if an email is invalid", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
        memberEmails: [
          "email1@gmail.com",
          "wronggmail.com",
          "alreadyingroup@gmail.com",
        ],
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid email format",
    });
  });

  test("should return an error if an email is an empty string", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
        memberEmails: ["email1@gmail.com", "", "alreadyingroup@gmail.com"],
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Empty email",
    });
  });

  test("should return an error Missing values", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing values" });
  });

  test("should return an error of authentication", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
        memberEmails: [
          "email1@gmail.com",
          "notexisting@gmail.com",
          "alreadyingroup@gmail.com",
        ],
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: false, cause: "unauthorized" });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized",
    });
  });

  test("Exception thrown error catch", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
        memberEmails: [
          "email1@gmail.com",
          "notexisting@gmail.com",
          "alreadyingroup@gmail.com",
        ],
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockImplementation(() => {
      throw Error("myerror");
    });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "myerror" });
    //expect(mockRes.json).toHaveProperty("error");            // Additional assertions for the response if needed
  });

  test("should return an enter if(!foundInGroup) {", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      body: {
        name: "newgroup",
        emails: ["alreadyingroup@gmail.com", "notexisting@gmail.com"],
      },
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
            _id: "2",
          },
        ],
      },
    ];

    const allUsers = [
      {
        email: "email1@gmail.com",
        _id: "0",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "2",
      },
      {
        email: "other@gmail.com",
        _id: "3",
      },
    ];

    const memberEmails = [
      {
        email: "alreadyingroup@gmail.com",
        _id: "2",
      },
    ];

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue(false);

    jwt.verify.mockReturnValue({ email: "email1@gmail.com" });

    jest
      .spyOn(User, "find")
      .mockReturnValueOnce(memberEmails)
      .mockReturnValueOnce(foundInGroup)
      .mockReturnValueOnce({
        email: "email1@gmail.com",
        _id: "0",
      })
      .mockReturnValueOnce(allUsers)
      .mockReturnValueOnce(foundInGroup);

    Group.prototype.save.mockResolvedValue({
      name: "newgroup",
      memberEmails: ["email1@gmail.com"],
    });

    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing values" });
  });
});

describe("getGroups", () => {
  test("Nominal scenario", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const groups = [
      {
        name: "group1",
        members: [
          { email: "mario.red@email.com" },
          { email: "luigi.red@email.com" },
        ],
      },
      {
        name: "group2",
        members: [
          { email: "mario.yellow@email.com" },
          { email: "luigi.purple@email.com" },
        ],
      },
    ];

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
    jest.spyOn(Group, "find").mockResolvedValue(groups);

    await getGroups(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: groups,
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return an error of authentication", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: false, cause: "unauthorized" });

    await getGroups(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized",
    });
  });

  test("Exception thrown error catch", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockImplementation(() => {
      throw Error("myerror");
    });

    await getGroups(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "myerror" });
    //expect(mockRes.json).toHaveProperty("error");            // Additional assertions for the response if needed
  });
});

describe("getGroup", () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  test("Nominal scenario", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    await getGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group: {
          name: "group1",
          members: [
            { email: "mario.red@email.com" },
            { email: "luigi.red@email.com" },
          ],
        },
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return an error if missing or empty parameters", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {},
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
    checkMissingOrEmptyParams.mockReturnValue("Missing parameters");

    await getGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing parameters",
    });
  });

  test("should return an error if the group doesn't exist", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);

    jest.spyOn(Group, "findOne").mockResolvedValue(false);

    await getGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "The group doesn't exist",
    });
  });

  test("should return an error of authentication", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: false, cause: "unauthorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    await getGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized",
    });
  });

  test("Exception thrown error catch", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
    };
    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    checkMissingOrEmptyParams.mockImplementation(() => {
      throw Error("myerror");
    });

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    await getGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "myerror" });
  });
});

describe("addToGroup", () => {
  test("Nominal scenario", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
      body: {
        emails: [
          "toadd1@gmail.com",
          "toadd2@gmail.com",
          "alreadyingroup@gmail.com",
          "notexisting@gmail.com",
        ],
      },
      url: "/groups/group1/insert",
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
            _id: "1",
          },
        ],
      },
    ];

    const allUsers = [
      {
        email: "email1@gmail.com",
        _id: "0",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "1",
      },
      {
        email: "other@gmail.com",
        _id: "2",
      },
      {
        email: "toadd1@gmail.com",
        _id: "3",
      },
      {
        email: "toadd2@gmail.com",
        _id: "4",
      },
      {
        email: "mario.red@email.com",
        _id: "5",
      },
      {
        email: "luigi.red@email.com",
        _id: "6",
      },
    ];

    const membersToAdd = [
      {
        email: "toadd1@gmail.com",
        _id: "3",
      },
      {
        email: "toadd2@gmail.com",
        _id: "4",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "1",
      },
    ];

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    jest
      .spyOn(User, "find")
      .mockReturnValueOnce(membersToAdd)
      .mockReturnValueOnce(allUsers)
      .mockReturnValueOnce(foundInGroup);

    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com", user: "5" },
        { email: "luigi.red@email.com", user: "6" },
        { email: "toadd1@gmail.com", user: "3" },
        { email: "toadd2@gmail.com", user: "4" },
      ],
    });

    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        group: {
          name: "group1",
          members: [
            { email: "mario.red@email.com" },
            { email: "luigi.red@email.com" },
            { email: "toadd1@gmail.com" },
            { email: "toadd2@gmail.com" },
          ],
        },
        alreadyInGroup: [
          Object.assign({}, { email: foundInGroup[0].members[0].email }),
        ],
        membersNotFound: [{ email: "notexisting@gmail.com" }],
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
  });

  test("should return an error if the body doesn't contain all attributes", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
      body: {},
      url: "/groups/group1/insert",
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "member emails not defined",
    });
  });

  test("should return an error if the group doesn't exist", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
      body: {
        emails: [
          "toadd1@gmail.com",
          "toadd2@gmail.com",
          "alreadyingroup@gmail.com",
          "notexisting@gmail.com",
        ],
      },
      url: "/groups/group1/insert",
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue(false);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "The group doesn't exist",
    });
  });

  test("should return an error if all the emails are already in group or not existing", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
      body: {
        emails: ["alreadyingroup@gmail.com", "notexisting@gmail.com"],
      },
      url: "/groups/group1/insert",
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
            _id: "1",
          },
        ],
      },
    ];

    const allUsers = [
      {
        email: "email1@gmail.com",
        _id: "0",
      },
      {
        email: "alreadyingroup@gmail.com",
        _id: "1",
      },
      {
        email: "other@gmail.com",
        _id: "2",
      },
      {
        email: "toadd1@gmail.com",
        _id: "3",
      },
      {
        email: "toadd2@gmail.com",
        _id: "4",
      },
      {
        email: "mario.red@email.com",
        _id: "5",
      },
      {
        email: "luigi.red@email.com",
        _id: "6",
      },
    ];

    const membersToAdd = [
      {
        email: "alreadyingroup@gmail.com",
        _id: "1",
      },
    ];

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    jest
      .spyOn(User, "find")
      .mockReturnValueOnce(membersToAdd)
      .mockReturnValueOnce(allUsers)
      .mockReturnValueOnce(foundInGroup);

    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error:
        "All the members have emails that don't exist or are already inside another group",
    });
  });

  test("should return an error if at least one email is invalid (fromat)", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
      body: {
        emails: [
          "toadd1@gmail.com",
          "wronggmail.com",
          "alreadyingroup@gmail.com",
          "notexisting@gmail.com",
        ],
      },
      url: "/groups/group1/insert",
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid email format",
    });
  });

  test("should return an error if at least one email is an empty string", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
      body: {
        emails: [
          "",
          "toadd2@gmail.com",
          "alreadyingroup@gmail.com",
          "notexisting@gmail.com",
        ],
      },
      url: "/groups/group1/insert",
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Empty email",
    });
  });

  test("should return an error of authentication (admin)", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
      body: {
        emails: [
          "toadd1@gmail.com",
          "toadd2@gmail.com",
          "alreadyingroup@gmail.com",
          "notexisting@gmail.com",
        ],
      },
      url: "/groups/group1/insert",
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: false, cause: "unauthorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized",
    });
  });

  test("should return an error of authentication (group)", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
      body: {
        emails: [
          "toadd1@gmail.com",
          "toadd2@gmail.com",
          "alreadyingroup@gmail.com",
          "notexisting@gmail.com",
        ],
      },
      url: "/groups/group1/add",
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockReturnValue({ flag: false, cause: "unauthorized" });

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "unauthorized",
    });
  });

  test("Exception thrown error catch", async () => {
    // Mock input data
    const mockReq = {
      cookies: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      },
      params: {
        name: "group1",
      },
      body: {
        emails: [
          "toadd1@gmail.com",
          "toadd2@gmail.com",
          "alreadyingroup@gmail.com",
          "notexisting@gmail.com",
        ],
      },
      url: "/groups/group1/add",
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    verifyAuth.mockImplementation(() => {
      throw Error("myerror");
    });

    jest.spyOn(Group, "findOne").mockResolvedValue({
      name: "group1",
      members: [
        { email: "mario.red@email.com" },
        { email: "luigi.red@email.com" },
      ],
    });

    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "myerror" });
  });
});

describe("removeFromGroup", () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  test("Nominal scenario", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["a@h.it", "b@h.it"],
      },
      url: "groups/pull",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(Group, "findOne").mockReturnValue({
      members: [{ email: "c@h.it" }, { email: "b@h.it" }],
      name: "group",
    });
    jest
      .spyOn(User, "find")
      .mockResolvedValueOnce([{ email: "b@h.it", _id: "b" }])
      .mockResolvedValueOnce([
        { email: "b@h.it", _id: "b" },
        { email: "c@h.it", _id: "c" },
      ]);

    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValue({
      name: "group",
      members: [
        {
          email: "c@h.it",
          user: {
            $oid: "646f05ef5c3ec64b397b687d",
          },
        },
      ],
    });

    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        notInGroup: [],
        group: {
          members: [{ email: "c@h.it" }],
          name: "group",
        },
        membersNotFound: [{ email: "a@h.it" }],
      },
      refreshedTokenMessage: "",
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalled();
  });

  test("The group doesn t exist", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["a@h.it", "b@h.it"],
      },
      url: "groups/pull",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(Group, "findOne").mockReturnValue(null);

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "The group doesn't exist",
    });
  });

  test("missing params", async () => {
    const mockReq = {
      params: {
        name: "",
      },
      body: {
        emails: ["a@h.it", "b@h.it"],
      },
      url: "groups/pull",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue("error");
    jest
      .spyOn(Group, "findOne")
      .mockReturnValue({ members: [{ email: "c@h.it" }, { email: "b@h.it" }] });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "error",
    });
  });

  test("member emails not defined", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {},
      url: "groups/pull",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest
      .spyOn(Group, "findOne")
      .mockReturnValue({ members: [{ email: "c@h.it" }, { email: "b@h.it" }] });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "member emails not defined",
    });
  });

  test("Empty email", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["c@h.it", " "],
      },
      url: "groups/pull",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest
      .spyOn(Group, "findOne")
      .mockReturnValue({ members: [{ email: "c@h.it" }, { email: "b@h.it" }] });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Empty email",
    });
  });

  test("Regex failed email", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["ch.it"],
      },
      url: "groups/pull",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest
      .spyOn(Group, "findOne")
      .mockReturnValue({ members: [{ email: "c@h.it" }, { email: "b@h.it" }] });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid email format",
    });
  });

  test("Admin failed login", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["ch@d.it"],
      },
      url: "groups/pull",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: false, cause: "not authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest
      .spyOn(Group, "findOne")
      .mockReturnValue({ members: [{ email: "c@h.it" }, { email: "b@h.it" }] });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: " adminAuth: not authorized",
    });
  });

  test("Group failed login", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["ch@d.it"],
      },
      url: "noturl",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: false, cause: "not authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest
      .spyOn(Group, "findOne")
      .mockReturnValue({ members: [{ email: "c@h.it" }, { email: "b@h.it" }] });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "groupAuth: not authorized",
    });
  });

  test("length 0 toDelete", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["ch@d.it"],
      },
      url: "noturl",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(User, "find").mockReturnValue([]);
    jest.spyOn(Group, "findOne").mockReturnValue({
      members: [{ email: "ch@s.it" }, { email: "ch@s.it" }],
    });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "All the members either don't exist or are not in the group",
    });
  });

  test("if the group has same number members to delete, 200 but leave just one", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["ch@d.it", "ch@c.it"],
      },
      url: "noturl",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest
      .spyOn(User, "find")
      .mockReturnValue([{ email: "ch@d.it" }, { email: "ch@c.it" }]);
    jest.spyOn(Group, "findOne").mockReturnValue({
      name: "group",
      members: [{ email: "ch@d.it" }, { email: "ch@c.it" }],
    });
    jest
      .spyOn(Group, "findOneAndUpdate")
      .mockReturnValue({ name: "group", members: [{ email: "ch@c.it" }] });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        notInGroup: [],
        group: {
          members: [{ email: "ch@c.it" }],
          name: "group",
        },
        membersNotFound: [],
      },
      refreshedTokenMessage: "",
    });
  });

  test("if the group has 1 member and is the selected", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["ch@s.it"],
      },
      url: "noturl",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(User, "find").mockReturnValue([{ email: "ch@s.it" }]);
    jest
      .spyOn(Group, "findOne")
      .mockReturnValue({ members: [{ email: "ch@s.it" }] });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "if the group only has one member ",
    });
  });

  test("throw error", async () => {
    const mockReq = {
      params: {
        name: "group",
      },
      body: {
        emails: ["ch@s.it"],
      },
      url: "noturl",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(User, "find").mockReturnValue([]);
    jest.spyOn(Group, "findOne").mockImplementation(() => {
      throw Error("error");
    });

    await removeFromGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "error",
    });
  });
});

describe("deleteUser", () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  test("Nominal scenario", async () => {
    const mockReq = {
      body: { email: "u@h.it" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });

    checkMissingOrEmptyParams.mockReturnValue(false);

    jest.spyOn(User, "findOne").mockImplementation(() => ({
      username: "u",
      email: "u@h.it",
      role: "User",
      refreshToken: "test",
    }));
    jest
      .spyOn(Group, "find")
      .mockReturnValue([
        { members: [{ email: "c@h.it" }, { email: "c@h.it" }] },
        { members: [{ email: "c@h.it" }, { email: "c@h.it" }] },
      ]);

    transactions.countDocuments.mockReturnValue(0);

    jest.spyOn(transactions, "deleteMany").mockImplementation(() => true);
    jest.spyOn(User, "deleteOne").mockImplementation(() => true);
    jest
      .spyOn(Group, "updateOne")
      .mockImplementation(() => ({ modifiedCount: 0 }));

    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        deletedTransactions: 0,
        deletedFromGroup: false,
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
  });
  test("authentification fail scenario", async () => {
    const mockReq = {
      body: { email: "a@h.it" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: false, cause: "not" });

    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "not",
    });
  });
  test("mssing email fail scenario", async () => {
    const mockReq = {
      body: { email: "" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authenticated" });
    checkMissingOrEmptyParams.mockReturnValue("Empty String");

    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Empty String",
    });
  });
  test("wrong email format fail scenario", async () => {
    const mockReq = {
      body: { email: "b.it" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authenticated" });
    checkMissingOrEmptyParams.mockReturnValue(false);

    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid email format",
    });
  });
  test("mssing user fail scenario", async () => {
    const mockReq = {
      body: { email: "b@i.it" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authenticated" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(User, "findOne").mockImplementation(false);
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "The user doesn't exist",
    });
  });
  test("one found scenario", async () => {
    const mockReq = {
      body: { email: "b@i.it" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authenticated" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(User, "findOne").mockReturnValue(true);
    jest
      .spyOn(Group, "find")
      .mockReturnValue([
        { members: [{ email: "b@i.it" }] },
        { members: [{ email: "c@h.it" }] },
      ]);
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalled();
  });
  test("thrown scenario", async () => {
    const mockReq = {
      body: { email: "b@i.it" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    verifyAuth.mockReturnValue({ flag: true, cause: "Authenticated" });
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(User, "findOne").mockReturnValue(true);
    jest.spyOn(Group, "find").mockImplementation(() => {
      throw Error("myerror");
    });
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "myerror",
    });
  });
});

describe("deleteGroup", () => {
  test("Nominal scenario", async () => {
    const mockReq = {
      body: { name: "pippo" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(Group, "findOne").mockImplementation(() => true);
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    jest.spyOn(Group, "deleteOne").mockImplementation(() => true);
    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      data: { message: "Group deleted successfully" },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
    });
  });

  test("Missin params scenario", async () => {
    const mockReq = {
      body: { name: " " },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    checkMissingOrEmptyParams.mockReturnValue("Missing values");

    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing values" });
  });

  test("The group doesn't exist scenario", async () => {
    const mockReq = {
      body: { name: "name" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(Group, "findOne").mockImplementation(() => false);
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });

    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "The group doesn't exist",
    });
  });

  test("admin not authentificated", async () => {
    const mockReq = {
      body: { name: "name" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(Group, "findOne").mockImplementation(() => true);
    verifyAuth.mockReturnValue({ flag: false, cause: "myerror" });
    jest.spyOn(Group, "deleteOne").mockImplementation(() => true);
    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({ error: "myerror" });
  });

  test("throw expection", async () => {
    const mockReq = {
      body: { name: "name" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "",
      },
    };
    checkMissingOrEmptyParams.mockReturnValue(false);
    jest.spyOn(Group, "findOne").mockImplementation(() => true);
    verifyAuth.mockReturnValue({ flag: true, cause: "Authorized" });
    jest.spyOn(Group, "deleteOne").mockImplementation(() => {
      throw new Error("eccomi");
    });
    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({ error: "eccomi" });
  });
});
