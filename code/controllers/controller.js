import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */export const createCategory = (req, res) => {
    try {  //current behaviour is that the app crash "needs to change file before starting"--> dunque in group lascio la stessa cosa?
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.authorized)
            return res.status(401).json({ error: adminAuth.message }) 

        const { type, color } = req.body;
        const new_categories = new categories({ data: { type, color }});
        new_categories.save()
            .then(data => res.json(data))
            .catch(err => { throw err })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.authorized)
            return res.status(401).json({ error: adminAuth.message }) 

        const { type, color } = req.body;
        //Check if parameters are valid
        if (!type||!color) {
            return res.status(401).json({ error: "Invalid new parameters" });
        }

        //Check if there is a category of the specified type
        const foundCategory = await categories.findOne({ type: req.params.type });
        if(!foundCategory){
            return res.status(401).json({ error: "Category for type " + req.params.type + " not found" });
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
        return res.json({ data: { message: "Categories successfully updated", count: updateTransactions.modifiedCount } });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 401 is returned if the specified category does not exist
 */
export const deleteCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.authorized)
            return res.status(401).json({ error: adminAuth.message }) 

        const typeList = req.body;
        const typeListLength = typeList.length;

        //Check if there is at least one category for every category type in request body
        for(let i=0 ; i<typeListLength ; i++){
            const foundCategory = await categories.findOne({ type: typeList[i] });
            if(!foundCategory){
                return res.status(401).json({ error: "Category for type " + typeList[i] + " not found" }); //Category with specified type not found
            }
        }

        //Updating affected transactions
        const updateResult =  await transactions.updateMany(
            { type: { $in: typeList } },
            { $set: { type: 'investment' } }
        );

        //Deletion
        const deleteResult = await categories.deleteMany({ type: { $in: typeList } });

        return res.json({ data: { message: "Categories successfully deleted", count: updateResult.modifiedCount }});
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

        if(!simpleAuth.authorized)
            return res.status(401).json({ error: simpleAuth.message }) 

        let data = await categories.find({})

        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))

        return res.json({data: { categories: filter }})
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
        const userAuth = verifyAuth(req, res, { authType: "User", username: req.body.username })

        if(!userAuth.authorized)
        {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.authorized)
                return res.status(401).json({ error: "userAuth: " + userAuth.message + ", adminAuth: " + adminAuth.message }) 
        }
        
        const { username, amount, type } = req.body;
        const new_transactions = new transactions({ username, amount, type });
        new_transactions.save()
            .then(data => res.json({ data: { username: data.username, amount: data.amount , type: data.type, date: data.date }}))
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
                return res.status(401).json({ error:  " adminAuth: " + adminAuth.message }) 
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
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
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
                        return res.status(401).json({ error: " adminAuth: " + adminAuth.message }) 
            
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
                    let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
                res.json(data);
                }).catch(error => { throw (error) })
            } catch (error) {
                if(error.message == "the user does not exist") res.status(401).json({ error: error.message })
                else res.status(400).json({ error: error.message })
            }
        }  else {   //user
            try{
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })

            if(!userAuth.authorized){
                return res.status(401).json({ error: " user: " + userAuth.message }) 
            }
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
                let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
                res.json(data);
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
        const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })

        if(!userAuth.authorized)
        {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.authorized)
                return res.status(401).json({ error: "userAuth: " + userAuth.message + ", adminAuth: " + adminAuth.message }) 
        }
      
        //Search requested user
        const username = req.params.username;
        const matchedUserid = await User.findOne({username: username });
        if(!matchedUserid) {
            return res.status(401).json({ error :"the user does not exist" });
        }
        //Search requested category
        const category = req.params.category;
        const matchedCategory = await categories.findOne({ category: category });
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
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
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
        const group = req.params.name;
        const matchedGroup = await Group.findOne({group: group });
        if (!matchedGroup)
          return res.status(401).json({ message: "The group doesn't exist" })

        const groupAuth = verifyAuth(req, res, { authType: "Group", members: matchedGroup.members })

        if(!groupAuth.authorized)
        {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.authorized)
                return res.status(401).json({ error: "groupAuth: " + groupAuth.message + ", adminAuth: " + adminAuth.message }) 
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
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })

        
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
        const group = req.params.name;
        const matchedGroup = await Group.findOne({group: group });
        if (!matchedGroup)
          return res.status(401).json({ message: "The group doesn't exist" })

        const groupAuth = verifyAuth(req, res, { authType: "Group", members: matchedGroup.members })

        if(!groupAuth.authorized)
        {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.authorized)
                return res.status(401).json({ error: "groupAuth: " + groupAuth.message + ", adminAuth: " + adminAuth.message }) 
        }

        const usersById = matchedGroup.members.map((member) => member.user);
        const usersByUsername  = await User.find({_id: {$in: usersById}},{username: 1, _id: 0}); 
        const usernames = usersByUsername.map(user => user.username);
        
        //Search requested category
        const type = req.params.category;
        const matchedCategory = await categories.findOne({type: type});
        if(!matchedCategory) {
            return res.status(401).json({ error: "the category does not exist" });
        }

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
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })

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
 */
export const deleteTransaction = async (req, res) => {
    try {
        const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })

        if(!userAuth.authorized)
        {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (!adminAuth.authorized)
                return res.status(401).json({ error: "userAuth: " + userAuth.message + ", adminAuth: " + adminAuth.message }) 
        }

        let data = await transactions.deleteOne({ _id: req.body._id });
        return res.json({ data: { message: "deleted" }});
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
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })

        if(!adminAuth.authorized)
            return res.status(401).json({ error: adminAuth.message }) 
        
        const matchingDocuments = await transactions.find({ _id: { $in: req.body.array_id } });
        // Check if all input IDs have corresponding transactions
        console.log(matchingDocuments.length);
        if (matchingDocuments.length !== req.body.array_id.length) {
            return res.status(401).json({ error: 'At least one ID does not have a corresponding transaction.' });
        }
        const result = await transactions.deleteMany({_id: { $in: req.body.array_id}}); 
        
        return res.json({ data: { message: "deleted" }});
    } catch (error) {
        if (error.message === 'At least one ID does not have a corresponding transaction.') {
            res.status(401).json({ error: error.message });
          } else res.status(400).json({ error: error.message })
    }
}
