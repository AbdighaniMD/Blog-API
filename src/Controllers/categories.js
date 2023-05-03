const Category = require('../Models/category');
const AppErr = require('../Helpers/utils/appErr');

/**
 * POST: /
 *  CREATE
 */
const createCategory = async (req, res, next) => {
    const {title} = req.body;
    try{
        //Check if user is updating the password
        if(!title){
            return next(AppErr("Please provide title field"));
        }
        //Creating the user
        const createCategory =  await Category.create({
            title,
            user: req.userAuth
        });
        res.json({
            status: "success",
            data: createCategory ,
        });
    }catch(error){
      next(AppErr(error.message));
    }
}

/**
 * GET: /:id
 *  
 */
const categoryDetails = async (req, res, next) => {
    try{
        const getAllCategories = await Category.findById(req.params.id);

        //Check For categories Found
        if(!getAllCategories){
            return next(AppErr(`No ${req.params.id} id has been Found`));
        }

        res.json({
            status: "success",
            data: getAllCategories ,
        });
    }catch(error){
        next(AppErr(error.message));
    }
}

/**
 * GET: /
 *  
 */
const fetchCategories = async (req, res, next) => {
    try{
        const getAllCategories = await Category.find({});
        //Check For categories Found
        if(!getAllCategories){
            return next(AppErr(`No categories has been Found`));
        }
        res.json({
            status: "success",
            data: getAllCategories,
        });
    }catch(error){
        next(AppErr(error.message));
    }
}

/**
 * PUT: /:id
 *  
 */
const updateCategory = async (req, res, next) => {
    const {title} = req.body;
    try{
        //Check if user is updating the password
        if(!title){
            return next(AppErr("Please provide title field"));
        }
        
        const editCategory = await Category.findByIdAndUpdate(
            req.params.id,{title},{new:true}
        );
        res.json({
            status: "success",
            data: editCategory,
        });
    }catch(error){
        next(AppErr(error.message));
    }
}

/**
 * Delete: /:id
 *  
 */
const deleteCategory = async (req, res, next) => {
    try{
      const CategoryToBeDeleted = await Category.findByIdAndDelete(req.params.id);
      //Check For categories Found
      if(!CategoryToBeDeleted){
            return next(AppErr(`No ${req.params.id} id has been Found`));
        }
        res.json({
            status: "success",
            data: "You have Seccessfully Deleted a Category" ,
        });
    }catch(error){
        next(AppErr(error.message));
    }
}

module.exports = {
    categoryDetails,
    createCategory,
    deleteCategory,
    updateCategory,
    fetchCategories,
}