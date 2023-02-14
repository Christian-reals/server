const mongoose = require('mongoose')

const chatRoom = new mongoose.Schema({
    room_name:{
        type:String,
        required:[true,'room name cannot be empty']
    },
    room_description:{
        type:String,
        required:[true,'room description name cannot be empty']
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,'member cannot be empty']
    }],
    chats:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chats'
    }]
})