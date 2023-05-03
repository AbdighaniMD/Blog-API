const User = require('../Models/user');
const Post = require('../Models/post');
const AppErr = require('../Helpers/utils/appErr');
const { post } = require('../Routes/posts');


/**
 * POST: /
 * 
 */
const createPost = async (req, res, next) => {
  const { title, description, category } = req.body;
    try{
      //Find the user 
      const author = await User.findById(req.userAuth);

      //Check if the user is blocked
      if(author.isblocked){
        return next(AppErr("Access denied, account blocked", 403));
      }

      //Create the post
      const postCreated = await Post.create({
        title,
        description,
        user: author._id,
        category,
        photo: req?.file?.path,
      });
      //Associate user to a post -Push the post into the user posts field
      author.posts.push(postCreated);

      //save
      await author.save();
      res.json({
        status: "success",
        data: postCreated,
      });

    }catch(error){
       next(AppErr(error.message));
    }
}

/**
 * GET:  /
 * 
 */
const fetchPosts = async (req, res, next) => {
    try{
      const getAllPost = await Post.find({}).populate('user').populate('category', 'title');
      //Check For categories Found
      if(!getAllPost){
          return next(AppErr(`No Post's has been Found`));
      }

      //Check if the user is blocked by the post owner
      const filteredPosts = getAllPost.filter(post => {
        //get all blocked users
        const blockedUsers = post.user.blocked;
        // console.log(blockedUsers)
        const isBlocked = blockedUsers.includes(req.userAuth);
        
        // return isBlocked ? null : post;
        return !isBlocked;
      });

      res.json({
        status: "success",
        data: filteredPosts,
      });
    }catch(error){
      next(AppErr(error.message));
    }
}


/**
 * GET: /likes/:id
 * 
 */
const toggleLikesPost = async (req, res, next) => {
    try{
      //Get the post
      const getPostLike = await Post.findById(req.params.id);

      //check if the user has already liked the post
      const isLiked = getPostLike.likes.includes(req.userAuth);

      //If the user has already liked the post, unlike the post
      if(isLiked){
        getPostLike.likes = getPostLike.likes.filter(
          like => like.toString() !== req.userAuth.toString()
        );
        await getPostLike.save();
      } else{
        // if the user has not liked the post, like the post
        getPostLike.likes.push(req.userAuth);
        await getPostLike.save();
      }
      res.json({
        status: "success",
        data: getPostLike,
      });
    }catch(error){
      next(AppErr(error.message));
    }
}

/**
 * GET: /dislikes/:id
 * 
 */
const toggleDisLikesPost = async (req, res, next) => {
    try{
      //1. Get the post
      const getDisLikesPost = await Post.findById(req.params.id);
      //2. Check if the user has already unliked the post
      const isUnliked = getDisLikesPost.disLikes.includes(req.userAuth);
      //3. If the user has already liked the post, unlike the post
      if (isUnliked) {
        getDisLikesPost.disLikes = getDisLikesPost.disLikes.filter(
          dislike => dislike.toString() !== req.userAuth.toString()
        );
        await getDisLikesPost.save();
      } else {
        //4. If the user has not liked the post, like the post
        getDisLikesPost.disLikes.push(req.userAuth);
        await getDisLikesPost.save();
      }
      res.json({
        status: "success",
        data: getDisLikesPost,
      });
    }catch(error){
      next(AppErr(error.message));
    }
}

/**
 * GET:  /:id
 * single
 */
const postDetails = async (req, res, next) => {
    try{
      //Find the post 
      const singleDetail = await Post.findById(req.params.id);
      //Number of view
      //check if user viewed this post
      const isViewed = singleDetail.numViews.includes(req.userAuth);
      if (isViewed) {
        res.json({
          status: "success",
          data: singleDetail,
        });
      } else{ //pust the user into numOfViews
        singleDetail.numViews.push(req.userAuth);

        //save
        await singleDetail.save();
        res.json({
          status: "success",
          data: singleDetail,
        });
      }
    }catch(error){
      next(AppErr(error.message));
    }
}


/**
 * PUT: /:id 
 * single
 */
const updatePost = async (req, res, next) => {
  const { title, description, category } = req.body;
    try{
      //Find the post 
      const oldPost = await Post.findById(req.params.id);

      //check if the post belongs to the user
      if (oldPost.user.toString() !== req.userAuth.toString()) {
        return next(AppErr("You are not allowed to update this post", 403));
      }

       const newPost = await Post.findByIdAndUpdate(
        req.params.id,{
          title,
          description,
          category,
          photo: req?.file?.path,
        },{
          new: true,
        }
      );
      res.json({
        status: "success",
        data: newPost,
      });
    }catch(error){
      next(AppErr(error.message));
    }
}

/**
 * DELETE: /:id 
 * single
 */
const deletePost = async (req, res, next) => {
  try{
    //find the post
    const deletePost = await Post.findById(req.params.id);

    //check if the post belongs to the user
    if (deletePost.user.toString() !== req.userAuth.toString()) {
      return next(AppErr("You are not allowed to delete this post", 403));
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      data: "Post deleted successfully",
    });

  }catch(error){
    next(AppErr(error.message));
  }
}

module.exports = {
    createPost,
    fetchPosts,
    toggleLikesPost,
    toggleDisLikesPost,
    postDetails,
    updatePost,
    deletePost
    
  };