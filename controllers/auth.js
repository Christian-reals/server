const express = require("express");
const bcrypt = require("bcrypt");
const { Userdb, registrationDb } = require("../models/userdb");
const { genSalt } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const sendVerificationEmail = require("../utils/mailer");
const { verifyToken } = require("../middleware/jwt");
const { redirect } = require("express/lib/response");

const register = async (req, res) => {
  const { password, confirm_password, userName, email, ...others } = req.body;
  const usernameExist = await registrationDb.findOne({ userName: userName });
  const emailExist = await registrationDb.findOne({ email });

  if (usernameExist) {
    res
      .status(401)
      .json({ msg: `username already exists ${userName}`, usernameExist });
  } else if (emailExist) {
    res.status(401).json({ msg: `email already exists ${email}`, emailExist });
  } else {
    if (password) {
      const salt = await genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = new registrationDb({
        password: hashedPassword,
        userName: userName,
        email: email,
        ...others,
      });
      try {
        await user.save(user);
        const id = user._id;
        const token = jwt.sign({ id }, process.env.SECRET_KEY, {
          expiresIn: "60s",
        });
        sendVerificationEmail(email, token);
        return res
          .status(201)
          .json({ msg: "user registered sucessfully", id: user._id });
      } catch (error) {
        return res
          .status(400)
          .json({ msg: "user couldn not be registered", error: error });
      }
    } else {
      res
        .status(401)
        .json({ msg: "password and confirm password field don't match" });
    }
  }
};

const  verifyMail = async (req,res)=>{
  const {token} = req.params
  try {
    await verifyToken(token)
    res.redirect('http://127.0.0.1:5173/profile')

  } catch (error) {
    res
  }
  
}

const createProfile = async (req, res) => {
  const { regId, ...profileData } = req.body;
  const user = new Userdb({
    registrationDataId: regId,
    profile_data: profileData,
    profile_complete: true,
  });
  try {
    await user.save(user);
    return res.status(201).json({ msg: "Profile created sucessfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Profile could not be registered", error: error });
  }
};

//login
const login = async (req, res) => {
  const userInfo = req.body;
  const {  emailOrId, password } = userInfo;

  if (emailOrId && password) {
    try {
      const user =
        (await registrationDb.findOne({ userName: emailOrId})) ||
        (await registrationDb.findOne({ email: emailOrId }));

      if (user) {
        // console.log(user);
        const userValid = await bcrypt.compare(password, user.password);
        // console.log(userValid,password)
        if (userValid) {
          const id = Userdb.find({
            registrationDataId: mongoose.Types.ObjectId(user[0]._id),
          })._id;
          console.log(id);
          const token = jwt.sign({ id, username }, process.env.SECRET_KEY, {
            expiresIn: "30d",
          });
          return res.status(201).json({ msg: "user logged in", token: token });
        } else {
          return res.status(401).json({ msg: "password incorrect" });
        }
      }
      res.status(404).json({ msg: "user not found" });
    } catch (error) {
      return res
        .status(404)
        .json({ msg: "something went wrong user not found", error ,userInfo});
    }
  } else {
    res.status(401).json({ msg: "fill out the necessary fields" });
  }
};

const logOut = (req, res) => {
  const { token } = req.header;
};

function resetPassword(params) {
  
}

module.exports = { login, register, createProfile,verifyMail };
