const express = require('express');
const multer = require("multer");
const {
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
    getAllusers,
} = require ('../Controllers/user');
const isLogin = require('../Helpers/Midddlewares/isLogin');
const isAdmin = require('../Helpers/Midddlewares/isAdmin');
const storage = require('../Config/cloudinary');

//instance of multer/expressRouter
const upload = multer({ storage });
const router = express.Router();

//POST/api/v1/users/register
router.route('/register').post(userRegister);

//POST/api/v1/users/login
router.route('/login').post(userLogin);

//GET/api/v1/users/profile/:id
router.route('/profile/').get(isLogin, userProfile);

//GET/api/v1/users/profile-viewers/:id
router.route('/profile-viewer/:id').get(isLogin, whoViewedMyProfile);

//GET/api/v1/users/following/:id
router.route('/following/:id').get(isLogin, userFollowing);

//GET/api/v1/users/unfollow/:id
router.route('/unfollowing/:id').get(isLogin, userUnFollow);

//GET/api/v1/users/block/:id
router.route('/block/:id').get(isLogin, blockUser);

//GET/api/v1/users/unblock/:id
router.route('/unblock/:id').get(isLogin, unblockUser);

//GET/api/v1/users/admin-block/:id
router.route('/admin-block/:id').get(isLogin, isAdmin, adminBlockUser);

//GET/api/v1/users/admin-unblock/:id
router.route('/admin-unblock/:id').get(isLogin,isAdmin, adminUnblockUser);

//GET/api/v1/users/
router.route('/').get(isLogin, isAdmin,  getAllusers);

//PUT/api/v1/users/
router.route('/').put(isLogin, isAdmin, updateUser);

//PUT/api/v1/users/update-password
router.route('/update-password').put(isLogin, updatePassword);

//DELETE/api/v1/users/delete-account
router.route('/delete-account').delete(isLogin, deleteUserAccount);

//POST/api/v1/users/:id
router.route('/profile-photo-upload')
    .post(
        upload.single('profile'),
        isLogin,
        profilePhotoUpload
    );

module.exports = router
