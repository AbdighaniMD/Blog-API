const express = require('express');
const {
    categoryDetails,
    createCategory,
    deleteCategory,
    updateCategory,
    fetchCategories,
  } = require('../Controllers/categories');
const isLogin = require('../Helpers/Midddlewares/isLogin');

const router = express.Router();

//POST/api/v1/categories
router.route('/').post(isLogin, createCategory);

//GET/api/v1/categories
router.route('/').get(fetchCategories);
//GET/api/v1/categories/:id
router.route('/:id').get(categoryDetails);

//PUT/api/v1/categories/:id
router.route('/:id').put(isLogin, updateCategory);

//DELETE/api/v1/categories/:id
router.route('/:id').delete(isLogin, deleteCategory);



module.exports = router
