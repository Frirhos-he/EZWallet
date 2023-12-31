import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth, checkMissingOrEmptyParams} from "./utils.js";

/**
 * Create a new category  Done
  - Request Parameters: None
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
  - Returns a 400 error if the request body does not contain all the necessary attributes 
  - Returns a 400 error if at least one of the parameters in the request body is an empty string 
  - Returns a 400 error if the type of category passed in the request body represents an already existing category in the database 
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) 

 */
export const createCategory = async (req, res) => {
    try {  
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.flag)
            return res.status(401).json({ error: adminAuth.cause }) 

        const { type, color } = req.body;

        //Check for missing or empty string parameter
        let message;
        if((message = checkMissingOrEmptyParams([type, color])))
            return res.status(400).json({ error: message });
        
        // Check if the username or email already exists
        const existingCategory = await categories.findOne({ type: type });
        if (existingCategory) return res.status(400).json({ error: "Category already exists" });
        const new_categories = new categories({ type, color });

        res.locals.refreshedTokenMessage = ""
        new_categories.save()
            .then(data => {
                res.status(200).json({ 
                    data: { type:data.type, color:data.color },
                    refreshedTokenMessage: res.locals.refreshedTokenMessage
                });
            })
            .catch(err => { throw err })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Edit a category's type or color  Done
  - Request Parameters: A string equal to the type of the category that must be edited
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Returns a 400 error if the request body does not contain all the necessary attributes 
  - Returns a 400 error if at least one of the parameters in the request body is an empty string 
  - Returns a 400 error if the type of category passed as a route parameter does not represent a category in the database 
  - Returns a 400 error if the type of category passed in the request body as the new type represents an already existing category in the database 
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) 
 */
export const updateCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.flag)
            return res.status(401).json({ error: adminAuth.cause }) 

        const { type, color } = req.body;

        //Check for missing or empty string parameter
        let message;
        if((message = checkMissingOrEmptyParams([type, color])))
            return res.status(400).json({ error: message });
        //Check if there is the specified category to be modified
        const foundCategory = await categories.findOne({ type: req.params.type });
        if(!foundCategory){
            return res.status(400).json({ error: "Category of type '" + req.params.type + "' not found" });
        }
        
        //Check if there is already a category with the same type as the new one
        //Additionally, check if new type is equal to current type, in order to allow updating only the color
        const foundConflictingCategory = await categories.findOne({ type: type });
        if((req.params.type !== type) && foundConflictingCategory){
            return res.status(400).json({ error: "Category of type '" + type + "' already exists" });
        }

        //Updating category
        const updateCategories =  await categories.updateOne(
            { type: req.params.type },
            { $set: { type: type,  color: color } }
        );
        
        //Updating transactions
        const updateTransactions = await transactions.updateMany(
            { type: req.params.type },
            { $set: { type: type } }
        );

        res.locals.refreshedTokenMessage = ""
        return res.status(200).json({ 
            data: { message: "Category successfully updated", count: updateTransactions.modifiedCount },
            refreshedTokenMessage: res.locals.refreshedTokenMessage 
        });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Delete a categories  Done
  - Request Parameters: None
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - In case any of the following errors apply then no category is deleted
  - Returns a 400 error if the request body does not contain all the necessary attributes
  - Returns a 400 error if called when there is only one category in the database
  - Returns a 400 error if at least one of the types in the array is an empty string
  - Returns a 400 error if at least one of the types in the array does not represent a category in the database
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.flag)
            return res.status(401).json({ error: adminAuth.cause }) 

        let {types} = req.body;
        if(types === undefined){
            return res.status(400).json({ error: "types object not inserted" }); 
        }
        
        types = [...new Set(types)];   //to elimate duplicates
        const typeListLength = types.length;
        //Check if passed array is empty
        if (!typeListLength) 
            return res.status(400).json({ error: "body request is an empty array" });  
        //Check if one of the categories is empty string
        if (types.some((element) => element.trim() === "")) 
            return res.status(400).json({ error: "at least one of the types in the array is an empty string" }); 

        //Check if there is at least one category for every category type in request body
        for(let i=0 ; i<typeListLength ; i++){
            const foundCategory = await categories.findOne({ type: types[i] });
            if(!foundCategory){
                return res.status(400).json({ error: "Category for type '" + types[i] + "' not found" }); //Category with specified type not found
            }
        }

        let updateResult;

        const allCategories = await categories.find({});
        //count the tot number of categories
        const totNumberCategories = allCategories.length;
        //Only one category in db, no deletion done
        if(totNumberCategories == 1)
                return res.status(400).json({ error: "Only one category remaining in database" });

        //sort based on the oldest one
        allCategories.sort((a, b) => b.createdAt - a.createdAt);
        
        let oldestCategory;
        //If total categories in db is strictly more than to be deleted categories, then set the oldest category to the oldest in db not present in type
        let validType = false;
        if(totNumberCategories > typeListLength){
            for(let j=0 ; (j < totNumberCategories) && !validType ; j++){ //For every category in db until found a valid type not present in req body
                if(types.indexOf(allCategories[j].type)==-1){  //If category in db is not in req body typelist
                    validType = true;
                    oldestCategory = allCategories[j];
                }
            }
        }
        else if(totNumberCategories == typeListLength){ //If total categories in db is the same of to be deleted categories, then pick the absolute oldest (even if present in req body typelist)
            oldestCategory = allCategories[0];
            types.pop(oldestCategory.type);
        }
        
        
        //Updating affected transactions
            updateResult =  await transactions.updateMany(
            { type: { $in: types } },
            { $set: { type: oldestCategory.type } }
        );

        const deleteResult = await categories.deleteMany({ type: { $in: types }  });

        res.locals.refreshedTokenMessage = ""
        return res.status(200).json({ 
            data: { message: "Categories deleted", count: (updateResult ? updateResult.modifiedCount : 0 ) },
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Return all the categories  Done
  - Request Parameters: None  
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
  - Returns a 401 error if called by a user who is not authenticated (authType = Simple)
 */
export const getCategories = async (req, res) => {
    try {
        const simpleAuth = verifyAuth(req, res, { authType: "Simple" })

        if(!simpleAuth.flag)
            return res.status(401).json({ error: simpleAuth.cause }) 

        let data = await categories.find({})  

        let categoriesData = data.map(v => Object.assign({}, { type: v.type, color: v.color }))

        res.locals.refreshedTokenMessage = ""
        return res.status(200).json({
            data: categoriesData,
            refreshedTokenMessage:res.locals.refreshedTokenMessage
        })  //no need of message since the authtype is simple
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Create a new transaction made by a specific user  Done
  - Request Parameters: A string equal to the `username` of the involved user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Returns a 400 error if the request body does not contain all the necessary attributes 
  - Returns a 400 error if at least one of the parameters in the request body is an empty string 
  - Returns a 400 error if the type of category passed in the request body does not represent a category in the database 
  - Returns a 400 error if the username passed in the request body is not equal to the one passed as a route parameter 
  - Returns a 400 error if the username passed in the request body does not represent a user in the database 
  - Returns a 400 error if the username passed as a route parameter does not represent a user in the database 
  - Returns a 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted) 
  - Returns a 401 error if called by an authenticated user who is not the same user as the one in the route parameter (authType = User)
 */
export const createTransaction = async (req, res) => {
    try {
        const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })

        if(!userAuth.flag)
            return res.status(401).json({ error: userAuth.cause }) 

        const { username, amount, type } = req.body;


        let message;
        if((message = checkMissingOrEmptyParams([username, amount, type])))
                return res.status(400).json({ error: message });

        //Try parsing amount as float
        if(isNaN(parseFloat(amount)))
            return res.status(400).json({ error: "Invalid amount value" });

        //Check if body username is the same as the one in route
        if( req.params.username !== username )
            return res.status(400).json({ error: "Username mismatch" });

        //Search for user and category(body)
        const matchedUser = await User.findOne({ username: username });
        if(!matchedUser) {
            return res.status(400).json({ error: "The user does not exist" })
        }
        const matchedCategory = await categories.findOne({ type: type });
        if(!matchedCategory) {
            return res.status(400).json({ error: "The category does not exist" })
        }
        //Search for requesting user(route)
        const matchedUserRoute = await User.findOne({ username: req.params.username });
        if(!matchedUserRoute) {
            return res.status(400).json({ error: "The requesting user does not exist" })
        }

        const new_transactions = new transactions({ username, amount, type });

        res.locals.refreshedTokenMessage = ""
        new_transactions.save()
            .then(data => res.status(200).json({ 
                data: { username: data.username, amount: data.amount , type: data.type, date: data.date }, 
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            }))
            .catch(err => { throw err })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Return all transactions made by all users
  - Request Parameters: None
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const getAllTransactions = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (!adminAuth.flag)
            return res.status(401).json({ error: adminAuth.cause }) 
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */
        
        res.locals.refreshedTokenMessage = ""
        
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories", 
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let dataResult = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.status(200).json({
                data: dataResult,
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user
  - Request Parameters: A string equal to the `username` of the involved user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
  - Returns a 400 error if the username passed as a route parameter does not represent a user in the database
  - Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions`
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username`
  - Can be filtered by date and amount if the necessary query parameters are present and if the route is `/api/users/:username/transactions`
    */
export const getTransactionsByUser = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        if (req.url.indexOf("/transactions/users/") >= 0) {   //admin 
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.flag)
                return res.status(401).json({ error: adminAuth.cause }) 
        }
        else {   //user
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })
            if(!userAuth.flag)
                return res.status(401).json({ error: userAuth.cause }) 
        }

        //see if on db the user requesting the getTransactionsByUser
        const username = req.params.username;
        const matchedUser = await User.findOne({ username: username });
        if(!matchedUser) {
            return res.status(400).json({ error: "the user does not exist" })
        }
        
        const queryDate   = handleDateFilterParams(req);
        const queryAmount = handleAmountFilterParams(req);

        let matchStage = {username: username};
        if (Object.keys(queryDate).length !== 0 ){
            matchStage = { ...matchStage, ...queryDate };
        }
        if (Object.keys(queryAmount).length !== 0 ){
            matchStage = { ...matchStage, ...queryAmount };
        }

        res.locals.refreshedTokenMessage = ""

        //Query the MONGODB Transactions
        transactions.aggregate([
            { $match: matchStage},
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let dataResult = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.status(200).json({data:dataResult,
                     refreshedTokenMessage: res.locals.refreshedTokenMessage});
        }).catch(error => { throw (error) })

    } catch (error) {
        res.status(400).json({ error: error.message })
   }  
}    

/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Parameters: A string equal to the `username` of the involved user, a string equal to the requested `category`
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
  - Returns a 400 error if the username passed as a route parameter does not represent a user in the database
  - Returns a 400 error if the category passed as a route parameter does not represent a category in the database
  - Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions/category/:category`
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username/category/:category`
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
        if (req.url.indexOf("/transactions/users/") >= 0) {   //admin 
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.flag)
                return res.status(401).json({ error: adminAuth.cause }) 
        } else {                       //user
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })
            if(!userAuth.flag)
                return res.status(401).json({ error: userAuth.cause }) 
        }

        const username = req.params.username;
        const matchedUserid = await User.findOne({username: username });
        if(!matchedUserid) {
            return res.status(400).json({ error : "The user does not exist" });
        }
        //Search requested category
        const category = req.params.category;
        const matchedCategory = await categories.findOne({ type: category });
        if(!matchedCategory) {
            return res.status(400).json({ error: "The category does not exist" });
        }

        res.locals.refreshedTokenMessage = ""

        transactions.aggregate([
            { $match: { username: username, type: category }},
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let dataResult = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.status(200).json({data:dataResult,
                      refreshedTokenMessage:res.locals.refreshedTokenMessage});
        }).catch(error => { throw (error) })

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Return all transactions made by members of a specific group
  - Request Parameters: A string equal to the `name` of the requested group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions made by the group
  - Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
  - Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `/api/groups/:name/transactions`
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/groups/:name`
 */
export const getTransactionsByGroup = async (req, res) => {
    try {
        const group = req.params.name;
        const matchedGroup = await Group.findOne({name: group });
        if (!matchedGroup)
             return res.status(400).json({ error: "The group doesn't exist" })

        if (req.url.indexOf("/transactions/groups/") >= 0) {   //admin 
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.flag)
                return res.status(401).json({ error: adminAuth.cause }) 
        } else {                               //user
            const groupAuth = verifyAuth(req, res, { authType: "Group", members: matchedGroup.members })
            if(!groupAuth.flag)
                return res.status(401).json({ error: groupAuth.cause }) 
        }

        const userByEmail = matchedGroup.members.map((member) => member.email);
        const usersByUsername  = await User.find({email: {$in: userByEmail}},{username: 1, _id: 0}); 
        const usernames = usersByUsername.map(user => user.username);
        
            res.locals.refreshedTokenMessage = ""

            transactions.aggregate([
                { $match: { username: { $in: usernames } } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" }
            ]).then((result) => {

                let dataResult = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
                res.status(200).json({
                    data: dataResult,
                    refreshedTokenMessage: res.locals.refreshedTokenMessage
                });
            }).catch(error => { throw (error) })
        
    } catch (error) {
        res.status(400).json({ error: error.message });    
    }
}

/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Parameters: A string equal to the `name` of the requested group, a string equal to the requested `category`
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - empty array must be returned if there are no transactions made by the group with the specified category
  - Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
  - Returns a 400 error if the category passed as a route parameter does not represent a category in the database
  - Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `/api/groups/:name/transactions/category/:category`
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/groups/:name/category/:category`
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {

        const group = req.params.name;
        const matchedGroup = await Group.findOne({name: group });
        if (!matchedGroup)
            return res.status(400).json({ error: "The group doesn't exist" })

        if (req.url.indexOf("/transactions/groups/") >= 0) {   //admin 
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.flag)
                return res.status(401).json({ error: adminAuth.cause })    
        } else {                    ///user
            const groupAuth = verifyAuth(req, res, { authType: "Group", members: matchedGroup.members })
            if(!groupAuth.flag)
                return res.status(401).json({ error: groupAuth.cause  }) 
        }

        //Search requested category
        const type = req.params.category;
        const matchedCategory = await categories.findOne({type: type});
        if(!matchedCategory) {
            return res.status(400).json({ error: "the category does not exist" });
        }

        const userByEmail = matchedGroup.members.map((member) => member.email);
        const usersByUsername  = await User.find({email: {$in: userByEmail}},{username: 1, _id: 0}); 
        const usernames = usersByUsername.map(user => user.username);

        res.locals.refreshedTokenMessage = ""

        transactions.aggregate([
            { $match: { username: { $in: usernames}, type: type } },
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let dataResult = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.status(200).json({
                data: dataResult,
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }).catch(error => { throw (error) })

    } catch (error) {
        res.status(400).json({ error: error.message });    
    }
}

/**
 * Delete a transaction made by a specific user
  - Request Parameters: A string equal to the `username` of the involved user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Returns a 400 error if the request body does not contain all the necessary attributes
  - Returns a 400 error if the `_id` in the request body is an empty string
  - Returns a 400 error if the username passed as a route parameter does not represent a user in the database
  - Returns a 400 error if the `_id` in the request body does not represent a transaction in the database
  - Returns a 400 error if the `_id` in the request body represents a transaction made by a different user than the one in the route
  - Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User)
 */  //a regular user should be capable deleting only own transactions
export const deleteTransaction = async (req, res) => {
  try {
    const userAuth = verifyAuth(req, res, {
      authType: "User",
      username: req.params.username,
    });
    if (!userAuth.flag) return res.status(401).json({ error: userAuth.cause });

    //Check for missing or empty string parameter

    let message;
    if ((message = checkMissingOrEmptyParams([req.body._id])))
      return res.status(400).json({ error: message });

    //Search requested user
    const username = req.params.username;
    const matchedUserid = await User.findOne({ username: username });
    if (!matchedUserid) {
      return res.status(400).json({ error: "The user does not exist" });
    }

    //Search requested transaction
    const transactionId = req.body._id;
    const matchedTransaction = await transactions.findOne({
      _id: transactionId,
    });
    if (!matchedTransaction) {
      return res.status(400).json({ error: "The transaction does not exist" });
    }

    //Check if the transaction was made by the user requesting deletion
    if (matchedTransaction.username !== username) {
      return res
        .status(400)
        .json({ error: "The transaction is not made by the requesting user" });
    }

    res.locals.refreshedTokenMessage = "";

    let data = await transactions.deleteOne({ _id: transactionId });
    return res.status(200).json({
      data: { message: "Transaction deleted" },
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete multiple transactions identified by their ids
  - Request Parameters: None  
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - In case any of the following errors apply then no transaction is deleted
  - Returns a 400 error if the request body does not contain all the necessary attributes
  - Returns a 400 error if at least one of the ids in the array is an empty string
  - Returns a 400 error if at least one of the ids in the array does not represent a transaction in the database
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteTransactions = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.flag)
            return res.status(401).json({ error: adminAuth.cause }) 
        
        const transactionsToDelete = req.body._ids;

        //Check for missing or empty string parameter
        let message;
        if((message = checkMissingOrEmptyParams([transactionsToDelete])))
            return res.status(400).json({ error: message });
   
        let emptyStrings = transactionsToDelete.filter((o) => typeof o === 'string' && o.trim() === "")

        if (emptyStrings.length != 0)
            return res.status(400).json({ error: 'Empty strings' });

        const matchingDocuments = await transactions.find({ _id: { $in: transactionsToDelete } });
        // Check if all input IDs have corresponding transactions

        if (matchingDocuments.length !== transactionsToDelete.length) {
            return res.status(400).json({ error: 'At least one ID does not have a corresponding transaction.' });
        }

        const result = await transactions.deleteMany({_id: { $in: transactionsToDelete }}); 
        
        res.locals.refreshedTokenMessage = ""

        return res.status(200).json({ 
            data: { message: "Transactions deleted" }, 
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
