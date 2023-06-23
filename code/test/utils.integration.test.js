import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

describe("handleDateFilterParams", () => { 
    test('Should return an empty object: no query params', () => {      
        const mockReq = {
            query: {}};
        const result = handleDateFilterParams(mockReq);
        expect(result).toEqual({}) 
    });

    test('Should return an object with property from', () => {      
        const mockReq = { query: { from: '2023-04-30' } };
        const expectedDate = new Date('2023-04-30T00:00:00.000Z');
        const expectedObject = { date: { $gte: expectedDate } };
    
        const result = handleDateFilterParams(mockReq);
    
        expect(result).toHaveProperty('date');
        expect(result.date).toHaveProperty('$gte', expectedDate);
        expect(result).toEqual(expectedObject);
    });
    
    test('Should return an object with property upTo', () => {
        const mockReq = { query: { upTo: '2023-04-30' } };
        const expectedDate = new Date('2023-04-30T23:59:59.000Z');
        const expectedObject = { date: { $lte: expectedDate } };
    
        const result = handleDateFilterParams(mockReq);
    
        expect(result).toHaveProperty('date');
        expect(result.date).toHaveProperty('$lte', expectedDate);
        expect(result).toEqual(expectedObject);
        });
    
    test('Should return an object with property date', () => {
    const mockReq = { query: { date: '2023-04-30' } };
    const expectedDateFrom = new Date('2023-04-30T00:00:00.000Z');
    const expectedDateTo = new Date('2023-04-30T23:59:59.000Z');
    const expectedObject = { date: { $gte: expectedDateFrom, $lte: expectedDateTo } };

    const result = handleDateFilterParams(mockReq);

    expect(result).toHaveProperty('date');
    expect(result.date).toHaveProperty('$gte', expectedDateFrom);
    expect(result.date).toHaveProperty('$lte', expectedDateTo);
    expect(result).toEqual(expectedObject);
    });
    
    test('Should return an object with both property upTo, from', () => {
        const mockReq = { query: { upTo: '2023-04-26', from: '2023-04-25' } };
        const expectedDateFrom = new Date('2023-04-25T00:00:00.000Z');
        const expectedDateTo = new Date('2023-04-26T23:59:59.000Z');
        const expectedObject = { date: { $gte: expectedDateFrom, $lte: expectedDateTo } };
    
        const result = handleDateFilterParams(mockReq);
    
        expect(result).toHaveProperty('date');
        expect(result.date).toHaveProperty('$gte', expectedDateFrom);
        expect(result.date).toHaveProperty('$lte', expectedDateTo);
        expect(result).toEqual(expectedObject);
        });
    
    test('Should return an object with both property upTo, from: > queryParams', () => {
    const mockReq = { query: { upTo: '2023-04-30', from: '2023-04-31', tmp: 'ciao' } };
    const expectedDateFrom = new Date('2023-04-30T00:00:00.000Z');
    const expectedDateTo = new Date('2023-04-31T23:59:59.000Z');
    const expectedObject = { date: { $gte: expectedDateFrom, $lte: expectedDateTo }}
    });

    test('Should return an object with property upTo: 1 no relevant parameter', () => {
        const mockReq = { query: { upTo: '2023-04-30', tmp: 'ciao' } };
        const expectedDate = new Date('2023-04-30T23:59:59.000Z');
        const expectedObject = { date: { $lte: expectedDate } };
      
        const result = handleDateFilterParams(mockReq);
      
        expect(result).toHaveProperty('date');
        expect(result.date).toHaveProperty('$lte', expectedDate);
        expect(result).toEqual(expectedObject);
    });
    
    test('Should return an object with property from: 1 no revelant parameter', () => {   
        const mockReq = {query: {from: "2023-04-30", tmp: "ciao"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).hasOwnProperty("date");
        const childProperties = result.date;
        expect(childProperties).hasOwnProperty("$gte");
        const expectedDate = new Date("2023-04-30T00:00:00.000Z");
        expect(result).toEqual({ date: { $gte: expectedDate } });

    });
    
    test('Should return an empty object: 3 no revelant parameter', () => {   
        const mockReq = {query: {t: 1000, tm: "ciao", tmp: "101x"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).toEqual({});

    });

    test('Should return an empty object: inverted from and upTo', () => {    
        const mockReq = {query: {from: "2023-04-31", upTo: "2023-04-30"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow("both dates exceed boundaries of months or days");
    });

    test('Should throw an error:invalid from', () => {    
        const mockReq = {query: {from: "ciao", upTo: "2023-04-30"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow("from format is invalid");

    });
    
    test('Should throw an error:invalid both', () => {    
        const mockReq = {query: {from: "wd", upTo: "xz"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow("both format are invalid");

    });

    test('Should throw an error:invalid upTo', () => {    
        const mockReq = {query: {upTo: "xz"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow("upTo format is invalid");

    });

    test('Should throw an error:invalid upTo/from/date combinations', () => {    
        const mockReq = {query: {from: "2023-12-02", upTo: "2032-12-20", date:"2032-12-12"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow('Cannot use both "date" and "from" or "upTo" parameters together');

    });
    test('Should throw an error:Date format is invalid', () => {    
        const mockReq = {query: { date:"203212-12"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow('Date format is invalid');
    });
    test('Should throw an error:upTo format is invalid with from', () => {    
        const mockReq = {query: { upTo: "203212-20", from: "2023-12-02"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow('upTo format is invalid');
    });
    test('Should throw an error:upTo format is invalid', () => {    
        const mockReq = {query: { upTo: "203212-20"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow('upTo format is invalid');
    });
    test('Should throw an error:from format is invalid', () => {    
        const mockReq = {query: { from: "203212-20"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow('from format is invalid');
    });
})



describe("verifyAuth", () => { 

    const adminAccessTokenValid = jwt.sign({
        email: "admin@email.com",
        username: "admin",
        role: "Admin"
    }, process.env.ACCESS_KEY, { expiresIn: '1y' })

    const testerAccessTokenValid = jwt.sign({
        email: "tester@test.com",
        username: "tester",
        role: "Regular"
    }, process.env.ACCESS_KEY, { expiresIn: '1y' })



    const testerAccessTokenValidWithoutUsername = jwt.sign({
        email: "admin@test.com",
        role: "Admin"
    }, process.env.ACCESS_KEY, { expiresIn: '1y' })

    const testerAccessTokenExpired = jwt.sign({
        email: "tester@test.com",
        username: "tester",
        role: "Regular"
    }, process.env.ACCESS_KEY, { expiresIn: '0s' })
    const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" })

    test("Tokens are both valid and belong to the requested user", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
       
        expect(Object.values(response).includes(true)).toBe(true)
    })
    test("Undefined tokens", () => {
        const req = { cookies: {} }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Simple" })
        //The test is passed if the function returns an object with a false value, no matter its name
        expect(Object.values(response).includes(false)).toBe(true)
    })
    test("Undefined cookies", () => {
        const req = {}
        const res = {}
        const response = verifyAuth(req, res, { authType: "Simple" })
        //The test is passed if the function returns an object with a false value, no matter its name
        expect(Object.values(response).includes(false)).toBe(true)
    })
    test("Undefined token accessToken missing username", () => {
        const req = { cookies: { accessToken: testerAccessTokenValidWithoutUsername, refreshToken: testerAccessTokenValid}}
        const res = {}
        const response = verifyAuth(req, res, { authType: "User" })
        //The test is passed if the function returns an object with a false value, no matter its name
        expect(Object.values(response).includes(false)).toBe(true)
    })
    test("Undefined token refreshToken missing username", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValidWithoutUsername}}
        const res = {}
        const response = verifyAuth(req, res, { authType: "User" })
        //The test is passed if the function returns an object with a false value, no matter its name
        expect(Object.values(response).includes(false)).toBe(true)
    })
    test("Mismatch tokens username", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: adminAccessTokenValid}}
        const res = {}
        const response = verifyAuth(req, res, { authType: "User" })
        //The test is passed if the function returns an object with a false value, no matter its name
        expect(Object.values(response).includes(false)).toBe(true)
    })
    test("Default case", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid}}
        const res = {}
        const response = verifyAuth(req, res, { authType: "Default" })
        //The test is passed if the function returns an object with a false value, no matter its name
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Expiration user case", () => {
        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenExpired}}
        const res = {}
        const response = verifyAuth(req, res, { authType: "Regular", username:"tester" })
        //The test is passed if the function returns an object with a false value, no matter its name
        expect(Object.values(response).includes(false)).toBe(true)
    })

        
    test("Access token expired and refresh token belonging to the requested user", () => {
        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }
        //The inner working of the cookie function is as follows: the response object's cookieArgs object values are set
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.cookieArgs).toEqual({
            name: 'accessToken', //The cookie arguments must have the name set to "accessToken" (value updated)
            value: expect.any(String), //The actual value is unpredictable (jwt string), so it must exist
            options: { //The same options as during creation
                httpOnly: true,
                path: '/api',
                maxAge: 60 * 60 * 1000,
                sameSite: 'none',
                secure: true,
            },
        })
        
    })
})

describe("handleAmountFilterParams", () => { 
    test('Should return an empty object: no query params', () => {      
        const mockReq = {
            query: {}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toEqual({}) 
    });

    test('Should return an object with property min', () => {      
        const mockReq = {query: {min: '5'}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).hasOwnProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).hasOwnProperty("$gte");
        expect(childProperties.$gte).toEqual(5); 
        expect(result).toEqual({ amount: { $gte: 5 } });
    });

    test('Should return an object with property max', () => {   
        const mockReq = {query: {max: 10}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).hasOwnProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).hasOwnProperty("$lte");
        expect(childProperties.$lte).toEqual(10); 
        expect(result).toEqual({ amount: { $lte: 10 } });

    });

    test('Should return an object with both property max,min', () => {   
        const mockReq = {query: {max: "1000", min:"1"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).hasOwnProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).hasOwnProperty("$gte");
        expect(childProperties).hasOwnProperty("$lte");
        expect(childProperties.$gte).toEqual(1); 
        expect(childProperties.$lte).toEqual(1000); 
        expect(result).toEqual({ amount: { $lte: 1000, $gte: 1 } });

    });

    test('Should return an object with both property max,min: > queryParams', () => {   
        const mockReq = {query: {max: 1000, min:1, tmp: "ciao"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).hasOwnProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).hasOwnProperty("$gte", "$lte");
        expect(result).toEqual({ amount: { $lte: 1000, $gte: 1 } });

    });

    test('Should return an object with property max: 1 no revelant parameter', () => {   
        const mockReq = {query: {max: 1000, tmp: "ciao"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).hasOwnProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).hasOwnProperty("$lte");
        expect(result).toEqual({ amount: { $lte: 1000} });

    });

    test('Should return an object with property min: 1 no revelant parameter', () => {   
        const mockReq = {query: {min: 1000, tmp: "ciao"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).hasOwnProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).hasOwnProperty("$gte");
        expect(result).toEqual({ amount: { $gte: 1000} });

    });

    test('Should return an empty object: 3 no revelant parameter', () => {   
        const mockReq = {query: {t: 1000, tm: "ciao", tmp: "101x"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toEqual({});

    });

    test('Should return an empty object: 2 strings', () => {    
        const mockReq = {query: {min: "100", max: "1"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toEqual({});

    });

    test('Should return an empty object: 2 strings', () => {    
        const mockReq = {query: {min: "100", max: "1"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toEqual({});

    });

    test('Should return an empty object: inverted max and min', () => {    
        const mockReq = {query: {min: "100", max: "1"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toEqual({});

    });

    test('Should throw an error:invalid value', () => {    
        const mockReq = {query: {min: "ciao", max: "1"}};
        expect(() =>handleAmountFilterParams(mockReq)).toThrow("Cannot be parsed");

    });
    
    test('Should throw an error:invalid value', () => {    
        const mockReq = {query: {min: "1", max: "xz"}};
        expect(() =>handleAmountFilterParams(mockReq)).toThrow("Cannot be parsed");

    });

    test('Should throw an error:invalid value', () => {    
        const mockReq = {query: {max: "xz"}};
        expect(() =>handleAmountFilterParams(mockReq)).toThrow("Cannot be parsed");

    });

    test('Should throw an error:invalid value', () => {    
        const mockReq = {query: {min: "xz"}};
        expect(() =>handleAmountFilterParams(mockReq)).toThrow("Cannot be parsed");

    });

})
