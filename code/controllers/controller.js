import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth, checkMissingOrEmptyParams} from "./utils.js";

/**
 * Create a new category
  - Request Parameters: None
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
  - Returns a 400 error if the request body does not contain all the necessary attributes 
  - Returns a 400 error if at least one of the parameters in the request body is an empty string 
  - Returns a 400 error if the type of category passed in the request body represents an already existing category in the database 
  - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) 
 */export const createCategory = (req, res) => {
    try {  
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.authorized)
            return res.status(401).json({ error: adminAuth.cause }) 

        const { type, color } = req.body;
        //Check for missing or empty string parameter
        if(checkMissingOrEmptyParams([type, color], res))
            return res.status(400).json({ error: "missing parameters" });
        
        const new_categories = new categories({ type, color });

        res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
        new_categories.save()
            .then(data => {
                res.json({ data:{ type:data.type, color:data.color },
                           message: res.locals.refreshedTokenMessage
                            });
            })
            .catch(err => { throw err })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


/**
 * Edit a category's type or color
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

        if(!adminAuth.authorized)
            return res.status(401).json({ error: adminAuth.cause }) 

        const { type, color } = req.body;
        //Check for missing or empty string parameter
        if(checkMissingOrEmptyParams([type, color], res))
            return res.status(400).json({ error: "missing parameters" });
        
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
        res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
        return res.json({ data: { message: "Categories successfully updated", count: updateTransactions.modifiedCount },
                          message: res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Delete a category
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

        if(!adminAuth.authorized)
            return res.status(401).json({ error: adminAuth.cause }) 

        let typeList = req.body;
            typeList = [...new Set(typeList)];   //to elimate
        const typeListLength = typeList.length;
        
        //Check for missing or empty string parameter
        if(checkMissingOrEmptyParams(typeList, res))
            return res.status(400).json({ error: "missing parameters" });
        
        //Check if there is at least one category for every category type in request body
        for(let i=0 ; i<typeListLength ; i++){
            const foundCategory = await categories.findOne({ type: typeList[i] });
            if(!foundCategory){
                return res.status(401).json({ error: "Category for type '" + typeList[i] + "' not found" }); //Category with specified type not found
            }
        }

        //count the tot number of categories
        const totNumberCategories = (await categories.find({})).length;
        //Only one category in db, no deletion done
        if(totNumberCategories == 1)
            return res.status(400).json({ error: "Only one category remaining in database" });

        let updateResult;
        //Deletion
        if(totNumberCategories == typeListLength){ // would be necessary to leave the firstOne
            const firstCategory = await categories.findOne({});   //take the first
            //Updating affected transactions
                updateResult =  await transactions.updateMany(
                { type: { $in: typeList } },
                { $set: { type: firstCategory.type } }
            );
            typeList.pop(firstCategory.type);  // so that the firstCategory will be left unchanged
            const deleteResult = await categories.deleteMany({ type: { $in: typeList }  });
        } else {
            const firstCategory = await categories.findOne({type: { $nin:typeList}});   //take the first
            //Updating affected transactions
                updateResult =  await transactions.updateMany(
                { type: { $in: typeList } },
                { $set: { type: firstCategory.type } }
            );
            const deleteResult = await categories.deleteMany({ type: { $in: typeList }  });
        }
        

        res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
        return res.json({ data: { message: "Categories successfully deleted", count: (updateResult ? updateResult.modifiedCount : 0 ) },
                          message: res.locals.refreshedTokenMessage});
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {
        const simpleAuth = verifyAuth(req, res, { authType: "Simple" })

        if(!simpleAuth.authorized){
            return res.status(401).json({ error: simpleAuth.cause }) 
        }

        let data = await categories.find({})

        let categoriesData = data.map(v => Object.assign({}, { type: v.type, color: v.color }))
        res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
        return res.json({data: categoriesData, message:res.locals.refreshedTokenMessage })  //no need of message since the authtype is simple
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 401 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
    try {

        //TODO: check params with weili function

        const userAuth = verifyAuth(req, res, { authType: "Simple"});

        if(!userAuth.authorized)
        {
            return res.status(401).json({ error: "user: " + userAuth.cause }) 
        }
        const { username, amount, type } = req.body;

        const matchedUser = await User.findOne({ username: username });
        if(!matchedUser) {
            return res.status(401).json({ error: "the user does not exist" })
        }
        const matchedCategory = await categories.findOne({ type: type });
        if(!matchedCategory) {
            return res.status(401).json({ error: "the category does not exist" })
        }

        const new_transactions = new transactions({ username, amount, type });
        new_transactions.save()
            .then(data => res.json({ data: { username: data.username, amount: data.amount , type: data.type, date: data.date }, message: res.locals.refreshedToken }))
            .catch(err => { throw err })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
    try {

        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (!adminAuth.authorized)
            return res.status(401).json({ error:  " admin: " + adminAuth.cause }) 
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */
        
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
            res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
            res.json({data: dataResult,
                      message: res.locals.refreshedTokenMessage});
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        if (req.url.indexOf("/transactions/users/") >= 0) {   //admin 
            try {
                const adminAuth = verifyAuth(req, res, { authType: "Admin" })
                if (!adminAuth.authorized)
                    return res.status(401).json({ error: " admin: " + adminAuth.cause }) 
            
                //see if on db the user requesting the getTransactionsByUser
                const username = req.params.username;
                const matchedUser = await User.findOne({ username: username });
                if(!matchedUser) {
                    return res.status(401).json({ error: "the user does not exist" })
                }
                
                //Query the MONGODB Transactions
                transactions.aggregate([
                    { $match: { username: username }},
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
                    res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
                    res.json({data:dataResult,
                              message:res.locals.refreshedTokenMessage});
                }).catch(error => { throw (error) })
            } catch (error) {
                if(error.message == "the user does not exist") res.status(401).json({ error: error.message })
                else res.status(400).json({ error: error.message })
            }
        }  else {   //user
            try{
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })

            if(!userAuth.authorized){
                return res.status(401).json({ error: " user: " + userAuth.cause }) 
            }
            //see if on db the user requesting the getTransactionsByUser
            const username = req.params.username;
            const matchedUser = await User.findOne({ username: username });
            if(!matchedUser) {
                return res.status(401).json({ error: "the user does not exist" })
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
                res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
                res.json({data:dataResult,
                         message: res.locals.refreshedTokenMessage});
            }).catch(error => { throw (error) })
        } catch (error) {
            if(error.message == "the user does not exist") res.status(401).json({ error: error.message })
            else res.status(400).json({ error: error.message })
        }
        }} catch (error) {
        res.status(400).json({ error: error.message })
        }
}          

/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
    - error 401 is returned if the user or the category does not exist
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
      
        if (req.url.indexOf("/transactions/users/") >= 0) {   //admin 
                    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
                    if (!adminAuth.authorized)
                        return res.status(401).json({ error: " admin: " + adminAuth.cause }) 
                    //Search requested user
                const username = req.params.username;
                const matchedUserid = await User.findOne({username: username });
                if(!matchedUserid) {
                    return res.status(401).json({ error :"the user does not exist" });
                }
                //Search requested category
                const category = req.params.category;
                const matchedCategory = await categories.findOne({ type: category });
                if(!matchedCategory) {
                    return res.status(401).json({ error: "the category does not exist" });
                }
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
                    res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
                    res.json({data:dataResult,
                              message:res.locals.refreshedTokenMessage});
                }).catch(error => { throw (error) })

        } else {                       //user
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })
            if(!userAuth.authorized)
            {
                return res.status(401).json({ error: "user: " + userAuth.cause }) 
            }
             //Search requested user
        const username = req.params.username;
        const matchedUserid = await User.findOne({username: username });
        if(!matchedUserid) {
            return res.status(401).json({ error :"the user does not exist" });
        }
        //Search requested category
        const category = req.params.category;
        const matchedCategory = await categories.findOne({ type: category });
        if(!matchedCategory) {
            return res.status(401).json({ error: "the category does not exist" });
        }

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
            res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
            res.json({data:dataResult,
                      message:res.locals.refreshedTokenMessage});
        }).catch(error => { throw (error) })
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
export const getTransactionsByGroup = async (req, res) => {
    try {
        if (req.url.indexOf("/transactions/groups/") >= 0) {   //admin 
            
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.authorized)
                        return res.status(401).json({ error: " admin: " + adminAuth.cause }) 
            const group = req.params.name;
                //AS an ADMIN, He can get access all groups,I only check the group exist
      /*      const matchedGroup = await Group.findOne({name: group });
            if (!matchedGroup)
            return res.status(401).json({ message: "The group doesn't exist" })
            const groupAuth = verifyAuth(req, res, { authType: "Group", members: matchedGroup.members })

            if(!groupAuth.authorized)
            {
                const adminAuth = verifyAuth(req, res, { authType: "Admin" })
                if (!adminAuth.authorized)
                    return res.status(401).json({ error: "groupAuth: " + groupAuth.message + ", adminAuth: " + adminAuth.message }) 
            }
      */
            const matchedGroup = await Group.findOne({name: group });
            if (!matchedGroup)
            return res.status(401).json({ message: "The group doesn't exist" })
        
            const usersById = matchedGroup.members.map((member) => member.user);
            const usersByUsername  = await User.find({_id: {$in: usersById}},{username: 1, _id: 0}); 
            const usernames = usersByUsername.map(user => user.username);
            
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
                res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
                res.json({data: dataResult, message: res.locals.refreshedTokenMessage});
            }).catch(error => { throw (error) })
        }else{                               //user
            const group = req.params.name;
            const matchedGroup = await Group.findOne({name: group });
            if (!matchedGroup)
                 return res.status(401).json({ message: "The group doesn't exist" })
            const groupAuth = verifyAuth(req, res, { authType: "Group", members: matchedGroup.members })

            if(!groupAuth.authorized)
            {
                return res.status(401).json({ error: "group: " + groupAuth.cause }) 
            }
        
            const usersById = matchedGroup.members.map((member) => member.user);
            const usersByUsername  = await User.find({_id: {$in: usersById}},{username: 1, _id: 0}); 
            const usernames = usersByUsername.map(user => user.username);
            
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
                res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
                res.json({data: dataResult, message: res.locals.refreshedTokenMessage});
            }).catch(error => { throw (error) })

        }

        
    } catch (error) {
        res.status(400).json({ error: error.message });    
    }
}

/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 401 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {

        if (req.url.indexOf("/transactions/groups/") >= 0) {   //admin 
            
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.authorized)
                return res.status(401).json({ error: " admin: " + adminAuth.cause })    
            const group = req.params.name;
            const matchedGroup = await Group.findOne({name: group });
            if (!matchedGroup)
            return res.status(401).json({ message: "The group doesn't exist" })
            //Search requested category
            const type = req.params.category;
            const matchedCategory = await categories.findOne({type: type});
            if(!matchedCategory) {
                return res.status(401).json({ error: "the category does not exist" });
            }


            const usersById = matchedGroup.members.map((member) => member.user);
            const usersByUsername  = await User.find({_id: {$in: usersById}},{username: 1, _id: 0}); 
            const usernames = usersByUsername.map(user => user.username);
            


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
                res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
                res.json({data: dataResult, message: res.locals.refreshedTokenMessage});
            }).catch(error => { throw (error) })

        } else {                    ///user
            const group = req.params.name;
            const matchedGroup = await Group.findOne({name: group });
            if (!matchedGroup)
                 return res.status(401).json({ message: "The group doesn't exist" })
            const groupAuth = verifyAuth(req, res, { authType: "Group", members: matchedGroup.members })

            if(!groupAuth.authorized)
            {
                return res.status(401).json({ error: "group: " + groupAuth.cause  }) 
            }
            //Search requested category
            const type = req.params.category;
            const matchedCategory = await categories.findOne({type: type});
            if(!matchedCategory) {
                return res.status(401).json({ error: "the category does not exist" });
            }


            const usersById = matchedGroup.members.map((member) => member.user);
            const usersByUsername  = await User.find({_id: {$in: usersById}},{username: 1, _id: 0}); 
            const usernames = usersByUsername.map(user => user.username);
            


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
                res.locals.refreshedTokenMessage = "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls;" //tocheck
                res.json({data: dataResult, message: res.locals.refreshedTokenMessage});
            }).catch(error => { throw (error) })

        }

    } catch (error) {
        res.status(400).json({ error: error.message });    
    }
}

/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 401 is returned if the user or the transaction does not exist
 */  //a regular user should be capable deleting only own transactions
export const deleteTransaction = async (req, res) => {
    try {

        //TODO: check params with weili function

        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (!adminAuth.authorized)
        {   

            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })
            if(!userAuth.authorized)
                return res.status(401).json({ error: "user: " + userAuth.cause + " admin: " + adminAuth.cause })
            //userAuthenticated
             //does it belong to the user?
            let doesItBelong = await transactions.findOne({ _id: req.body._id, username: req.params.username });

            if(doesItBelong) {
                                let dataResult = await transactions.deleteOne({ _id: req.body._id , username: req.params.username});
                                return res.json({ data: { message: "deleted" }, message: res.locals.refreshedToken});
                                }
            else  return res.status(401).json({ error: "it doesn't belong to the user"});
           
        }
        
        let data = await transactions.deleteOne({ _id: req.body._id });
        return res.json({ data: { message: "deleted" }, message: res.locals.refreshedToken});

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
    try {

        //TODO: check params with weili function

        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.authorized)
            return res.status(401).json({ error: "admin: " + adminAuth.cause }) 
        
        const matchingDocuments = await transactions.find({ _id: { $in: req.body.array_id } });
        // Check if all input IDs have corresponding transactions

        if (matchingDocuments.length !== req.body.array_id.length) {
            return res.status(401).json({ error: 'At least one ID does not have a corresponding transaction.' });
        }
        const result = await transactions.deleteMany({_id: { $in: req.body.array_id}}); 
        
        return res.json({ data: { message: "deleted" }, message: res.locals.refreshedToken });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
