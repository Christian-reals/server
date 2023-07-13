const bcrypt = require("bcrypt");
const { Userdb, registrationDb } = require("../models/userdb");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { default: mongoose } = require("mongoose");
const Notifications = require("../models/notification");

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
        path: "friends.friend",
        populate: { path: "registrationDataId" },
      })
      .exec();
    const blocked = user.friends.filter((friend) => friend.blocked===true);
    console.log(blocked);
    res.status(200).json({ msg: "success", data: blocked });
  } catch (error) {
    res
      .status(400)
      .json({ msg: "unsucessfull: could not fetch blocked users", error });
  }
};

const getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notifications.find({ to: userId }).populate(
      "from to"
    ).sort('date');
    res.status(200).json({ msg: "success", notifications });
  } catch (error) {
    res
      .status(400)
      .json({ msg: "unsucessfull: could not fetch notications", error });
  }
};


const markNotificationAsSeen = async (req, res) => {
  const { notificationId } = req.params; // Assuming the notification ID is provided as a URL parameter
  const { userId } = req.body;

  console.log(notificationId,userId,'Notification')

  try {
    const user = await Userdb.findById(userId); // Assuming the authenticated user's ID is available in req.userId
    if (user) {
      // Find the notification by ID in the user's notifications array
      const notification = await  Notifications.findByIdAndUpdate(notificationId, {
        $set: { seen: true },
      });
      console.log(notification)
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.status(200).json({ message: "Notification marked as seen",notification });
    }
    else{
      return res.status(400).json({ message: "User not found"});
      
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const markManyNotificationsAsSeen = async (req, res) => {
  const { userId } = req.params;
  const notificationIds = req.body; // Assuming an array of notification IDs is provided in the request body

  try {
    const user = await Userdb.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Promise.all(
      notificationIds.map(async (notificationId) => {
        // Find the notification by ID in the user's notifications array
        const notification = await Notifications.findByIdAndUpdate(
          notificationId,
          { $set: { seen: true } }
        );
        if (!notification) {
          return res.status(404).json({ message: "Notification not found" });
        }
      })
    );

    res.status(200).json({ message: "Notifications marked as seen" });
  } catch (error) {
    res.status(400).json({
      message: "Unsuccessful: Could not mark notifications as seen",
      error: error.message,
    });
  }
};


const createAvatar = async (req, res) => {
  if (req.file) {
    console.log(req.file.path);
    const { userId } = req.body;
    try {
      await Userdb.findByIdAndUpdate(
        userId,
        {
          $set: {
            avatar: path.join(req.file.path),
          },
        },
        { new: true }
      );
      res
        .status(201)
        .json({ msg: "avatar created successfully", path: req.file.path });
    } catch (error) {
      res.json({ msg: "avatar creation is not successful", error: error });
    }
  } else {
    res.status(400).json({ msg: "error" });
  }
};

const uploadImages = async function (req, res) {
  try {
    const { id } = req.user;
    console.log(id, "id", "Im not sure we are running");

    await req?.files?.map(async (file) => {
      const newImage = { url: file.path, id: new mongoose.Types.ObjectId() };
      const user = await Userdb.findByIdAndUpdate(id, {
        $push: { userImages: newImage },
      });
    });

    return res.status(201).json({ message: "Image(s) uploaded sucessfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Image(s) not uploaded sucessfully", error });
  }
};

const deleteUserImage = async function (req, res) {
  const { userId } = req.body;

  const { id } = req.params;
  try {
    Userdb.updateOne(
      { _id: userId },
      { $pull: { userImages: { id: id } } }
    ).then((user) => {
      console.log(user.userImages, "user images");
      return res.status(201).json({ message: "Image(s) deleted sucessfully" });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Image(s) not deleted sucessfully" });
  }
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

const getAllAccountsMail = async (req, res) => {
  try {
    const users = await Userdb.find()
      .lean() //$and : {[{isBanned:false},{isSuspended:false}]}
      .populate("registrationDataId")
      .exec();

    const emails = users.map((user, i) => {
      if (user.registrationDataId.email_verified) {
        return { index: i, email: user.registrationDataId.email };
      }
    });
    res.status(200).json({ msg: "success", data: users, emails });
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
const likeAccount = async (req, res) => {
  const { accountId } = req.params;
  const { userId } = req.body;
  try {
    const account = await Userdb.findById(accountId);
    const hasLiked = account?.likes?.some((like) => like?.from?.equals(userId));

    if (hasLiked) {
      res.status(400).json({ msg: "you have already liked this account" });
    } else {
      const like = {
        from: userId,
      };

      // Update the recipient's notifications array in the database
      const user = await Userdb.findByIdAndUpdate(
        accountId,
        {
          $push: {
            likes: like,
          },
        },
        { new: true }
      );

      console.log(user);

      res.status(200).json({ msg: "account liked", likes: user.likes });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "something went wrong: could not like account" });
  }
};

const unlikeAccount = async (req, res) => {
  const { accountId } = req.params;
  const { userId } = req.body;
  try {
    // Update the recipient's notifications array in the database
    const user = await Userdb.findByIdAndUpdate(
      accountId,
      {
        $pull: {
          likes: {
            from: userId,
          },
        },
      },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error unliking account" });
  }
};

const addFriend = async (req, res) => {
  const { friendId } = req.params;
  const { userId } = req.body;

  try {
    const user = await Userdb.findById(userId).populate("friends.friend");
    const friendExists = user.friends.some((friend) => {
      return friend.friend._id.toString() === friendId;
    });
    if (friendExists) {
      res.status(400).json({ msg: "Friend already exists" });
    } else {
      const updatedUser = await Userdb.findByIdAndUpdate(
        userId,
        { $addToSet: { friends: { friend: friendId } } },
        { new: true }
      ).populate("friends.friend");

      res.status(200).json({ msg: "Friend added", data: updatedUser.friends });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error adding friend", error });
  }
};
const removeFriend = async (req, res) => {
  const { friendId } = req.params;
  const { userId } = req.body;

  try {
    const user = await Userdb.findByIdAndUpdate(
      friendId,
      { $pull: { friends: { friend: userId } } },
      { new: true }
    ).populate("friends.friend");

    res.status(200).json({ msg: "friend removed", data: user.friends });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error removing friend", error });
  }
};

const hasLikedAccount = async (userId, accountId) => {
  try {
    // Check if the user has already liked the account
    const account = await Userdb.findById(accountId);
    const hasLiked = account.likes.some((like) => like.from.equals(userId));
    return hasLiked;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  getUserBlockedAccounts,
  deleteAccount,
  getAccount,
  getAllAccounts,
  blockUser,
  createAvatar,
  getNotifications,
  markNotificationAsSeen,
  markManyNotificationsAsSeen,
  likeAccount,
  unlikeAccount,
  addFriend,
  getAllAccountsMail,
  removeFriend,
  uploadImages,
  deleteUserImage,
};
