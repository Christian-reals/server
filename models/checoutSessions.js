const mongoose  = require("mongoose");

const checkout = new mongoose.Schema({
    sessionId:String,
    email:String,
    priceId:String,
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'Users'
    }

})

const CheckoutSession = mongoose.model('Checkout',checkout)

module.exports= CheckoutSession