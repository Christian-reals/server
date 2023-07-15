const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  userId: {
    type: String,
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
