const mongoose = require('mongoose');

const devotionalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  verse: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
},{timestamps:true});

module.exports = mongoose.model('Devotional', devotionalSchema);
