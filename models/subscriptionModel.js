const mongoose = require("mongoose");



const subscription = new mongoose.Schema(
    {
        expiryDate:{
            type:Date,
            required:[true,'Subscription must have expiry date']
        },
        // isValid:{
        //     type:Boolean,
        //     required:true,
        //     default:false
        // },
        seller:{
            type: mongoose.Types.ObjectId,
            ref:'Seller',
            required:true
        },
        package:{
            type: mongoose.Types.ObjectId,
            ref:'Package',
            required:true
        },
        token:{
            type:String,
            required:true
        },
        transaction:{
            type: mongoose.Types.ObjectId,
            ref:'Transaction',
            required:true
        }

    }
)


const Subscription =  mongoose.model('Subscription',subscription)
module.exports= Subscription