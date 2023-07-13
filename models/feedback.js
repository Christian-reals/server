const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // If feedback is only for members
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  reply: {
    type: String,
    required: true
  },
  isReplied:{
    type: String,
    default: false
  },
  message: {
    type: String,
    required: true
  },
},{timeseries:true});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
