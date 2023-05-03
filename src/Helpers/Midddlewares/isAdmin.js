const AppErr = require('../../Helpers/utils/appErr');
const getTokenFromHeader = require('../utils/getTokenFromHeader');
const verifyToken = require('../utils/verifyToken');
const User = require('../../Models/user');

const isAdmin = async (req, res, next) => {
    //get token from header
    const token = getTokenFromHeader(req);
    
    //verify the token
    const decodedUser = verifyToken(token);

    //save the user into req obj
    req.userAuth = decodedUser.id;

    const user = await User.findById(decodedUser.id)
    //Check if admin    
    if (user.isAdmin) {
        return next();
    } else {
        return next(AppErr("Access Denied, Admin Only", 403));
    }
}

module.exports = isAdmin;