import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error.message);
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
        const cookie = req.cookies
        if (!cookie.accessToken || !cookie.refreshToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        const username = req.params.username
        const user = await User.findOne({ refreshToken: cookie.refreshToken })
        if (!user) return res.status(401).json({ message: "User not found" })
        if (user.username !== username) return res.status(401).json({ message: "Unauthorized" })
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error.message)
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
        // TODO ADD AUTH  


        const { name, memberEmails } = req.body
        
        // Check if the group already exist
        const group = await Group.findOne({ name: name });
        if (group)
          return res.status(401).json({ message: 'There is already an existing gruop with the same name' })

        // Retrieve the list of users with their id from memberEmails
        let memberUsers = await User.find({ email: { $in: memberEmails } })
        memberUsers = memberUsers.map(v => Object.assign({}, { email: v.email, user: v._id })) 

        // Retrieve the list of all users
        let allUsers = await User.find({})
        allUsers = allUsers.map(v => Object.assign({}, { email: v.email, user: v._id }))

        // Select not existing members
        const membersNotFound = memberEmails.filter(e => !allUsers.map(u => u.email).includes(e))

        // Select already in a group members
        let alreadyInGroup = await Group.find({}, {members: 1, _id: 0})
        alreadyInGroup = alreadyInGroup.map(v =>  v.members) 
        alreadyInGroup = [...new Set(alreadyInGroup.flat())];
        alreadyInGroup = alreadyInGroup.filter(m => memberEmails.includes(m.email))

        // Select members of the group
        const members = memberUsers.filter(m => allUsers.map(u => u.email).includes(m.email) && !alreadyInGroup.map(u => u.email).includes(m.email))

        if (members.length == 0) 
          return res.status(401).json({ message: 'All the members have emails taht don\'t exist or are already inside anothre group' })

        // Creating a new group
        const newGroup = new Group({ name, members })
        newGroup.save()
          .then(() => res.status(200).json({group: {name: name, members: members}, alreadyInGroup: alreadyInGroup, membersNotFound: membersNotFound}))
          .catch(err => { throw err })

    } catch (err) {
        res.status(500).json(err.message)
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
      // TODO ONLY FOR ADMINS

      let groups = await Group.find({})
      groups = groups.map(v => Object.assign({}, { name: v.name, members: v.members }))

      res.status(200).json({groups})

    } catch (err) {
        res.status(500).json(err.message)
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
      // TODO ADD AUTH

      const groupName = req.params.name
      let group = await Group.findOne({name: groupName})

      if (!group)
        return res.status(401).json({ message: "The group doesn't exist" })

      group = Object.assign({}, { name: group.name, members: group.members })

      res.status(200).json({group})      
    } catch (err) {
        res.status(500).json(err.message)
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
      // TODO ADD AUTH

      const groupName = req.params.name
      let group = await Group.findOne({name: groupName})

      if (!group)
        return res.status(401).json({ message: "The group doesn't exist" })

      const memberEmails = req.body.members

      // Retrieve the list of users with their id from memberEmails
      let memberUsers = await User.find({ email: { $in: memberEmails } })
      memberUsers = memberUsers.map(v => Object.assign({}, { email: v.email, user: v._id })) 

      // Retrieve the list of all users
      let allUsers = await User.find({})
      allUsers = allUsers.map(v => Object.assign({}, { email: v.email, user: v._id }))

      // Select not existing members
      const membersNotFound = memberEmails.filter(e => !allUsers.map(u => u.email).includes(e))

      // Select already in a group members
      let alreadyInGroup = await Group.find({}, {members: 1, _id: 0})
      alreadyInGroup = alreadyInGroup.map(v =>  v.members) 
      alreadyInGroup = [...new Set(alreadyInGroup.flat())];
      alreadyInGroup = alreadyInGroup.filter(m => memberEmails.includes(m.email))

      // Select members to add to the group
      const newMembers = memberUsers.filter(m => allUsers.map(u => u.email).includes(m.email) && !alreadyInGroup.map(u => u.email).includes(m.email))
      if (newMembers.length == 0) 
        return res.status(401).json({ message: 'All the members have emails that don\'t exist or are already inside anothre group' })

      // Add to the group the new users
      let updatedGroup = await Group.findOneAndUpdate(
        { name: groupName },
        { $push: { members: { $each: newMembers } } },
        { new: true }
      )

      updatedGroup = Object.assign({}, { name: updatedGroup.name, members: updatedGroup.members })

      res.status(200).json({group: {name: groupName, members:updatedGroup.members}, alreadyInGroup: alreadyInGroup, membersNotFound: membersNotFound})

    } catch (err) {
        res.status(500).json(err.message)
    }
}

/**
 * Remove members from a group
  - Response 'data' content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
  try {
    const cookie = req.cookies
    if (!cookie.accessToken) {
        return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }

    const groupName = req.params.name

    let group = await Group.findOne({name: groupName})

    if (!group)
      return res.status(401).json({ message: "The group doesn't exist" })

    const memberEmails = req.body.members

    // Retrieve the list of all users
    let allUsers = await User.find({})
    allUsers = allUsers.map(v => Object.assign({}, { email: v.email, user: v._id }))

    // Select not existing members
    const membersNotFound = memberEmails.filter(e => !allUsers.map(u => u.email).includes(e))

    // Select members already in the group that will be deleted
    let deleteMembers = await Group.findOne({name: groupName}, {members: 1, _id: 0})
    deleteMembers = deleteMembers.members.map(u => u.email);
    deleteMembers = deleteMembers.filter(m => memberEmails.includes(m))

    if (deleteMembers.length == 0) 
      return res.status(401).json({ message: 'All the members have emails that don\'t exist or are not in the group' })

    //Select emails on group
    let membersInGroup = await Group.findOne({name: groupName}, {members: 1, _id: 1})

    // Select the memberEmails email that are not in the group already
    let NotInGroup = memberEmails.filter(m => !membersInGroup.members.map(u => u.email).includes(m));
 
    membersInGroup.members = membersInGroup.members.filter(member => !deleteMembers.includes(member.email) );

    //Update modification on member array
    const updatedGroup = await membersInGroup.save();

    //Select the users left in the group
    let newMembersInGroup = await Group.findOne({name: groupName}, {members: 1, _id: 0})
        newMembersInGroup = newMembersInGroup.members.map(u => u.email);

    res.status(200).json({group: {name: groupName, members:newMembersInGroup}, NotInGroup: NotInGroup, membersNotFound: membersNotFound})

  } catch (err) {
      res.status(500).json(err.message)
  }
}

/*
export const removeFromGroup = async (req, res) => {
    try {
      // TODO ADD AUTH
  
      const groupName = req.params.name;
      let group = await Group.findOne({ name: groupName });
  
      if (!group)
        return res.status(401).json({ message: "The group doesn't exist" });
  
      const memberEmails = req.body.members;
  
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
        (m) =>
          !group.members.map((u) => u.email).includes(m.email) &&
          !membersNotFound.includes(m.email)
      );
  
      if (notInGroup.length + membersNotFound === memberEmails.length)
        return res
          .status(401)
          .json({ message: "All the members either don't exist or are not in the group" });
  
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
  
      res.status(200).json({
        group: { name: groupName, members: updatedGroup.members },
        notInGroup: notInGroup,
        membersNotFound: membersNotFound,
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
*/

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
    } catch (err) {
        res.status(500).json(err.message)
    }
}

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
    try {
    } catch (err) {
        res.status(500).json(err.message)
    }
}