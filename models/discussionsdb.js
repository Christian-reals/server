const mongoose = require('mongoose')

const discussion = new mongoose.Schema({
    topic:{
        type:String,
        required:['topic cannot be empty'],
    },
    description:{
        type:String,
        required:['discussion must have a  description'],
    },
    author:{
        type:String,
        required:['discussion must have an author'],
    },
    authorRole:{
        type:String,
        required:['authorRole can not be empty'],
    },
    authorImgUrl:{
        type:String
    },
    participants:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'users'
    }],
    reactions:[{
        reaction:String,
        from:{type:mongoose.Schema.Types.ObjectId}
    }],
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Comments'
    }],
},
{
    timestamps:true
}
)

const Discussiondb= mongoose.model('Discussions',discussion)

module.exports = Discussiondb