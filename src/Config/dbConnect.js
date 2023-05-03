const mongoose = require('mongoose');

const Connect = (url) =>{
    return (
        mongoose.set("strictQuery", true),
        mongoose.connect(url)
    )
}

module.exports =  Connect;