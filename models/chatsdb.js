const mongoose = require('mongoose')

const chat = new mongoose.Schema(
    {
        members: [{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Users',
            max:2,
        }],
        messages: [{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Messages'
        }],
       total_messages: {
        type:Number
    }
    },
    {
        timestamps:true
    }
)


const Chatdb = mongoose.model('Chats',chat)

module.exports=Chatdb