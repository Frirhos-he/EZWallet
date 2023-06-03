import jwt from 'jsonwebtoken'

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */

//TODO check that it works after modifications //see format
export const handleDateFilterParams = (req) => {

        //TODO: check that from is < than upTo
        const isValidDateFormat = (dateString) => {
          const regex = /^\d{4}-\d{2}-\d{2}$/;
          return regex.test(dateString);
        };

        const { date, from, upTo } = req.query;


        if (date && (from || upTo)) {
          throw new Error('Cannot use both "date" and "from" or "upTo" parameters together');
        }
      
        if (date) {
          if(!isValidDateFormat(date)){
              throw new Error("Date format is invalid");
          }
          const dateStartFormatted = new Date(`${date}T00:00:00.000Z`)
          const dateEndFormatted = new Date(`${date}T23:59:59.000Z`)
          return { date: { $lte: dateEndFormatted,  $gte: dateStartFormatted  } };
        }
      
        if (from && upTo) {

          if(!isValidDateFormat(upTo) && !isValidDateFormat(from)){
            throw new Error("both format are invalid");
        }
          if(!isValidDateFormat(from)){
            throw new Error("from format is invalid");
        }
          if(!isValidDateFormat(upTo)){
            throw new Error("upTo format is invalid");
        }
        const fromFormatted = new Date(`${from}T00:00:00.000Z`)
        const upToFormatted = new Date(`${upTo}T23:59:59.000Z`)

        if(fromFormatted > upToFormatted) return {};

          return { date: { $gte: fromFormatted, $lte: upToFormatted } };
        }
      
        if (from) {
          if(!isValidDateFormat(from)){
            throw new Error("upTo format is invalid");
        }
        const fromFormatted = new Date(`${from}T00:00:00.000Z`)
          return { date: { $gte: fromFormatted } };
        }
      
        if (upTo) {
          if(!isValidDateFormat(upTo)){
            throw new Error("upTo format is invalid");
        }

        const upToFormatted = new Date(`${upTo}T23:59:59.000Z`)
          return { date: { $lte: upToFormatted } };
        }
      
        return {};
}

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */
export const verifyAuth = (req, res, info) => {

    const cookie = req.cookies
    if(cookie == undefined){
      return { flag: false, cause: "Missing cookies" };
    }
    if (!cookie.accessToken || !cookie.refreshToken) {
        return { flag: false, cause: "Unauthorized" };
    }
    try {
        const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
        const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);

        if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
            return { flag: false, cause: "Token is missing information" }
        }
 
        if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
            return { flag: false, cause: "Token is missing information" }
        }

        if (decodedAccessToken.username !== decodedRefreshToken.username || decodedAccessToken.email !== decodedRefreshToken.email || decodedAccessToken.role !== decodedRefreshToken.role) {
          return { flag: false, cause: "Mismatched users" };
        }

        const authType = info.authType;
        const currentTime = Math.floor(Date.now() / 1000);
        switch(authType) {
            case "Simple":

              if (decodedAccessToken.exp < currentTime) {
                  throw new Error("TokenExpiredError")
              }
              break;

            case "User":

              const username = info.username;
              if (username != decodedRefreshToken.username) {
                return { flag: false, cause: "Mismatched users" };
              }
              if (decodedAccessToken.exp < currentTime) {
                  throw new Error("TokenExpiredError")
              }
              if (username != decodedAccessToken.username) {
                  return { flag: false, cause: "Mismatched users" };
      
              }

              break;
            case "Admin":
              if ("Admin" != decodedRefreshToken.role) {
                return { flag: false, cause: "Mismatch role" };
              }
              if (decodedAccessToken.exp < currentTime) {
                  throw new Error("TokenExpiredError")
              }
              if ("Admin" != decodedAccessToken.role) {
                return { flag: false, cause: "Mismatch role" };
              }
              break;

            case "Group":
              const members = info.members;
              if (!members.includes(decodedRefreshToken.email)) {
                 return { flag: false, cause: "User is not in the group" };
              }
              if (decodedAccessToken.exp < currentTime) {
                  throw new Error("TokenExpiredError")
              }
              if (!members.includes(decodedAccessToken.email)) {
                return { flag: false, cause: "User is not in the group" };
              }
              break;

            default:
              return { flag: false, cause: "Auth type is not defined" };
  
        }

        return { flag: true, cause: "Authorized" };
      } catch (err) {
        if (err.name === "TokenExpiredError") {
            try {
                const refreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY)
                const newAccessToken = jwt.sign({
                    username: refreshToken.username,
                    email: refreshToken.email,
                    id: refreshToken.id,
                    role: refreshToken.role
                }, process.env.ACCESS_KEY, { expiresIn: '1h' })
                res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true })
                res.locals.refreshedTokenMessage= 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
                return { flag: true, cause: "Authorized" }
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    return { flag: false, cause: "Perform login again" }
                } else {
                    return { flag: false, cause: err.name }
                }
            }
        } else {
            return { flag: false, cause: err.name };
        }
    }
}

/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */

//TODO check if it worksw
export const handleAmountFilterParams = (req) => {
        const { min, max } = req.query;
      
        const isNumeric = (value) => {
          return !isNaN(parseInt(value)) && isFinite(value);
        };

        if (min && max) {
          const minInt = parseInt(min);
          const maxInt = parseInt(max);
          
          if (!isNumeric(minInt) || !isNumeric(maxInt)) {
            throw new Error("Cannot be parsed"); //TODO: what about error 400?

          }
          if (minInt > maxInt) return {};

          return { amount: { $gte: minInt, $lte: maxInt } };
        }
      
        if (min) {
          const minInt = parseInt(min);
          if (!isNumeric(minInt)) {
            const error = new Error("Cannot be parsed");
            error.status = 400;
            throw error;
          }
          return { amount: { $gte: minInt } };
        }
      
        if (max) {
          const maxInt = parseInt(max);
          if (!isNumeric(maxInt)) {
            const error = new Error("Cannot be parsed");  //TODO: cannot return res.json  I can only throw from here thus 2 following calls will never work
            error.status = 400;
            throw error;
          }
          return { amount: { $lte: maxInt } };
        }
      
        return {};
}

/**
 * Check parameters of APIs that foresee the following errors:
 * - 400 error if the request body does not contain all the necessary attributes X
 * - 400 error if at least one of the parameters in the request body is an empty string X
 * @param parameters an array of strings that represents the request body parameters
 * @param res the response object from API which is updated if an error is detected
 * @returns a boolean value that is:
 * -false if no errors
 * -true if there is a missing parameter(falsy value) or if a parameter is empty after a trim
 */
// EXPECTING AN ARRAY OF PARAMS OF VALUES 
export const checkMissingOrEmptyParams = (parameters, messageObj) => {
    let i = 0;
    const nParams = parameters.length;

    if(parameters.length == 0){
          messageObj.message= "Missing values"; 
          return true;
    }
    //Check if missing parameter (all falsy values)  --> containing also empty string: Bruno --> modified not consider this case
    for (i=0 ; i<nParams ; i++){
        if (parameters[i] == null || parameters[i] == undefined){
          messageObj.message= "Missing values";  //TODO: choose if update here or in API
          return true;
        }
    }
    
    //Check for all whitespaces string parameters by trimming
    for (i=0 ; i<nParams ; i++){
        if (typeof parameters[i] === 'string' && parameters[i].trim() === "" ){
          messageObj.message= "Empty string values";   //TODO: choose if update here or in API
          return true;
        } 
    }

    return false;
}
