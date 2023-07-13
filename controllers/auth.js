const express = require("express");
const bcrypt = require("bcrypt");
const { Userdb, registrationDb } = require("../models/userdb");
const { genSalt } = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../utils/mailer");
const moment = require("moment/moment");

const register = async (req, res) => {
  console.log("register request");
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
        const username = user.userName;
        console.log("saved");
        const token = jwt.sign({ id, username }, process.env.SECRET_KEY, {
          expiresIn: "30m",
        });
        console.log("token ");

        await sendVerificationEmail(email, token, userName);

        return res
          .status(201)
          .json({ msg: "user registered sucessfully", id: user._id });
      } catch (error) {
        return res
          .status(400)
          .json({ msg: "user could not be registered", error: error });
      }
    } else {
      res
        .status(401)
        .json({ msg: "password and confirm password field don't match" });
    }
  }
};

const verifyMail = async (req, res) => {
  res.redirect("https://christianreal.onrender.com/profile");
};

const createProfile = async (req, res) => {
  console.log("request");
  if (req.body) {
    const { regId, ...profileData } = req.body;
    console.log(regId, profileData);
    const user = new Userdb({
      registrationDataId: regId,
      profile_data: profileData,
      profile_complete: true,
    });
    try {
      user.hasTrial = true;
      user.trialEndDate = Date.now() + 3 * 24 * 60 * 60 * 1000;
      await user.save(user);
      return res.status(201).json({ msg: "Profile created sucessfully" });
    } catch (error) {
      return res
        .status(400)
        .json({ msg: "Profile could not be registered", error: error });
    }
  } else {
    res.status(401).json({ msg: "no request body" });
  }
};

//login
const login = async (req, res) => {
  const userInfo = req.body;
  const { emailOrId, password } = userInfo;

  if (emailOrId && password) {
    try {
      const user =
        (await registrationDb.findOne({ userName: emailOrId })) ||
        (await registrationDb.findOne({ email: emailOrId }));

      if (user) {
        const userValid = await bcrypt.compare(password, user.password);
        if (userValid) {
          const userProfile = await Userdb.findOne({
            registrationDataId: user._id,
          });
          //if the user has a profile
          if (userProfile) {
            const id = userProfile?._id;
            const username = user.userName;
            // generate a jwt token
            const token = jwt.sign({ id, username }, process.env.SECRET_KEY, {
              expiresIn: "2d",
            });
            return res.status(201).json({
              msg: "user logged in",
              token: token,
              verified: user.email_verified,
              email: user.email,
              username: user.firstName,
            });
          } else {
            switch (user.email_verified) {
              case true:
                return res
                  .status(400)
                  .json({
                    msg: "Incompete registration: You have not created a profile.",
                  })
                  // .redirect(`http://127.0.0.1:5173//profile/?id=${user._id}`);

              case false:
                return res
                .status(400)
                .json({
                  msg: "You have not verified your email account",
                })
                // .redirect(`/verify/?email=${user.email}&username=${user.userName}`,);

              default:
                break;
            }
          }
        } else {
          return res.status(401).json({ msg: "password incorrect" });
        }
      }
      else{
      res.status(404).json({ msg: "user not found" });

      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ msg: "something went wrong user not found", error, userInfo });
    }
  } else {
    res.status(401).json({ msg: "fill out the necessary fields" });
  }
};

//sends reset password to email
const forgotPasswordLink = async (req, res) => {
  const { email } = req.body;
  if (email) {
    try {
      const user = await registrationDb.find({ email: email });
      if (user) {
        const token = jwt.sign({ email }, process.env.SECRET_KEY, {
          expiresIn: "30m",
        });
        sendResetPasswordEmail(email, token);
        res.status(200).json({ msg: "success" });
      } else {
        res.status(400).json({ msg: "user not found" });
      }
    } catch (error) {}
  } else {
    res.status(400).json({ msg: "no email in request body" });
  }
};

//updates the password to the new password
const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await registrationDb.findById(id);
    if (user) {
      // console.log(user);
      const userValid = await bcrypt.compare(oldPassword, user.password);
      if (userValid) {
        const salt = await genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await registrationDb.findByIdAndUpdate(id, {
          password: hashedPassword,
        });
        return res.status(201).json({
          msg: "Password changed sucessfully",
        });
      } else {
        return res.status(400).json({ msg: "old password incorrect" });
      }
    }
    res.status(400).json({ msg: "user not found" });
  } catch (error) {
    res.status(400).json({ msg: "error: could not change password", error });
  }
};

const changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const account = await Userdb.findById(userId);
    const { registrationDataId } = account;
    const user = await registrationDb.findById(registrationDataId);
    if (user) {
      // console.log(user);
      const userValid = await bcrypt.compare(oldPassword, user.password);
      if (userValid) {
        const salt = await genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await registrationDb.findByIdAndUpdate(registrationDataId, {
          password: hashedPassword,
        });
        return res.status(201).json({
          msg: "Password changed sucessfully",
        });
      } else {
        return res.status(400).json({ msg: "old password incorrect" });
      }
    }
    res.status(400).json({ msg: "user not found" });
  } catch (error) {
    res.status(400).json({ msg: "error: could not change password", error });
  }
};

const verifyToken = async (req, res) => {
  res.status(200).json({ msg: "token verified" });
};

module.exports = {
  login,
  register,
  verifyToken,
  createProfile,
  verifyMail,
  changePassword,
  resetPassword,
  forgotPasswordLink,
};
