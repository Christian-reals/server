const mongoose = require('mongoose')

var ProfileSchema = new mongoose.Schema({
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
        required:[true,`ethnic_background cannot be empty`],
        
    },
    child_age_oldest:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    more_children:{
        type:String,
        required:[true,`more children cannot be empty`],
        
    },
    about:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    free_time_where:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    free_time_how:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    music_choice:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    desire:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    mantra:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    faith_status:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    ethnic_background:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    ethnic_background:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },
    ethnic_background:{
        type:String,
        required:[true,`ethnic_background cannot be empty`],
        
    },

})