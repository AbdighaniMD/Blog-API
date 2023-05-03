const bcrypt = require('bcryptjs');

const User = require('../Models/user');
const Post = require('../Models/post');
const Category = require('../Models/category');
const Comment = require('../Models/comment');
const AppErr = require('../Helpers/utils/appErr');
const generateToken = require('../Helpers/utils/generateToken');
const getTokenFromHeader = require('../Helpers/utils/getTokenFromHeader');


/**
 * POST:  /register
 * Register
 */
const userRegister = async (req, res, next) =>{
    const { firstname, lastname, email, password } = req.body;
    try {
      //check if email exist 
      const userFound = await User.findOne({email});
      if(userFound){
        return next(AppErr("User Already Exist", 409));
      }

      //Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      //Creating the user
      const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      });

      res.json({
        status: "success",
        data: user,
      });
      
    }catch(error){
        next(AppErr(error.message));
    }
}

/**
 * POST:  /login
 * Login
 */
const userLogin = async (req, res, next) =>{
  const { email, password } = req.body;
  try {
    //Check if email exist
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return next(AppErr("Invalid login credentials"));
    }
    //verify password
    const isPasswordMatched = await bcrypt.compare(
      password,
      userFound.password
    );
    
    if (!isPasswordMatched) {
      return next(AppErr("Invalid login credentials"));
    }

    res.json({
      status: "success",
      data: {
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      }
    });
  } catch (error) {
      next(AppErr(error.message));
    }
 }

 /**
 * POST: /:id
 * Profile Photo Upload
 */
const profilePhotoUpload = async (req, res, next) => {
  try{
    //Find the user to be updated
    const userToUpdate = await User.findById(req.userAuth);

    //check if user exist
    if (!userToUpdate) {
      return next(AppErr("User not found", 403));
    }

    //Check if user is blocked
    if (userToUpdate.isBlocked) {
      return next(AppErr("Action not allowed, your account is blocked", 403));
    }

    //Check if a user is updating their photo
    if (req.file) {
      //Update profile photo
      await User.findByIdAndUpdate(
        req.userAuth,
        {$set: {
            profilePhoto: req.file.path,
          },
        },{new: true}
      );
      res.json({
        status: "success",
        data: "You have successfully updated your profile photo",
      });
    }
  }catch(error){
    next(AppErr(error.message, 500))
  }
}

/**
 * GET:  /profile/:id
 * 
 */
  const userProfile = async (req, res, next) => {
    try{
      //get token from header
      //const token = getTokenFromHeader(req)
      //console.log(token)

      const user = await User.findById(req.userAuth)
      res.json({
        status:"Success",
        data:user
      });

    }catch(error){
      next(AppErr(error.message));
    }
  };

 /**
 * GET: /profile-viewers/:id
 * who view my profile
 */
 const whoViewedMyProfile = async (req, res, next) => {
  try{
    //Find the original user
    const user = await User.findById(req.params.id);

    //Find the user who is trying to viewe the original user
    const userWhoViewed = await User.findById(req.userAuth);

    //Check if original and viewed and who are found
    if(user && userWhoViewed){
      //check if userWhoViewed is already in the user view Array
      const isUserAlreadyViewed = user.viewers.find(
        viewer => viewer.toString() === userWhoViewed._id.toJSON()
        );
        if(isUserAlreadyViewed){
          return next(AppErr("You already viewed this profile"));
        }
        else{
          //Push the userWhoViewed to the user's views array
          user.viewers.push(userWhoViewed._id);
          //save the user
          await user.save();
          res.json({
            status:"Success",
            data: "You have successfully viewed this profile",
          });
        }
    }  
  }catch(error){
    next(AppErr(error.message));
  }
 };

/**
 * GET: following/:id
 * 
 */
const userFollowing = async (req, res, next) => {
  try{
    //Find the user to follow
    const userToFollow = await User.findById(req.params.id);

    //Find the user who is following
    const userWhoFollowed = await User.findById(req.userAuth);

    //check if user and userWhoFollowed are 
    if(userToFollow && userWhoFollowed){
      //Check if userWhoFollowed is already in the user's followers array
      const isUserAlreadyFollowed = userToFollow.followers.find(
        followers => followers.toString() === userWhoFollowed._id.toString()
      );
      //console.log(isUserAlreadyFollowed)
      if(isUserAlreadyFollowed){
        return next(AppErr("You already followed this user"));
      } else{
        //Push userWhoFollowed nto the user's followers array
        userToFollow.followers.push(userWhoFollowed._id);
        //push userToFollow to the userWhoFollowed's following array
        userWhoFollowed.following.push(userToFollow._id);
        //save
        await userWhoFollowed.save();
        await userToFollow.save();

        res.json({
          status: "success",
          data: "You have successfully followed this user",
        });
      }
    }
  }catch(error){
    next(AppErr(error.message));
  }
}

/**
 * GET: unfollow/:id
 * 
 */
const userUnFollow = async (req, res, next) => {
  try{
    //Find the user to unFollow
    const userToBeUnfollowed = await User.findById(req.params.id);

    //Find the user who is unfollowing
    const userWhoUnFollowed = await User.findById(req.userAuth);

    //Check if user and userWhoUnFollowed are found
    if (userToBeUnfollowed && userWhoUnFollowed) {
      //Check if userWhoUnfollowed is already in the user's followers array
      const isUserAlreadyFollowed = userToBeUnfollowed.followers.find(
        follower => follower.toString() === userWhoUnFollowed._id.toString()
      );
      if(!isUserAlreadyFollowed){
        return next(AppErr("You have not followed this user"));
      } else{
        //Remove userWhoUnFollowed from the user's followers array
        userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(
          follower => follower.toString() !== userWhoUnFollowed._id.toString()
        );
        //save the user
        await userToBeUnfollowed.save();

        //Remove userToBeInfollowed from the userWhoUnfollowed's following array
        userWhoUnFollowed.following = userWhoUnFollowed.following.filter(
          following => following.toString() !== userToBeUnfollowed._id.toString()
        );
        //save the user
        await userWhoUnFollowed.save();

        res.json({
          status: "success",
          data: "You have successfully unfollowed this user",
        });
      }
    }
  }catch(error){
    next(AppErr(error.message));
  }
}

/**
 * GET:  /block/:id
 * 
 */
const blockUser = async (req, res, next) => {
  try{
    // Find the user to be blocked 
    const userToBeBlocked = await User.findById(req.params.id);

    // Find who is blocking a user
    const userWhoBlocked = await User.findById(req.userAuth);

    // Check if userToBeBlocked and userWhoBlocked are found
    if (userToBeBlocked && userWhoBlocked) {
      //Check if userWhoUnfollowed is already in the user's blocked array
      const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
        blocked => blocked.toString() === userToBeBlocked._id.toString()
      );
      if (isUserAlreadyBlocked) {
        return next(AppErr("You already blocked this user"));
      }

      // then Push userToBeBlocked to the user whoBlocked's blocked arr
      userWhoBlocked.blocked.push(userToBeBlocked._id);

      //save
      await userWhoBlocked.save();
      res.json({
        status: "success",
        data: "You have successfully blocked this user",
      });
    }
  }catch(error){
    next(AppErr(error.message));
  }
}

/**
 * GET: unblock/:id
 * 
 */
const unblockUser = async (req, res, next) => {
  try{
    // Find the user to be blocked 
    const userToBeUnBlocked = await User.findById(req.params.id);

    // Find who is blocking a user
    const userWhoUnBlocked = await User.findById(req.userAuth);

    //check if userToBeUnBlocked and userWhoUnblocked are found
    if(userToBeUnBlocked && userWhoUnBlocked){
      //Check if userToBeUnBlocked is already in the arrays's of userWhoUnBlocked
      const isUserAlreadyBlocked = userWhoUnBlocked.blocked.find(
        blocked => blocked.toString() === userToBeUnBlocked._id.toString()
      );
      if (!isUserAlreadyBlocked) {
        return next(AppErr("You have not blocked this user"));
      }

      //Remove the userToBeUnblocked from the main user
      userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(
        blocked => blocked.toString() !== userToBeUnBlocked._id.toString()
      );

      //save
      await userWhoUnBlocked.save();
      res.json({
        status: "success",
        data: "You have successfully unblocked this user",
      });
    }
  }catch(error){
    next(AppErr(error.message));
  }
}

/**
 * PUT: admin-block/:id
 * 
 */
const adminBlockUser = async (req, res, next) => {
  try{
    //Find the user to be blocked
    const userToBeBlocked = await User.findById(req.params.id);

    //check if user found
    if(!userToBeBlocked){
      return next(AppErr("User has not been found"))
    }

    //Change the isBlocked to true
    userToBeBlocked.isBlocked = true;

    //4.save
    await userToBeBlocked.save();
    res.json({
      status: "success",
      data: "You have successfully blocked this user",
    });
  }catch(error){
    next(AppErr(error.message));
  }
}

/**
 * PUT: /admin-unblock/:id
 *
 */
const adminUnblockUser = async (req, res, next) => {
  try{
    // Find the user to be blocked 
    const userToBeUnblocked = await User.findById(req.params.id);

    // Check if user found
    if(!userToBeUnblocked){
      return next(AppErr("User has not been fouond"));
    }

    //Change the isBlocked to false
    userToBeUnblocked.isBlocked = false;

    //save
    await userToBeUnblocked.save();
    res.json({
      status: "success",
      data: "You have successfully unblocked this user",
    });
  }catch(error){
    next(AppErr(error.message));
  }
}

/**
 * PUT: /
 * 
 */
const updateUser = async (req, res, next) => {
  const { email, lastname, firstname } = req.body;
  try{
    //Check if email is not taken
    if(email){
      const emailToken = await User.findOne({email});
      if(emailToken){
        return next(AppErr("Email is taken", 400));
      }
    } else {
      return next(AppErr("Please provide email field"));
    }
    //Edit the user 
    const editUser = await User.findByIdAndUpdate(
      req.userAuth,{
        lastname,
        firstname,
        email,
      },{new:true}
      );
    res.json({
      status: "success",
      data: editUser,
    });
  }catch(error){
    next(AppErr(error.message));
  }
}

/**
 * PUT: /update-password
 * 
 */
const updatePassword = async (req, res, next) => {
  const { password } = req.body;
  try{
   //Check if user is updating the password
    if(!password){
      return next(AppErr("Please provide password field"));
    }
    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Editing the user Password
    await User.findByIdAndUpdate(
      req.userAuth,
      { password: hashedPassword },
      { new: true, runValidators: true }
    );
    res.json({
      status: "success",
      data: "Password has been changed successfully",
    });
  }catch(error){
    next(AppErr(error.message));
  }
}

/**
 * DELETE:/delete-account
 * 
 */
const deleteUserAccount = async (req, res, next) => {
  try{
    //Find the user to be deleted
    const userToDeleted = await User.findById(req.userAuth);
    //Find all posts to be deleted
    await Post.deleteMany({ user: req.userAuth });
    // Find and Delete all comments of the user
    await Comment.deleteMany({ user: req.userAuth });
    //Delete all category of the user
    await Category.deleteMany({ user: req.userAuth });
    //Now delete the user
    await userToDeleted.delete();
    //send response
    return res.json({
      status: "success",
      data: "Your account has been deleted successfully",
    });
  }catch(error){
    next(AppErr(error.message));
  }
}

/**
 * GET: /
 *  All
 */
const getAllusers = async (req, res, next) => {
  try{
    const users = await User.find();
    res.json({
      status: "success",
      data: users,
    });
  }catch(error){
    next(AppErr(error.message));
  }
}

module.exports ={
  userRegister,
  userLogin,
  profilePhotoUpload,
  userProfile,
  whoViewedMyProfile,
  userFollowing,
  userUnFollow,
  blockUser,
  unblockUser,
  adminBlockUser,
  adminUnblockUser,
  updateUser,
  updatePassword,
  deleteUserAccount,
  getAllusers
}