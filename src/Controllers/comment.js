const User = require('../Models/user');
const Post = require('../Models/post');
const Comment = require('../Models/comment');
const AppErr = require('../Helpers/utils/appErr');


/**
 * POST: /:id
 * Create
 */
const createComment = async (req, res, next) => {
    const { description } = req.body;
    try{
        //Find the post
        const findPost = await Post.findById(req.params.id);
        
        //Create
        const comment = await Comment.create({
            post:findPost._id,
            user:req.userAuth,
            description
        });
        //push the comment to post
        findPost.comments.push(comment._id);
        //Find the user
        const user = await User.findById(req.userAuth);
        //Push to user
        user.comments.push(comment._id);

        
        //Disable validation
        await findPost.save({ validateBeforeSave: false });
        await user.save({ validateBeforeSave: false });

         //save
        res.json({
            status: "success",
            data: comment,
        });         
    }catch(error){
      next(AppErr(error.message));
    }
}

/**
 * PUT /:id  
 * edite
 */
const updateComment = async (req, res, next) => {
    const { description } = req.body;
    try{
        //find the Comment
        const comment = await Comment.findById(req.params.id);

        //check if the Comment belongs to the user
        if (comment.user.toString() !== req.userAuth.toString()) {
            return next(AppErr("You are not allowed to update this comment", 403));
        }

        const editComment = await Comment.findByIdAndUpdate(
            req.params.id,{
                description
            },{ new: true, runValidators: true }
        );

        res.json({
            status: "success",
            data: editComment,
        });
    }catch(error){
      next(AppErr(error.message));
    }
}

/**
 * DELETE /:id 
 * 
 */
const deleteComment = async (req, res, next) => {
    const {title} = req.body;
    try{
        //find the Comment
        const comment = await Comment.findById(req.params.id);
        
        //check if the Comment belongs to the user
        if (comment.user.toString() !== req.userAuth.toString()) {
            return next(AppErr("You are not allowed to update this comment", 403));
        }

        await Comment.findByIdAndDelete(req.params.id);
        
        res.json({
            status: "success",
            data: "Comment has been deleted successfully",
        });
    }catch(error){
      next(AppErr(error.message));
    }
}

module.exports = {
    createComment,
    updateComment,
    deleteComment
}