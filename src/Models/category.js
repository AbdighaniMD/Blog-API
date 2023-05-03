const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
},{
    timestamps:true
});

  //Compile the Comment model
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;