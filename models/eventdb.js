const mongoose = require('mongoose')

const eventDb = new mongoose.Schema({
    title:{
        required:true,
        type:String,
    },
    category:{
        type: Array,
    },
    description:{
        required:true,
        type: String
    },
    date: {
        type:Date,
        required:true,
        // default:Date.now()
    },
    imageUrl:{type:String},
    venue:{
        type:String,
        required:true,
    },
    attendee:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
    }]
})

const EventDb = mongoose.model('Events',eventDb)

module.exports= EventDb