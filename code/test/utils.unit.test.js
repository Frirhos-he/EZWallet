import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';

describe("handleDateFilterParams", () => { 
    test('Should return an empty object: no query params', () => {      
        const mockReq = {
            query: {}};
        const result = handleDateFilterParams(mockReq);
        expect(result).toEqual({}) 
    });
    test('Should return an object with property min', () => {      
        const mockReq = {query: {date: '5.55'}};
        const result = handleDateFilterParams(mockReq);
        expect(result).hasOwnProperty("date");
        console.log(result);
        expect(result).toEqual({  date: { $eq: "5.55" } });
    });
})

describe("verifyAuth", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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
        const mockReq = {query: {min: '5.55'}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).hasOwnProperty("amount");
        const childProperties = result.amount;
        expect(childProperties.$gte).toBeCloseTo(5.55,3); 
        expect(childProperties).hasOwnProperty("$gte");
        expect(result).toEqual({ amount: { $gte: 5.55 } });
    });
    test('Should return an object with property max', () => {   
        const mockReq = {query: {max: 10.5}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).hasOwnProperty("amount");
        const childProperties = result.amount;
        expect(childProperties.$lte).toBeCloseTo(10.5,2); 
        expect(childProperties).hasOwnProperty("$lte");
        expect(result).toEqual({ amount: { $lte: 10.5 } });

    });
    test('Should return an object with both property max,min', () => {   
        const mockReq = {query: {max: 1000.2, min:1.0}};
        const result = handleAmountFilterParams(mockReq);
        expect(result).hasOwnProperty("amount");
        const childProperties = result.amount;
        expect(childProperties.$gte).toBeCloseTo(1.0,2);
        expect(childProperties.$lte).toBeCloseTo(1000.2,2);
         
        expect(childProperties).hasOwnProperty("$gte");
        expect(childProperties).hasOwnProperty("$lte");
        expect(result).toEqual({ amount: { $lte: 1000.2, $gte: 1.0 } });

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

    test('Should throw an error:invalid float', () => {    
        const mockReq = {query: {min: "ciao", max: "1"}};
        expect(() =>handleAmountFilterParams(mockReq)).toThrow("Cannot be parsed");

    });
    test('Should throw an error:invalid float', () => {    
        const mockReq = {query: {min: "1", max: "xz"}};
        expect(() =>handleAmountFilterParams(mockReq)).toThrow("Cannot be parsed");

    });
    test('Should throw an error:invalid float', () => {    
        const mockReq = {query: {max: "xz"}};
        expect(() =>handleAmountFilterParams(mockReq)).toThrow("Cannot be parsed");

    });
    test('Should throw an error:invalid float', () => {    
        const mockReq = {query: {min: "xz"}};
        expect(() =>handleAmountFilterParams(mockReq)).toThrow("Cannot be parsed");

    });

})
