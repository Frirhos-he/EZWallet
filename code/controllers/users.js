
import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth, checkMissingOrEmptyParams } from "./utils.js";
import jwt from 'jsonwebtoken'


/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
    try {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" })

      if(!adminAuth.flag)
          return res.status(401).json({ error: adminAuth.cause }) 

      const users = await User.find();
      const userObject = users.map(v => Object.assign({}, { username: v.username, email: v.email, role: v.role }))
      
      res.locals.refreshedTokenMessage = ""

      res.status(200).json({ data: userObject , refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 401 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
    try {
      const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })

      if(!userAuth.flag)
      {
          const adminAuth = verifyAuth(req, res, { authType: "Admin" })
          if (!adminAuth.flag)
              return res.status(401).json({ error:  adminAuth.cause }) 
      }

      const user = await User.findOne({ username: req.params.username })
        if (!user) return res.status(400).json({ error: "User not found" })
      
      const userObject = Object.assign({}, { username: user.username, email: user.email, role: user.role })

      res.locals.refreshedTokenMessage = ""

      res.status(200).json({ data: userObject , refreshedTokenMessage: res.locals.refreshedTokenMessage })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Create a new group
  - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
    of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
    (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
    +does not appear in the system)
  - Optional behavior:
    - error 401 is returned if there is already an existing group with the same name
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
    try {
        const simpleAuth = verifyAuth(req, res, { authType : "Simple" })
        if(!simpleAuth.flag) return res.status(401).json({ error: simpleAuth.cause })

        const { name, memberEmails } = req.body

        if(name == null || name == undefined)
          return res.status(400).json({ error: 'Missing values'});

        if(name.trim() === "")
          return res.status(400).json({ error: 'Empty string values'});

        if(memberEmails == null || memberEmails == undefined)
          return res.status(400).json({ error: 'Missing values'}); 

        let emailsVect = memberEmails;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to check email format
        
        // Iterate over each email in the vector
        for (const email of emailsVect) {
          // Check if the email is empty
          if (email.trim() === "") {
            return res.status(400).json({ error: "Empty email" });
          }
        
          // Check if the email is in a valid format
          if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
          }
        }
        


        // Check if the group already exist
        const group = await Group.findOne({ name: name });
        if (group)
          return res.status(400).json({ error: 'There is already an existing gruop with the same name' })

        // Retrieve the list of users with their id from memberEmails
        let memberUsers = await User.find({ email: { $in: emailsVect } })
        
        //must add the user that required to create the group
        const cookie = req.cookies
        const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);
        const currentUserEmail = decodedRefreshToken.email;
        

        let alreadyInGroup = await Group.find({}, {members: 1, _id: 0})
        
        alreadyInGroup = alreadyInGroup.map(v =>  v.members)
        
        alreadyInGroup = [...new Set(alreadyInGroup.flat())];
        
        alreadyInGroup = alreadyInGroup.map(v => Object.assign({}, { email: v.email, user: v.user }))
        
        // Check if the user who called is already in a group
        const userWhoCalled = await User.findOne({ email: currentUserEmail })
        let alreadyInAGroupUserWhoCalled = [...alreadyInGroup];
        
        alreadyInAGroupUserWhoCalled = alreadyInAGroupUserWhoCalled.filter(m => m.email == userWhoCalled.email)
        
        if (alreadyInAGroupUserWhoCalled.length > 0) return res.status(400).json({ error: 'User who called the Api is in a group' })
        
        alreadyInGroup = alreadyInGroup.filter(m => emailsVect.includes(m.email))
        
        let foundInGroup = alreadyInGroup.filter(m => m.email == currentUserEmail);
        
        if(foundInGroup.length != 0)
             return  res.status(400).json({ error: 'User who called the Api is in a group'});

        memberUsers = memberUsers.map(v => Object.assign({}, { email: v.email, user: v._id })) 
        
        // Retrieve the list of all users
        let allUsers = await User.find({})
        allUsers = allUsers.map(v => Object.assign({}, { email: v.email, user: v._id }))
        
        // Select not existing members
        const membersNotFound = emailsVect.filter(e => !allUsers.map(u => u.email).includes(e))
        // Select members of the group
        const members = memberUsers.filter(m => allUsers.map(u => u.email).includes(m.email) && !alreadyInGroup.map(u => u.email).includes(m.email) && !membersNotFound.includes(m.email))
        
        if (members.length == 0) 
          return res.status(400).json({ error: 'All the members have emails that don\'t exist or are already inside another group' })
        
        if(!emailsVect.includes(currentUserEmail)){
          
          let memberUser = await User.findOne({ email: currentUserEmail });  
          
          memberUser = Object.assign({}, { email: memberUser.email, user: memberUser._id })

          members.push(memberUser);
        }
        
        let updatedMembers = members.map(m => Object.assign({}, {email: m.email}))
        let updatedAlreadyInGroup = alreadyInGroup.map(m => Object.assign({}, {email: m.email}))

        res.locals.refreshedTokenMessage = ""

        // Creating a new group
        const newGroup = new Group({ name, members })
        newGroup.save()
          .then(() => res.status(200).json({ 
            data: {
              group: {name: name, members: updatedMembers}, 
              alreadyInGroup: updatedAlreadyInGroup, 
              membersNotFound: membersNotFound
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage
          }))
          .catch(err => { throw err })

    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
    try {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" })
      if (!adminAuth.flag)
          return res.status(401).json({ error: adminAuth.cause }) 

          res.locals.refreshedTokenMessage = ""

      let groups = await Group.find({})
      groups = groups.map(v => {
        return {
          name: v.name,
          members: v.members.map(member => {
            return Object.assign({}, {email: member.email});
          })
        };
      });
      res.status(200).json({ data: groups , refreshedTokenMessage: res.locals.refreshedTokenMessage})

    } catch (err) {
        res.status(400).json({ error: err.message})
    }
}

/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
    try {
      const groupName = req.params.name;
      let message;
      if((message = checkMissingOrEmptyParams([groupName])))
          return res.status(400).json({ error: message });
        
      let group = await Group.findOne({ name: groupName });
      if (!group)
        return res.status(400).json({ error: "The group doesn't exist" })

      const groupAuth = verifyAuth(req, res, { authType: "Group", members: group.members })

      if(!groupAuth.flag)
      {
          const adminAuth = verifyAuth(req, res, { authType: "Admin" })
          if (!adminAuth.flag)
              return res.status(401).json({ error: groupAuth.cause }) 
      }

      let updatedMembers = group.members.map(m => Object.assign({}, {email:m.email}))

      res.locals.refreshedTokenMessage = ""

      group = {
        name: group.name,
        members: updatedMembers
      };
      res.status(200).json({ data: {group: group} , refreshedTokenMessage: res.locals.refreshedTokenMessage })      
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const addToGroup = async (req, res) => {
    try {

      const groupName = req.params.name;
      const startIndexAdmin = req.url.indexOf("groups/");
      const endIndexAdmin = req.url.indexOf("/insert");

      //startIndex < endIndex ensure that startIndex happens before endIndex
      //startIndex < endIndex ensure that startIndex happens before endIndex
      const group = await Group.findOne({ name: groupName });
      if (!group)
          return res.status(400).json({ error: "The group doesn't exist" })

      if (startIndexAdmin >= 0 && endIndexAdmin >= 0 && startIndexAdmin < endIndexAdmin) { //admin 
          const adminAuth = verifyAuth(req, res, { authType: "Admin" })
          if (!adminAuth.flag)
              return res.status(401).json({ error: adminAuth.cause }) 
      }
      else {   //user
          const groupAuth = verifyAuth(req, res, { authType: "Group", members: group.members })
          if(!groupAuth.flag)
              return res.status(401).json({ error: groupAuth.cause }) 

      }

      const memberEmails = req.body.emails
      
      if(memberEmails == null || memberEmails == undefined)
            return res.status(400).json({ error: "member emails not defined"});     

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to check email format

      // Iterate over each email in the vector
      for (const email of memberEmails) {
        // Check if the email is empty
        if (email.trim() === "") {
            return res.status(400).json({ error: "Empty email" });
        }
        
        // Check if the email is in a valid format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
      }

      // Retrieve the list of users with their id from memberEmails
      let memberUsers = await User.find({ email: { $in: memberEmails } })
      memberUsers = memberUsers.map(v => Object.assign({}, { email: v.email })) 

      // Retrieve the list of all users
      let allUsers = await User.find({})
      allUsers = allUsers.map(v => Object.assign({}, { email: v.email}))

      // Select not existing members
      const membersNotFound = memberEmails.filter(e => !allUsers.map(u => u.email).includes(e));
      const membersNotFoundObjects = membersNotFound.map(email => ({ email }));
      
      // Select already in a group members
      let alreadyInGroup = await Group.find({}, {members: 1, _id: 0})
      alreadyInGroup = alreadyInGroup.map(v =>  v.members) 
      alreadyInGroup = [...new Set(alreadyInGroup.flat())];
      alreadyInGroup = alreadyInGroup.map(v =>  Object.assign({}, { email: v.email})) 
      alreadyInGroup = alreadyInGroup.filter(m => memberEmails.includes(m.email))
  
      // Select members to add to the group
      const newMembers = memberUsers.filter(m => allUsers.map(u => u.email).includes(m.email) && !alreadyInGroup.map(u => u.email).includes(m.email))

      if (newMembers.length == 0) 
        return res.status(400).json({ error: 'All the members have emails that don\'t exist or are already inside another group' })

      // Add to the group the new users
      let updatedGroup = await Group.findOneAndUpdate(
        { name: groupName },
        { $push: { members: { $each: newMembers } } },
        { new: true }
      )

      updatedGroup = Object.assign({}, { name: updatedGroup.name, members: updatedGroup.members.map(m => Object.assign({}, {email:m.email})) })

      res.locals.refreshedTokenMessage = ""

      return res.status(200).json({ 
        data: {
          group: {
            name: groupName,
            members:updatedGroup.members
          }, 
          alreadyInGroup: alreadyInGroup, 
          membersNotFound: membersNotFoundObjects
        }, 
        refreshedTokenMessage: res.locals.refreshedTokenMessage 
      })
  

    } catch (err) {
      return res.status(400).json({ error: err.message })
    }
}

export const removeFromGroup = async (req, res) => {
    try {
      const groupName = req.params.name;
      let memberEmails = req.body.emails;

      let message;
      if((message = checkMissingOrEmptyParams([groupName])))
            return res.status(400).json({ error: message });
      if(memberEmails == null || memberEmails == undefined  )
          return res.status(400).json({ error: "member emails not defined"});     
          
      const group = await Group.findOne({ name: groupName });
      if (!group)
          return res.status(400).json({ error: "The group doesn't exist" })

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to check email format

      // Iterate over each email in the vector
      for (const email of memberEmails) {
        // Check if the email is empty
        if (email.trim() === "") {
            return res.status(400).json({ error: "Empty email" });
        }
        
        // Check if the email is in a valid format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
      }

      const startIndexAdmin = req.url.indexOf("groups/");
      const endIndexAdmin = req.url.indexOf("/pull");
      //startIndex < endIndex ensure that startIndex happens before endIndex

      if (startIndexAdmin >= 0 && endIndexAdmin >= 0 && startIndexAdmin < endIndexAdmin) { //admin 
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (!adminAuth.flag)
            return res.status(401).json({ error:" adminAuth: " + adminAuth.cause }) 
      } else {    //user of the group    
        const groupAuth = verifyAuth(req, res, { authType: "Group", members: group.members })
        if(!groupAuth.flag)
            return res.status(401).json({ error: "groupAuth: " + groupAuth.cause })       
      }
  
      // Retrieve the list of users with their id from memberEmails
      let memberUsers = await User.find({ email: { $in: memberEmails } });
      memberUsers = memberUsers.map((v) =>
        Object.assign({}, { email: v.email, user: v._id })
      );
  
      // Retrieve the list of all users
      let allUsers = await User.find({});
      allUsers = allUsers.map((v) =>
        Object.assign({}, { email: v.email, user: v._id })
      );
  
      // Select not existing members
      const membersNotFound = memberEmails.filter(
        (e) => !allUsers.map((u) => u.email).includes(e)
      );
  
      // Select members not in the group
      const notInGroup = memberUsers.filter(
        (m) => !group.members.map((u) => u.email).includes(m.email)
      );
       
      if ((notInGroup.length + membersNotFound.length) >= memberEmails.length)
        return res
          .status(400)
          .json({ error: "All the members either don't exist or are not in the group" });

      let membersInGroup = await Group.findOne({name: groupName}, {members: 1, _id: 0})
      let deleteMembers = membersInGroup.members.map(u => u.email);
      deleteMembers = deleteMembers.filter(m => memberEmails.includes(m))

      if(deleteMembers.length === membersInGroup.members.length ){
        if(deleteMembers.length == 1){
          return res.status(400).json({ error: 'if the group only has one member ' })
        }
        const firstUser = deleteMembers.shift();        // to delete the first member of the group
        memberEmails = memberEmails.filter(x=> x != firstUser)
      }


      // Remove the specified users from the group
      let updatedGroup = await Group.findOneAndUpdate(
        { name: groupName },
        { $pull: { members: { email: { $in: memberEmails } } } },
        { new: true }
      );
      updatedGroup = Object.assign(
        {},
        { name: updatedGroup.name, members: updatedGroup.members }
      );
  
      updatedGroup.members = updatedGroup.members.map(m => Object.assign({}, {email: m.email}))

      let updatedNotInGroup = notInGroup.map(m => Object.assign({}, {email:m.email}))
      let updatedMembersNotFound = membersNotFound.map(m => Object.assign({}, {email: m}))

      res.locals.refreshedTokenMessage = ""

      res.status(200).json({
        data: {
          group: updatedGroup,
          notInGroup: updatedNotInGroup,
          membersNotFound: updatedMembersNotFound,
        }, 
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    } catch (err) {
      res.status(400).json({error: err.message});
    }
}

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 401 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {

    const adminAuth = verifyAuth(req, res, { authType: "Admin" })

    if(!adminAuth.flag)
        return res.status(401).json({ error: adminAuth.cause }) 

    const userEmail = req.body.email;

     //Check for missing or empty string parameter
     let message;
     if((message = checkMissingOrEmptyParams([userEmail])))
         return res.status(400).json({ error: message });


     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to check email format
      // Check if the email is in a valid format
      if (!emailRegex.test(userEmail)) {
            return res.status(400).json({ error: "Invalid email format" });
      }

    // Check if the user exists
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(400).json({ error: "The user doesn't exist" });
    }
    if(user.role == "Admin"){
      return res.status(400).json({ error: "The user is an admin" });

    }

    // Check if inside a group

    const groups = await Group.find({});

    const groupsWithOneMember = groups.filter(group => group.members.length === 1);

    const userInGroupWithOneMember = groupsWithOneMember.some(group => {
      const memberEmail = group.members[0].email;
      return memberEmail === userEmail;
    });

    /*
    //if at least one found then we cannot delete the user
    if(userInGroupWithOneMember){
      return res.status(400).json({ error: "user is the last of a group, cannot delete" }) 
    }
    */
    // Count the number of transactions to be deleted
    const transactionCount = await transactions.countDocuments({ username: user.username });

    // Delete the user's transactions
    await transactions.deleteMany({ username: user.username });

    // Delete the user
    await User.deleteOne({ email: userEmail });


    // Find the group name that matches the email
      const groupName = groupsWithOneMember.find(group => group.members[0].email === userEmail)?.name;
      let deletedFromGroupFlag = false;
      let deletedFromGroup;
      if(userInGroupWithOneMember == true) {
              // Delete the user's transactions
              await Group.deleteOne({ name: groupName });
              deletedFromGroupFlag = true;                  
      }
      else {
            // Delete user from group
            deletedFromGroup = await Group.updateOne(
              { members: { $elemMatch: { email: userEmail } } },
              { $pull: { members: { email: userEmail } } }
            );
                }


    res.locals.refreshedTokenMessage = ""

    res.status(200).json({
      data: {
        deletedTransactions: transactionCount,
        deletedFromGroup: deletedFromGroup?.modifiedCount > 0 || deletedFromGroupFlag == true,
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
    const groupName = req.body.name;

    let message;
    if ((message = checkMissingOrEmptyParams([groupName])))
      return res.status(400).json({ error: message });

    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (!adminAuth.flag)
      return res.status(401).json({ error: adminAuth.cause });

    const group = await Group.findOne({ name: groupName });
    if (!group)
      return res.status(400).json({ error: "The group doesn't exist" });

    res.locals.refreshedTokenMessage = "";

    // Delete the group
    await Group.deleteOne({ name: groupName });
    res
      .status(200)
      .json({
        data: { message: "Group deleted successfully" },
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};