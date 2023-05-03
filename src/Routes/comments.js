const express = require('express');
const {
    createComment,
    updateComment,
    deleteComment
} = require('../Controllers/comment');
const isLogin = require('../Helpers/Midddlewares/isLogin');

const router = express.Router();

//POST/api/v1/comments
router.route('/:id').post(isLogin, createComment);

//DELETE/api/v1/comments/:id
router.route('/:id').delete(isLogin, deleteComment);

//PUT/api/v1/comments/:id
router.route('/:id').put(isLogin, updateComment);

module.exports = router
