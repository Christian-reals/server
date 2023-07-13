const mongoose = require("mongoose");

const admin = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "admin's first name must be filled"],
    },
    lastName: {
      type: String,
      required: [true, "admin's last name must be filled"],
    },
    userName: {
      type: String,
      required: [true, "admin's name must be filled"],
      unique: [true, "username must be unique"],
    },
    email: {
      type: String,
      required: [true, "admin's email must be filled"],
      unique: [true, "email must be unique"],
    },
    password: {
      type: String,
      required: [true, "admin's password must be filled"],
    },
    role:{
        type: String,
        enum:['manager','owner',],
        required: [true, "admin's role must be filled"],
    }
  },
  { timestamps: true }
);

const Admin = mongoose.model('Admin',admin)

module.exports = Admin