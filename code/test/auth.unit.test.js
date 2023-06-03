
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { register, registerAdmin, login ,logout } from '../controllers/auth.js';
import jwt from 'jsonwebtoken';
import { verifyAuth } from '../controllers/utils.js';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');


const token = {
    accessToken:
        "test",
    refreshToken:
        "test",
};
const missingToken = {
    accessToken:
        "",
    refreshToken:
        null,
};
/*
describe('register', () => { 
    beforeEach (() =>{
        jest.clearAllMocks();
    })
    test('Nominal scenario', async () => {
        const mockReq = {
            body: { username:"u",
                    email:"u@h.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockReturnValueOnce(false);
        verifyFindOne.mockReturnValueOnce(false);

        const hashedPassword = jest.spyOn(bcrypt,'hash');
        hashedPassword.mockReturnValueOnce("pippo");

        const newUser = jest.spyOn(User,'create');
        newUser.mockReturnValueOnce({});
        await register(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({data: {message:'User added successfully'}});
    
    });
    test('Exception existing username/email (false and true)', async () => {
        const mockReq = {
            body: { username:"u",
                    email:"u@h.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockReturnValueOnce(true);
        verifyFindOne.mockReturnValueOnce(false);
        await register(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith( 
            expect.objectContaining({
            error: expect.stringMatching(/Email is already registered|Username is already registered/)
          })
          );            // Additional assertions for the response if needed
    });


});

describe("registerAdmin", () => {
    beforeEach (() =>{
        jest.clearAllMocks();
    })
    test('Nominal scenario', async () => {
        const mockReq = {
            body: { username:"u",
                    email:"u@h.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockReturnValueOnce(false);
        verifyFindOne.mockReturnValueOnce(false);

        const hashedPassword = jest.spyOn(bcrypt,'hash');
        hashedPassword.mockReturnValueOnce("pippo");

        const newUser = jest.spyOn(User,'create');
        newUser.mockReturnValueOnce({});
        await registerAdmin(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({data: {message:'admin added succesfully'}});
    });
    test('Exception existing username/email (false and true)', async () => {
        const mockReq = {
            body: { username:"u",
                    email:"u@h.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockReturnValueOnce(true);
        verifyFindOne.mockReturnValueOnce(false);
        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith( 
            expect.objectContaining({
            error: expect.stringMatching(/Email is already registered|Username is already registered/)
          })
          );
         
    });
    test('Exception empty email', async () => {
        const mockReq = {
            body: { username:"u",
                    email:" ",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockReturnValueOnce(true);
        verifyFindOne.mockReturnValueOnce(false);
        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Empty string values"});
    });
    test('Exception attribute email missing', async () => {
        const mockReq = {
            body: { username:"u",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockReturnValueOnce(true);
        verifyFindOne.mockReturnValueOnce(false);
        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Missing values"});
         
    });
    test('Exception attribute email wrong format', async () => {
        const mockReq = {
            body: { username:"u",
                    email:"bh.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockReturnValueOnce(true);
        verifyFindOne.mockReturnValueOnce(false);
        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Invalid email format"});
         
    });
})
*/
describe('login', () => { 
    beforeEach (() =>{
        jest.clearAllMocks();
    })
    
    test('Nominal scenario', async () => {
        const mockReq = {
            body: {
                    email:"u@h.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };

        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockResolvedValue({  username: 'test1', email: 'test1@example.com', password: 'hashedPassword1', refreshToken: 'test'});
        
        const hashedPassword = jest.spyOn(bcrypt,'compare');
        hashedPassword.mockReturnValueOnce(true);

        const tokenSign = jest.spyOn(jwt,'sign');
        tokenSign.mockReturnValueOnce("Token1");
        tokenSign.mockReturnValueOnce("Token1");


        await login(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({ data: { accessToken: "Token1", refreshToken: "Token1"}});
    
    });
});

describe('logout', () => { 
    beforeEach (() =>{
        jest.clearAllMocks();
    })
    test('Nominal scenario', async () => {
        const mockReq = {
            cookies: token

          }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };


        verifyAuth.mockReturnValue({flag:"true", cause:"Authorized"});
        const findOne = jest.spyOn(User,'findOne');
        findOne.mockResolvedValue({ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1', refreshToken: 'test'});

        User.prototype.save.mockResolvedValue({ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1', refreshToken: 'done'})

        await logout(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({ data:{ message:'User logged out' }});
    
    });
});
