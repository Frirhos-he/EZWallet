import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
jest.mock('../controllers/utils');


describe("handleDateFilterParams", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("verifyAuth", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("handleAmountFilterParams", () => { 
    test('Should return an empty object: no query params', () => {      
        const mockReq = {query: {}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toContain(0);
        expect(result).toEqual({});

    });
    test('Should return an object with property min', () => {      
        const mockReq = {query: {min: 0}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toContain(1);
        expect(result).toHaveProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).toContain(1);
        expect(childProperties).toHaveProperty("$gte");
        expect(result).toEqual({ amount: { $gte: 0 } });

    });
    test('Should return an object with property max', () => {   
        const mockReq = {query: {max: 10}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toContain(1);
        expect(result).toHaveProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).toContain(1);
        expect(childProperties).toHaveProperty("$lte");
        expect(result).toEqual({ amount: { $lte: 10 } });

    });
    test('Should return an object with both property max,min', () => {   
        const mockReq = {query: {max: 1000, min:1}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toContain(1);
        expect(result).toHaveProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).toContain(2);
        expect(childProperties).toHaveProperty("$gte", "$lte");
        expect(result).toEqual({ amount: { $lte: 1000, $gte: 1 } });

    });
    test('Should return an object with both property max,min: > queryParams', () => {   
        const mockReq = {query: {max: 1000, min:1, tmp: "ciao"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toContain(1);
        expect(result).toHaveProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).toContain(2);
        expect(childProperties).toHaveProperty("$gte", "$lte");
        expect(result).toEqual({ amount: { $lte: 1000, $gte: 1 } });

    });
    test('Should return an object with property max: 1 no revelant parameter', () => {   
        const mockReq = {query: {max: 1000, tmp: "ciao"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toContain(1);
        expect(result).toHaveProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).toContain(1);
        expect(childProperties).toHaveProperty("$lte");
        expect(result).toEqual({ amount: { $lte: 1000} });

    });
    test('Should return an object with property min: 1 no revelant parameter', () => {   
        const mockReq = {query: {min: 1000, tmp: "ciao"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toContain(1);
        expect(result).toHaveProperty("amount");
        const childProperties = result.amount;
        expect(childProperties).toContain(2);
        expect(childProperties).toHaveProperty("$gte");
        expect(result).toEqual({ amount: { $gte: 1000} });

    });
    test('Should return an empty object: 3 no revelant parameter', () => {   
        const mockReq = {query: {t: 1000, tm: "ciao", tmp: "101x"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toContain(0);
        expect(result).toEqual({});

    });
    test('Should return an empty object: 2 strings', () => {   
        const mockReq = {query: {min: "1", max: "1000"}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).toContain(0);
        expect(result).toEqual({});

    });


   
})
