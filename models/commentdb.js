const mongoose = require('mongoose')


const comment = new mongoose.Schema({
    message: String,
    commentator:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
    }
},{timestamps:true})

const commentdb = mongoose.model('Comments',comment)

module.exports = commentdb

