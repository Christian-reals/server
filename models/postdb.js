const mongoose = require('mongoose')


var postSchema = new mongoose.Schema({
    title:{
        required:true,
        type:String
    },
    category:{
        type: Array,
    },
    description:{
        type: String
    },
    date: {
        type:Date,
        default:Date.now()
    },
    bannerWidth:{
        type:String,
        default:'400px'
    },
    bannerHeigth:{
        type:String,
        default:'400px'
    },
    //position for attached image
    attachedXpos:{
        type:String
    },
    attachedYpos:{
        type:String
    },
    imageUrl:{type:String}
    
})


const Postdb = mongoose.model('postdb',postSchema)
module.exports = Postdb




