const mongoose = require('mongoose')

const discussion = new mongoose.Schema({
    topic:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    author:{
        type:String,
        required:true,
    },
    participants:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'users'
    }],
    opinions:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Opinions'
    }],
},
{
    timestamps:true
}
)

const Discusssiondb= mongoose.model('Discussions',discussion)

module.exports = Discusssiondb