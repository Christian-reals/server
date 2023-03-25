const bcrypt = require("bcrypt");
const { Userdb, registrationDb } = require("../models/userdb");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

//getting the directory outside controller
const dirnamearr = __dirname.split(`\\`);
const dirname = dirnamearr.splice(0, dirnamearr.length - 1).join("/");

//setting up multer diskStorage method

const storage = multer.diskStorage({
  destination: `${dirname}/tmp/uploads`,
  filename: (req, file, cb) => {
    //allowing multiple file types extension
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fieldNameSize: 300,
    fileSize: 5048579, // 5Mb
  },
}).single("file");

const getAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await Userdb.findById(userId)
      .populate("registrationDataId")
      .exec();
    res.status(200).json({ msg: "success", data: user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "unsucessfull: could not fetch user", error });
  }
};

const getUserBlockedAccounts = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await Userdb.findById(userId)
      .populate({
        path: "blockedChats",
        populate: { path: "registrationDataId" },
      })
      .exec();
    res.status(200).json({ msg: "success", data: user.blockedChats });
  } catch (error) {
    res
      .status(400)
      .json({ msg: "unsucessfull: could not fetch blocked users", error });
  }
};

const getNotifications = async (req, res)=>{
  const { userId } = req.params;
  try {
    const user = await Userdb.findById(userId).populate('notifications.from')
      .exec();
      console.log(userId,user)
    res.status(200).json({ msg: "success", data: user.notifications });

  } catch (error) {
    res
      .status(400)
      .json({ msg: "unsucessfull: could not fetch notications", error });
  }
}

const createAvatar = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(401).send(err);
    } else {
      if (req.file) {
        console.log(req.file);
        const { userId } = req.body;
        try {
          await Userdb.findByIdAndUpdate(
            userId,
            {
              $set: {
                avatar: path.join(dirname + "tmp/uploads/" + req.file.filename),
              },
            },
            { new: true }
          );
          res.status(201).json({ msg: "avatar created successfully" });
        } catch (error) {
          res.json({ msg: "avatar creation is not successful", error: error });
        }
      } else {
        res.status(400).json({ msg: "error" });
      }
    }
  });
};
const blockUser = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;
  await Userdb.updateOne({ _id: userId }, { $push: { blockedUsers: id } });
};

const getAllAccounts = async (req, res) => {
  try {
    const users = await Userdb.find()
      .lean() //$and : {[{isBanned:false},{isSuspended:false}]}
      .populate("registrationDataId")
      .exec();
    res.status(200).json({ msg: "success", data: users });
  } catch (error) {
    res.status(400).json({ msg: "unsucessfull: could not users" });
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
      return res.status(404).json({
        msg: "something went wrong: account could not be deleted",
        error,
      });
    }
  } else {
    res.status(401).json({ msg: "fill out the necessary fields" });
  }
};

const suspendAccount = async (req, res) => {};

module.exports = {
  getUserBlockedAccounts,
  deleteAccount,
  getAccount,
  getAllAccounts,
  blockUser,
  createAvatar,
  getNotifications,
};
