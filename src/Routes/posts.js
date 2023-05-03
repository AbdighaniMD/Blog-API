const express = require('express');
const multer = require("multer");
const {
    createPost,
    fetchPosts,
    toggleLikesPost,
    toggleDisLikesPost,
    postDetails,
    updatePost,
    deletePost,
  } = require('../Controllers/posts');
const isLogin = require('../Helpers/Midddlewares/isLogin');
const storage = require("../Config/cloudinary");

//instance of multer/express
const upload = multer({ storage });
const router = express.Router();

//POST/api/v1/posts
router.route("/")
    .post(
        isLogin,
        upload.single('Post_image_blog'),
        createPost,
    );

//GET/api/v1/posts
router.route("/").get(isLogin, fetchPosts);

//GET/api/v1/posts/:id
router.route("/:id").get(isLogin, postDetails);

//GET/api/v1/posts/likes/:id
router.route("/posts-likes/:id").get(isLogin, toggleLikesPost);

//GET/api/v1/posts/dislikes/:id
router.route("/posts-dislikes/:id").get(isLogin, toggleDisLikesPost);

//PUT/api/v1/posts/:id
router.route("/:id")
    .put(
        isLogin,
        upload.single('Post_image_blog'),
        updatePost,
    );


//DELETE/api/v1/posts/:id
router.route("/:id").delete(isLogin, deletePost);

module.exports = router
