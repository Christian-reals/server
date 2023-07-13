const mongoose = require('mongoose')

const meetupDb = new mongoose.Schema({
    title:{
        required:true,
        type:String,
    },
    isApproved:{
        type:Boolean,
        default:false
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
},{timeseries:true})

const MeetupDb = mongoose.model('Meetups',meetupDb)

module.exports= MeetupDb