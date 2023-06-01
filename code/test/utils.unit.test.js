import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';

describe("handleDateFilterParams", () => { 
    test('Should return an empty object: no query params', () => {      
        const mockReq = {
            query: {}};
        const result = handleDateFilterParams(mockReq);
        expect(result).toEqual({}) 
    });
    test('Should return an object with property from', () => {      
        const mockReq = {query: {from: '2023-04-30'}};
        const result = handleDateFilterParams(mockReq);
        expect(result).hasOwnProperty("date");
        const childProperties = result.date;
        expect(childProperties).hasOwnProperty("$gte");
        expect(childProperties.$gte).toEqual('2023-04-30T00:00:00.000Z'); 
        expect(result).toEqual({ date: { $gte: '2023-04-30T00:00:00.000Z' } });
    });
    test('Should return an object with property upTo', () => {   
        const mockReq = {query: {upTo: '2023-04-31'}};
        const result = handleDateFilterParams(mockReq);
        expect(result).hasOwnProperty("date");
        const childProperties = result.date;
        expect(childProperties).hasOwnProperty("$lte");
        expect(childProperties.$lte).toEqual('2023-04-31T23:59:59.000Z'); 

        expect(result).toEqual({ date: { $lte: '2023-04-31T23:59:59.000Z' } });

    });
    test('Should return an object with property date', () => {   
        const mockReq = {query: {date: '2023-04-30'}};
        const result = handleDateFilterParams(mockReq);
        expect(result).hasOwnProperty("date");
        const childProperties = result.date;
        expect(childProperties).hasOwnProperty("$gte");
        expect(childProperties).hasOwnProperty("$lte");
        expect(childProperties.$gte).toEqual('2023-04-30T00:00:00.000Z'); 
        expect(childProperties.$lte).toEqual('2023-04-30T23:59:59.000Z'); 
        expect(result).toEqual({ date: { $gte: '2023-04-30T00:00:00.000Z',  $lte: '2023-04-30T23:59:59.000Z'  } });

    });
    test('Should return an object with both property upTo,from', () => {   
        const mockReq = {query: {upTo: "2023-04-31", from:"2023-04-30"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).hasOwnProperty("date");
        const childProperties = result.date;
        expect(childProperties).hasOwnProperty("$gte");
        expect(childProperties).hasOwnProperty("$lte");
        expect(childProperties.$gte).toEqual('2023-04-30T00:00:00.000Z'); 
        expect(childProperties.$lte).toEqual('2023-04-31T23:59:59.000Z'); 
        expect(result).toEqual({ date: { $gte: '2023-04-30T00:00:00.000Z',  $lte: '2023-04-31T23:59:59.000Z'  } });

    });
    test('Should return an object with both property max,min: > queryParams', () => {   
        const mockReq = {query: {upTo: "2023-04-30", from:"2023-04-31", tmp: "ciao"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).hasOwnProperty("date");
        const childProperties = result.date;
        expect(childProperties).hasOwnProperty("$gte", "$lte");
        expect(result).toEqual({ date: { $gte: '2023-04-30T00:00:00.000Z',  $lte: '2023-04-31T23:59:59.000Z'  } });
    });
    test('Should return an object with property max: 1 no revelant parameter', () => {   
        const mockReq = {query: {upTo: "2023-04-30", tmp: "ciao"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).hasOwnProperty("date");
        const childProperties = result.date;
        expect(childProperties).hasOwnProperty("$lte");
        expect(result).toEqual({ date: { $lte: '2023-04-30T23:59:59.000Z' } });

    });
    test('Should return an object with property min: 1 no revelant parameter', () => {   
        const mockReq = {query: {from: "2023-04-30", tmp: "ciao"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).hasOwnProperty("date");
        const childProperties = result.date;
        expect(childProperties).hasOwnProperty("$gte");
        expect(result).toEqual({ date: { $gte: '2023-04-30T00:00:00.000Z' } });

    });
    test('Should return an empty object: 3 no revelant parameter', () => {   
        const mockReq = {query: {t: 1000, tm: "ciao", tmp: "101x"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).toEqual({});

    });
    test('Should return an empty object: 2 strings', () => {    
        const mockReq = {query: {min: "100", max: "1"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).toEqual({});

    });
    test('Should return an empty object: 2 strings', () => {    
        const mockReq = {query: {min: "100", max: "1"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).toEqual({});

    });
    test('Should return an empty object: inverted max and min', () => {    
        const mockReq = {query: {min: "100", max: "1"}};
        const result = handleDateFilterParams(mockReq);
        expect(result).toEqual({});

    });

    test('Should throw an error:invalid float', () => {    
        const mockReq = {query: {min: "ciao", max: "1"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow("Cannot be parsed");

    });
    test('Should throw an error:invalid float', () => {    
        const mockReq = {query: {min: "1", max: "xz"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow("Cannot be parsed");

    });
    test('Should throw an error:invalid float', () => {    
        const mockReq = {query: {max: "xz"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow("Cannot be parsed");

    });
    test('Should throw an error:invalid float', () => {    
        const mockReq = {query: {min: "xz"}};
        expect(() =>handleDateFilterParams(mockReq)).toThrow("Cannot be parsed");

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
