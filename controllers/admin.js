const Admin = require("../models/admin");
const LoveQuestdb = require("../models/loveQuestdb");
const { Userdb, registrationDb } = require("../models/userdb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const adminSignup = async (req, res) => {
  const { firstName, lastName, userName, email, password,role } = req.body;

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: "Admin already exists" });
    }
    if (firstName, lastName, userName, email, password,role ) {
      admin = new Admin({
        firstName,
        lastName,
        userName,
        email,
        password,
        role,
      });
      
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      console.log(password,salt)

      admin.password = await bcrypt.hash(password, salt);
  
      // Save admin to database
      await admin.save();
  
      res.status(200).json({ message: "Admin created successfully" });
    } else {
      res.status(400).json({ message: "error: fill in all necessary fields" });
      
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error",error:err });
  }
};

// Handle POST request at /api/admin/signin
const adminSignIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });

    // If the admin doesn't exist, return error message
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, admin.password);

    // If the password is incorrect, return error message
    if (!isMatch) {
      return res.status(401).json({ message: "password incorrect" });
    }

    // If the email and password are correct, create a JSON Web Token (JWT) for authentication
    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: "3h" }
    );

    // Return the token to the client
    res.status(200).json({ message: "Admin signed in successfully", token });
  } catch (err) {
    // If there is an error, return error message
    res.status(500).json({ message: "Error signing in admin", err });
  }
};

const adminGetAllLoveQuests = async (req, res) => {
    try {
      const LoveQuest = await LoveQuestdb.find();
      console.log(LoveQuest)
      res.status(200).json({ data: LoveQuest, msg: "request sucessful" });
    } catch (error) {
      res.status(400).json({ msg: "failed", error: error });
    }
  };

  const deleteAccount = async (req, res) => {
    const {userId} = req.params;

      try {

            await Userdb.findOneAndDelete({ registrationDataId: userId });
            await registrationDb.findByIdAndDelete(userId);
            return res.status(201).json({
              msg: "user deleted",
            });

      } catch (error) {
        return res.status(500).json({
          msg: "something went wrong: account could not be deleted",
          error,
        });
      }

  };
  
  const suspendAccount = async (req, res) => {
    const {userId} = req.params;

    console.log(userId)
    

    try {
      const user = await Userdb.findByIdAndUpdate(userId,{$set:{isSuspended:true}} );
      return res.status(201).json({
        msg: "user Suspended",
        user
      });

    } catch (error) {
      return res.status(500).json({
        msg: "something went wrong: account could not be suspended",
        error,
      });
    }
  };


  const banAccount = async (req, res) => {
    const {userId} = req.params;

    

    try {
      await Userdb.findByIdAndUpdate(userId,{$set:{isBanned:true}} );
      return res.status(201).json({
        msg: "user banned",
      });

    } catch (error) {
      return res.status(500).json({
        msg: "something went wrong: account could not be banned",
        error,
      });
    }
  };

  const activateAccount = async (req, res) => {
    const {userId} = req.params;

    

    try {
      
      const user = await Userdb.findById(userId );
      if (user.isBanned) {
        await Userdb.findByIdAndUpdate(userId,{$set:{isBanned:false}} );
        return res.status(201).json({
          msg: "user re-activated",
        });
      }
      else if(user.isSuspended){
        await Userdb.findByIdAndUpdate(userId,{$set:{isSuspended:false}} );
        return res.status(201).json({
          msg: "user re-activated",
        });
      }
      else{
        return res.status(400).json({
          msg: "user is already active",
        });
      }

    } catch (error) {
      return res.status(500).json({
        msg: "something went wrong: account could not be reactivated",
        error,
      });
    }
  };
  module.exports = {adminGetAllLoveQuests,activateAccount,banAccount,suspendAccount,deleteAccount,adminSignIn,adminSignup}