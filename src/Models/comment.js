const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: [true, "Post is required"],
    },
    user: {
        type: Object,
        required: [true, "User is required"],
    },
    description: {
        type: String,
        required: [true, "Comment description is required"],
    },
},{
    timestamps:true
});

  //Compile the Comment model
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;