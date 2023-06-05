import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import jwt from 'jsonwebtoken'
jest.mock("jsonwebtoken");

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
    const mockReq = { query: { upTo: '2023-04-31' } };
    const expectedDate = new Date('2023-04-31T23:59:59.000Z');
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
    const mockReq = { query: { upTo: '2023-04-31', from: '2023-04-30' } };
    const expectedDateFrom = new Date('2023-04-30T00:00:00.000Z');
    const expectedDateTo = new Date('2023-04-31T23:59:59.000Z');
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
        const result = handleDateFilterParams(mockReq);
        expect(result).toEqual({});

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


describe("verifyAuth", () => { 
    //TODO: check expired token catch,
    //NOMINAL SCENARIO 
    test("Simple loggin", async () => {
        const mockReq = {
            cookies: token
        };
        const mockRes = {
        };
        const mockInfo = {
            authType:"Simple"
        };
        const decodedAccessToken = {
            username: "s",
            email: "s@h.it",
            role: "Simple",
            exp: Date.now()  //to confirm TODO
           }
           const decodedRefreshToken = {
            username: "s",
            email: "s@h.it",
            role: "Simple"
           }
        const verifySpy = jest.spyOn(jwt, 'verify');   
        verifySpy.mockReturnValueOnce(decodedAccessToken);
        verifySpy.mockReturnValueOnce(decodedRefreshToken);

        const result = verifyAuth(mockReq, mockRes, mockInfo);
        expect(result).not.toBeNull();
        expect(result).toHaveProperty('flag');
        expect(result).toHaveProperty('cause');
        expect(result).toEqual({ flag: true, cause: "Authorized" });
    });

    test("User loggin", async () => {
        const mockReq = {
            cookies: token
        };
        const mockRes = {
        };
        const mockInfo = {
            authType:"User",
            username:"u"
        };
        const decodedAccessToken = {
            username: "u",
            email: "u@h.it",
            role: "Regular",
            exp: Date.now()  //to confirm TODO
           }
           const decodedRefreshToken = {
            username: "u",
            email: "u@h.it",
            role: "Regular"
           }
        const verifySpy = jest.spyOn(jwt, 'verify');   
        verifySpy.mockReturnValueOnce(decodedAccessToken);
        verifySpy.mockReturnValueOnce(decodedRefreshToken);

        const result = verifyAuth(mockReq, mockRes, mockInfo);
        expect(result).not.toBeNull();
        expect(result).toHaveProperty('flag');
        expect(result).toHaveProperty('cause');
        expect(result).toEqual({ flag: true, cause: "Authorized" });
    });
    
    test("Admin loggin", async () => {
        const mockReq = {
            cookies: token
        };
        const mockRes = {
        };
        const mockInfo = {
            authType:"Admin"
        };
        const decodedAccessToken = {
            username: "a",
            email: "a@h.it",
            role: "Admin",
            exp: Date.now()  //to confirm TODO
           }
           const decodedRefreshToken = {
            username: "a",
            email: "a@h.it",
            role: "Admin"
           }
        const verifySpy = jest.spyOn(jwt, 'verify');   
        verifySpy.mockReturnValueOnce(decodedAccessToken);
        verifySpy.mockReturnValueOnce(decodedRefreshToken);

        const result = verifyAuth(mockReq, mockRes, mockInfo);
        expect(result).not.toBeNull();
        expect(result).toHaveProperty('flag');
        expect(result).toHaveProperty('cause');
        expect(result).toEqual({ flag: true, cause: "Authorized" });
    });
    
    test("Group loggin", async () => {
        const mockReq = {
            cookies: token
        };
        const mockRes = {
        };
        const mockInfo = {
            authType:"Group",
            members:["a@h.it","u@h.it","a@h.it"]
        };
        const decodedAccessToken = {
            username: "a",
            email: "a@h.it",
            role: "Admin",
            exp: Date.now()  //to confirm TODO
           }
           const decodedRefreshToken = {
            username: "a",
            email: "a@h.it",
            role: "Admin"
           }
        const verifySpy = jest.spyOn(jwt, 'verify');   
        verifySpy.mockReturnValueOnce(decodedAccessToken);
        verifySpy.mockReturnValueOnce(decodedRefreshToken);

        const result = verifyAuth(mockReq, mockRes, mockInfo);
        expect(result).not.toBeNull();
        expect(result).toHaveProperty('flag');
        expect(result).toHaveProperty('cause');
        expect(result).toEqual({ flag: true, cause: "Authorized" });
    });
    
    //Exceptions
    test("Simple: no cookies ", async () => {
        const mockReq = {
        };
        const mockRes = {
        };
        const mockInfo = {
            authType:"Simple"
        };

        const result = verifyAuth(mockReq, mockRes, mockInfo);
        expect(result).not.toBeNull();
        expect(result).toEqual({flag: false, cause: "Missing cookies" });
    });
    
    test("Simple: no cookies properties ", async () => {
        const mockReq = {
            cookies: missingToken
        };
        const mockRes = {
        };
        const mockInfo = {
            authType:"Simple"
        };

        const result = verifyAuth(mockReq, mockRes, mockInfo);
        expect(result).not.toBeNull();
        expect(result).toEqual({flag: false, cause: "Unauthorized" });
    });
    
    test("Simple: username in decode access is missing ", async () => {
        const mockReq = {
            cookies: token
        };
        const mockRes = {
        };
        const mockInfo = {
            authType:"Simple"
        };
        const decodedAccessToken = {
            username: "",
            email: "a@h.it",
            role: "Admin",
            exp: Date.now()  //to confirm TODO
           }
           const decodedRefreshToken = {
            username: "a",
            email: "a@h.it",
            role: "Admin"
           }

           const verifySpy = jest.spyOn(jwt, 'verify');   
           verifySpy.mockReturnValueOnce(decodedAccessToken);
           verifySpy.mockReturnValueOnce(decodedRefreshToken);   

        const result = verifyAuth(mockReq, mockRes, mockInfo);
        expect(result).not.toBeNull();
        expect(result).toEqual({flag: false, cause: "Token is missing information" });
    });
    
    test("Simple: email in decode refresh is missing ", async () => {
        const mockReq = {
            cookies: token
        };
        const mockRes = {
        };
        const mockInfo = {
            authType:"Simple"
        };
        const decodedAccessToken = {
            username: "a",
            email: "a@h.it",
            role: "Admin",
            exp: Date.now()  //to confirm TODO
           }
           const decodedRefreshToken = {
            username: "a",
            email: "",
            role: "Admin"
           }

           const verifySpy = jest.spyOn(jwt, 'verify');   
           verifySpy.mockReturnValueOnce(decodedAccessToken);
           verifySpy.mockReturnValueOnce(decodedRefreshToken);   

        const result = verifyAuth(mockReq, mockRes, mockInfo);
        expect(result).not.toBeNull();
        expect(result).toEqual({flag: false, cause: "Token is missing information" });
    });
    
    test("Simple: mismatch users  ", async () => {
        const mockReq = {
            cookies: token
        };
        const mockRes = {
        };
        const mockInfo = {
            authType:"Simple"
        };
        const decodedAccessToken = {
            username: "a",
            email: "a@h.it",
            role: "Admin",
            exp: Date.now()  //to confirm TODO
           }
           const decodedRefreshToken = {
            username: "b",
            email: "b@h.it",
            role: "Admin"
           }

           const verifySpy = jest.spyOn(jwt, 'verify');   
           verifySpy.mockReturnValueOnce(decodedAccessToken);
           verifySpy.mockReturnValueOnce(decodedRefreshToken);   

        const result = verifyAuth(mockReq, mockRes, mockInfo);
        expect(result).not.toBeNull();
        expect(result).toEqual({flag: false, cause: "Mismatched users" });
    });

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
