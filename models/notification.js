const mongoose = require("mongoose");

const notification = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  message: String,
  date: {
    type: Date,
    default: Date.now(),
  },
  notificationType: String,
  seen: {
    default: false,
    type: Boolean,
    required: [true, "seen can not be empty"],
  },
},{timeseries:true});


const Notifications =  mongoose.model('Notifications',notification)

module.exports=Notifications