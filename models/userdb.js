const mongoose = require('mongoose')

var registerSchema = new mongoose.Schema({
    gender:{
        type:String,
        required:[true,`please specify gender`],
    },
    datingNeed:{
        type:String,
        required:[true,`please specify dating need`],
    },
    firstName:{
        type:String,
        required:[true,`First Name cannot be empty`],
    },
    surname:{
        type:String,
        required:[true,`Surname cannot be empty`],
    },
    email:{
        type:String,
        required:[true,`Email cannot be empty`],
        unique:true
    },
    city:{
        type:String,
        required:[true,`city cannot be empty`],
    },
    state:{
        type:String,
        required:[true,`state cannot be empty`],
    },
    userName:{
        type:String,
        required:[true,`username cannot be empty`],
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
    },
    postCode:{
        type:Number,
        required:[true,'postCode cannot be empty'],
    },
    dateOfBirth:{
        type:String,
        required:true,
    },
    date: {type:String},
    
},{timestamps:true})

var profileSchema = new mongoose.Schema({
    relationship_status:{
        type:String,
        required:[true,`status cannot be empty`],
        
    },
    ethnic_background:{
        type:String,
        required:[true,`ethnic background cannot be empty`],
        
    },
    education:{
        type:String,
        required:[true,`education cannot be empty`],
        
    },
    employment:{
        type:String,
        required:[true,`employment cannot be empty`],
        
    },
    current_work:{
        type:String,
        required:[true,`current work cannot be empty`],
        
    },
    career_goal:{
        type:String,
        required:[true,`career goal cannot be empty`],
        
    },
    languages:{
        type:Array,
        required:[true,`languages cannot be empty`],
        
    },
    height:{
        type:String,
        required:[true,`height cannot be empty`],
        
    },
    weight:{
        type:String,
        required:[true,`weight cannot be empty`],
        
    },
    body_type:{
        type:String,
        required:[true,`body type cannot be empty`],
        
    },
    hair_color:{
        type:String,
        required:[true,`hair color cannot be empty`],
        
    },
    eye_color:{
        type:String,
        required:[true,`eye color cannot be empty`],
        
    },
    no_of_children:{
        type:String,
        required:[true,`no of children cannot be empty`],
        
    },
    child_age_youngest:{
        type:String,
        required:[true,`child youngest age cannot be empty`],
        
    },
    child_age_oldest:{
        type:String,
        required:[true,`child_age_oldest cannot be empty`],
        
    },
    more_children:{
        type:String,
        required:[true,`more children cannot be empty`],
        
    },
    about:{
        type:String,
        required:[true,`about cannot be empty`],
        
    },
    free_time_where:{
        type:String,
        required:[true,`free_time_where cannot be empty`],
        
    },
    free_time_how:{
        type:String,
        required:[true,`free_time_how cannot be empty`],
        
    },
    music_choice:{
        type:String,
        required:[true,`music_choice cannot be empty`],
        
    },
    desire:{
        type:String,
        required:[true,`desire cannot be empty`],
        
    },
    mantra:{
        type:String,
        required:[true,`mantra cannot be empty`],
        
    },
    faith_status:{
        type:String,
        required:[true,`faith_status cannot be empty`],
        
    },
    ethnic_background:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },

})

var userschema = new mongoose.Schema({
    registrationDataId:{
        type:mongoose.Types.ObjectId,
        ref:'registrationData'
    },
    profile_data:profileSchema, 
    profile_complete:{
        type:Boolean,
        default:false,
    },
    events:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Events',
    }],
    meetups:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Events',
    }],
    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
    }],
    blockedUsers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
    }],
    chats:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chats',
    }],
    isPremium:Boolean,
    isBanned:Boolean,
    isSuspended:{
        banStart:{
            type: Date
        },
        banEnd:{
            type: Date
        },
        type:Boolean,
        reason:String
    },
    date: String
},
{
    timestamps:true,
}
)


const Userdb = mongoose.model('Users',userschema)
const registrationDb = mongoose.model('registrationData',registerSchema)
module.exports = {Userdb,registrationDb}




