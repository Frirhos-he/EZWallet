
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { register, registerAdmin, login ,logout } from '../controllers/auth.js';
import jwt from 'jsonwebtoken';
import { verifyAuth, checkMissingOrEmptyParams } from '../controllers/utils.js';


jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/model.js');
jest.mock('../controllers/utils');

  beforeEach (() =>{
    jest.clearAllMocks();
    jest.restoreAllMocks(); 
  })


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

describe('register', () => { 
      
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

        checkMissingOrEmptyParams.mockReturnValue(false)
    
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
    test('Exception existing email ', async () => {
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

        checkMissingOrEmptyParams.mockReturnValue(false)
        jest.spyOn(User, "findOne").mockImplementation(() => false).mockReturnValueOnce(true)
        await register(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith( 
        {error: "Email is already registered"});            // Additional assertions for the response if needed
    });
    test('Exception existing username ', async () => {
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

        checkMissingOrEmptyParams.mockReturnValue(false)
        jest.spyOn(User, "findOne").mockImplementation(() => true).mockReturnValueOnce(false)
        await register(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith( 
        {error: "Username is already registered"});            // Additional assertions for the response if needed
    });
    test('Exception Missing params: empty email', async () => {
        const mockReq = {
            body: { username:"u",
                    email:"",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        checkMissingOrEmptyParams.mockReturnValue("Empty string values")
        jest.spyOn(User, "findOne").mockImplementation(() => false)
        await register(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({error: "Empty string values"});            // Additional assertions for the response if needed
    });
    test('Exception wrong format email', async () => {
        const mockReq = {
            body: { username:"u",
                    email:"bit",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        checkMissingOrEmptyParams.mockReturnValue(false)
        jest.spyOn(User, "findOne").mockImplementation(() => false)
        await register(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({error: "Invalid email format"});            // Additional assertions for the response if needed
    });
    test('Exception thrown error catch', async () => {
        const mockReq = {
            body: { username:"u",
                    email:"b@e.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        checkMissingOrEmptyParams.mockImplementation(() => { throw Error("myerror")})
        jest.spyOn(User, "findOne").mockImplementation(() => false)
        await register(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error : "myerror"});
        //expect(mockRes.json).toHaveProperty("error");            // Additional assertions for the response if needed
    });



});

describe("registerAdmin", () => {
      
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

        checkMissingOrEmptyParams.mockReturnValue(false)
        jest.spyOn(User, "findOne").mockImplementation(() => false)

        const hashedPassword = jest.spyOn(bcrypt,'hash');
        hashedPassword.mockReturnValueOnce("pippo");

        const newUser = jest.spyOn(User,'create');
        newUser.mockReturnValueOnce({});
        await registerAdmin(mockReq,mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({data: {message:'admin added succesfully'}});
    });
    test('Exception existing email', async () => {
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

        checkMissingOrEmptyParams.mockReturnValue(false)
        jest.spyOn(User, "findOne").mockImplementation(() => false).mockReturnValueOnce(true)
        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({
            error:"Email is already registered"}
          );
         
    });
    test('Exception existing username', async () => {
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

        checkMissingOrEmptyParams.mockReturnValue(false)
        jest.spyOn(User, "findOne").mockImplementation(() => true).mockReturnValueOnce(false)
        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({
            error:"Username is already registered"}
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

        checkMissingOrEmptyParams.mockReturnValue("Empty string values")
        jest.spyOn(User, "findOne").mockImplementation(() => false)

        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Empty string values"
        })
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

        checkMissingOrEmptyParams.mockReturnValue("Missing values")
        jest.spyOn(User, "findOne").mockImplementation(() => false)
        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Missing values"
        })
         
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
        checkMissingOrEmptyParams.mockReturnValue(false)
        jest.spyOn(User, "findOne").mockImplementation(() => false)
        
        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Invalid email format"});
         
    });
    test('Exception thrown catch', async () => {
        const mockReq = {
            body: { username:"u",
                    email:"bh@fd.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        checkMissingOrEmptyParams.mockImplementation(() => { throw Error("myerror")})
        jest.spyOn(User, "findOne").mockImplementation(() => false)
        
        await registerAdmin(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "myerror"});
         
    });
})

describe('login', () => { 

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
        const user = {
            email:"u@h.it",
            username: "u",
            password: "password",
            id:0,
            accessToken : 'accesstoken',
            save : jest.fn().mockResolvedValue({refreshToken : 'refreshToken'}),
            role:"Regular" };

        verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
        checkMissingOrEmptyParams.mockReturnValue(false)
        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockResolvedValue(user);
        
        const hashedPassword = jest.spyOn(bcrypt,'compare');
        hashedPassword.mockReturnValueOnce(true);

        jest.spyOn(User.prototype, 'save').mockResolvedValue(user);

        const tokenSign = jest.spyOn(jwt,'sign');
        tokenSign.mockReturnValueOnce("Token1");
        tokenSign.mockReturnValueOnce("Token1");

        await login(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({ data: { accessToken: "Token1", refreshToken: "Token1"}});
    
    });
    test('Wrong credentials scenario', async () => {
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
        const user = {
            email:"u@h.it",
            username: "u",
            password: "password",
            id:0,
            accessToken : 'accesstoken',
            save : jest.fn().mockResolvedValue({refreshToken : 'refreshToken'}),
            role:"Regular" };

        verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
        checkMissingOrEmptyParams.mockReturnValue(false)
        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockResolvedValue(user);
        
        const hashedPassword = jest.spyOn(bcrypt,'compare');
        hashedPassword.mockReturnValueOnce(false);

        jest.spyOn(User.prototype, 'save').mockResolvedValue(user);

        const tokenSign = jest.spyOn(jwt,'sign');
        tokenSign.mockReturnValueOnce("Token1");
        tokenSign.mockReturnValueOnce("Token1");

        await login(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({error : "wrong credentials"});
    
    });

    test('Empty email', async () => {
        const mockReq = {
            body: {
                    email:" ",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };
        const user = {
            email:"u@h.it",
            username: "u",
            password: "password",
            id:0,
            accessToken : 'accesstoken',
            save : jest.fn().mockResolvedValue({refreshToken : 'refreshToken'}),
            role:"Regular" };
       

        verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
        checkMissingOrEmptyParams.mockReturnValue("Empty string values")
        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockResolvedValue(() => true);
        
        const hashedPassword = jest.spyOn(bcrypt,'compare');
        hashedPassword.mockReturnValueOnce(true);


        jest.spyOn(User.prototype, 'save').mockResolvedValue(user);

        const tokenSign = jest.spyOn(jwt,'sign');
        tokenSign.mockReturnValueOnce("Token1");
        tokenSign.mockReturnValueOnce("Token1");

        await login(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Empty string values"
        })
        
    
    });
    test('User not found', async () => {
        const mockReq = {
            body: {
                    email:"b@d.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };
       

        verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
        checkMissingOrEmptyParams.mockReturnValue(false)
        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockResolvedValue(false);
        
        const hashedPassword = jest.spyOn(bcrypt,'compare');
        hashedPassword.mockReturnValueOnce(true);

        jest.spyOn(User.prototype, 'save').mockImplementation(() => false);

        const tokenSign = jest.spyOn(jwt,'sign');
        tokenSign.mockReturnValueOnce("Token1");
        tokenSign.mockReturnValueOnce("Token1");

        await login(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "please you need to register"
        })
        
    
    });
    test('Wrong format email', async () => {
        const mockReq = {
            body: {
                    email:"b.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };
       

        verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
        checkMissingOrEmptyParams.mockReturnValue(false)
        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockResolvedValue(() => true);
        
        const hashedPassword = jest.spyOn(bcrypt,'compare');
        hashedPassword.mockReturnValueOnce(true);

        jest.spyOn(User.prototype, 'save').mockImplementation(() => true);

        const tokenSign = jest.spyOn(jwt,'sign');
        tokenSign.mockReturnValueOnce("Token1");
        tokenSign.mockReturnValueOnce("Token1");

        await login(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({error : "Invalid email format"});
    
    });
    
    test('Throw catch error', async () => {
        const mockReq = {
            body: {
                    email:"b.it",
                    password:"password"
                }
        };
        
        const mockRes = {

            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };
       

        verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
        checkMissingOrEmptyParams.mockImplementation(() => { throw Error("myerror")})
        const verifyFindOne = jest.spyOn(User, 'findOne');   
        verifyFindOne.mockResolvedValue(() => true);
        
        const hashedPassword = jest.spyOn(bcrypt,'compare');
        hashedPassword.mockReturnValueOnce(true);

        jest.spyOn(User.prototype, 'save').mockImplementation(() => false);

        const tokenSign = jest.spyOn(jwt,'sign');
        tokenSign.mockReturnValueOnce("Token1");
        tokenSign.mockReturnValueOnce("Token1");

        await login(mockReq,mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error : "myerror"});
    
    });

});

describe('logout', () => { 

      
    test('Nominal scenario', async () => {
        const mockReq = {
            cookies: token

          }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };
        const user = {
            email:"u@h.it",
            username: "u",
            password: "password",
            id:0,
            accessToken : 'accesstoken',
            save : jest.fn().mockResolvedValue({refreshToken : 'refreshToken'}),
            role:"Regular" };

            verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
            checkMissingOrEmptyParams.mockReturnValue(false)
            jest.spyOn(User,'findOne').mockResolvedValue(user);

            jest.spyOn(User.prototype, 'save').mockResolvedValue(user);
     
             await logout(mockReq,mockRes);
             expect(mockRes.status).toHaveBeenCalledWith(200);
             expect(mockRes.json).toHaveBeenCalled();
             expect(mockRes.json).toHaveBeenCalledWith({ data:{ message:'User logged out' }});
         
    });
    test('User not found scenario', async () => {
        const mockReq = {
            cookies: token

          }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        }; 


            verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
            checkMissingOrEmptyParams.mockReturnValue(false)
            jest.spyOn(User,'findOne').mockResolvedValue(false);

     
             await logout(mockReq,mockRes);
             expect(mockRes.status).toHaveBeenCalledWith(400);
             expect(mockRes.json).toHaveBeenCalledWith({error: "user not found"});
    });
    test('Not authentificated scenario', async () => {
        const mockReq = {
            cookies: token

          }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };

            verifyAuth.mockReturnValue({flag: false, cause:"not authorized"})
            checkMissingOrEmptyParams.mockReturnValue(false)
            jest.spyOn(User,'findOne').mockResolvedValue(false);
             await logout(mockReq,mockRes);
             expect(mockRes.status).toHaveBeenCalledWith(401);
             expect(mockRes.json).toHaveBeenCalled();
             expect(mockRes.json).toHaveBeenCalledWith({error: "not authorized"});
         
    });
    test('No Refresh Token scenario', async () => {
        const mockReq = {
            cookies: missingToken

          }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };

            verifyAuth.mockReturnValue({flag: true, cause:"authorized"})
            jest.spyOn(User,'findOne').mockResolvedValue(false);
             await logout(mockReq,mockRes);
             expect(mockRes.status).toHaveBeenCalledWith(400);
             expect(mockRes.json).toHaveBeenCalled();
             expect(mockRes.json).toHaveBeenCalledWith({error : "refresh token missing"});
         
    });
    test('Try catch scenario', async () => {
        const mockReq = {
            cookies: missingToken

          }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            json:   jest.fn()
        };

            verifyAuth.mockImplementation(() => { throw Error("myerror")});
             await logout(mockReq,mockRes);
             expect(mockRes.status).toHaveBeenCalledWith(400);
             expect(mockRes.json).toHaveBeenCalled();
             expect(mockRes.json).toHaveBeenCalledWith({error : "myerror"});
         
    });
});
