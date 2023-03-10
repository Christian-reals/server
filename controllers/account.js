const bcrypt = require("bcrypt");
const {Userdb,registrationDb} =require('../models/userdb')

const getAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await Userdb.findById(userId)
    .populate("registrationDataId")
    .exec();
    res.status(200).json({msg:'success',data:user})
  } catch (error) {
    res.status(400).json({msg:'unsucessfull'})
  }

};

const getAllAccounts = async (req, res) => {
  try {
      const users = await Userdb.find().lean()//$and : {[{isBanned:false},{isSuspended:false}]}
    .populate("registrationDataId")
    .exec();
    res.status(200).json({msg:'success',data:users})
  } catch (error) {
    res.status(400).json({msg:'unsucessfull: could not users'})
  }

};

const deleteAccount = async (req, res) => {
  const userInfo = req.body;
  const { emailOrId, password } = userInfo;
  if (emailOrId && password) {
    try {
      const user =
        (await registrationDb.findOne({ userName: emailOrId })) ||
        (await registrationDb.findOne({ email: emailOrId }));

      if (user) {
        // console.log(user);
        const userValid = await bcrypt.compare(password, user.password);
        if (userValid) {
          await Userdb.findOneAndDelete({ registrationDataId: user._id });
          await registrationDb.findByIdAndDelete(user._id);
          return res.status(201).json({
            msg: "user deleted",
          });
        } else {
          return res.status(401).json({ msg: "password incorrect" });
        }
      } else {
        res.status(404).json({ msg: " email or user ID is wrong" });
      }
    } catch (error) {
      return res
        .status(404)
        .json({
          msg: "something went wrong: account could not be deleted",
          error,
        });
    }
  } else {
    res.status(401).json({ msg: "fill out the necessary fields" });
  }
};

const suspendAccount = async (req, res) => {};

module.exports = {deleteAccount,getAccount, getAllAccounts}

