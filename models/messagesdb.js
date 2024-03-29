const mongoose = require('mongoose')

const message = new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    text:{
        type:String,
    },
    imageUrl:{
        type:String
    },
    fileName:{
        type:String
    },
    fileUrl:{
        type:String
    },
    fileType:{
        type:String
    },
    reactions:[{
        reaction:String,
        from:{type:mongoose.Schema.Types.ObjectId}
    }],
    replies:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Messages'
    }],
    isReply:{
        type:Boolean,
        default:false
    },
    seen:{
        type:Boolean,
        default:false
    },
    refrenceChat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Messages'
    },
},{timestamps:true})


const Messagesdb = mongoose.model("Messages",message)
module.exports= Messagesdb