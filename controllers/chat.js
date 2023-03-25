const Messagesdb = require("../models/messagesdb");
const Chatdb = require("../models/chatsdb");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { default: mongoose } = require("mongoose");
const { Userdb } = require("../models/userdb");

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

//the create message controller

const createMessage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(401).send(err);
    } else {
      if (req.file) {
        //if file is attched to request

        const { chatId, from, to, ...others } = req.body;
        console.log(chatId, from, to, others, req.file);
        const originalname = req.file.originalname;
        const fileType = req.file.originalname.split(".").pop();
        console.log(originalname);
        const message = new Messagesdb({
          ...others,
          from: mongoose.Types.ObjectId(from),
          to: mongoose.Types.ObjectId(to),
          image: {
            data: fs.readFileSync(
              path.join(dirname + "/tmp/uploads/" + req.file.filename)
            ),
          },
          fileType,
          fileName: originalname,
          fileUrl: path.join(dirname + "/tmp/uploads/" + req.file.filename),
        });
        try {
          await message.save(message);
          const chat = await Chatdb.find({ _id: chatId });
          console.log(chat);
          if (chat.length > 0) {
            await Chatdb.findOneAndUpdate(
              { _id: chatId },
              { $push: { messages: message._id } }
            ).exec();
            res.status(201).json({ msg: "message created successfully" });
          } else {
            res.status(401).json({ msg: "chat not found" });
          }
        } catch (error) {
          res.json({ msg: "message creation is not successful", error: error });
        }
      } else {
        //if file is not attached to the request
        const { chatId, from, to, ...others } = req.body;
        // console.log(req.body, "isnotfile", others);
        const message = new Messagesdb({
          ...others,
          from: mongoose.Types.ObjectId(from),
          to: mongoose.Types.ObjectId(to),
        });
        try {
          await message.save(message);
          await Chatdb.findOneAndUpdate(
            { _id: chatId },
            { $push: { messages: message._id } }
          ).exec();
          res.status(201).json({ msg: "text message created successfully" });
        } catch (error) {
          res.status(401).json({
            msg: "text message creation is not successful",
            error: error,
          });
        }
      }
    }
  });
};

//start a new chat
const createChat = async (req, res) => {
  try {
    const { recieverId, userId } = req.body;

    if (recieverId && userId) {
      const user = await Userdb.findById(userId)
      const chatExists = user.friends.filter((friend)=>{
        return friend?.friend?.toString() == recieverId
      })
      if (chatExists.length>0) {
        res.status(301).json({msg:"chat already exists"})
        console.log(chatExists,'exists')
      } else {
        const chat = new Chatdb({
          members: [
            mongoose.Types.ObjectId(recieverId),
            mongoose.Types.ObjectId(userId),
          ],
        });
        chat.members.forEach(async (id) => {
          
          await Userdb.findOneAndUpdate(
            { _id: id },
            { $push: { chats: mongoose.Types.ObjectId(chat._id) } }
          ).exec();
        });
        await Userdb.findOneAndUpdate(
          { _id: recieverId },
          { $push: { friends: {friend:mongoose.Types.ObjectId(userId)} } }
        ).exec();
        await Userdb.findOneAndUpdate(
          { _id: userId },
          { $push: { friends: {friend:mongoose.Types.ObjectId(recieverId)} } }
        ).exec();
        await chat.save(chat);
        res
          .status(201)
          .json({ msg: "chat created successfully", data: chat._id });
      }
    } else {
      res.status(401).json({ msg: "chat not created  no Id" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "chat creation failed", error: error });
  }
};
// get all chats
const getAllChats = async (req, res) => {
  try {
    const chats = await Chatdb.find({}).lean();
    console.log(chats);
    res.status(200).json({ data: chats, msg: "request sucessful" });
  } catch (error) {
    res.status(404).json({ msg: "failed", error: error });
  }
};
const getUserChats = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Userdb.findOne({ _id: id }).populate("chats").exec();
    const { chats } = user;
    if (chats.length > 0) {
      console.log(chats)
      // Get receiver data for each chat
      const chatData = await Promise.all(
        chats.map(async (chat) => {
          const recieverId = chat.members.filter((member) => {
            return member.toString() != user._id;
          });
          if (recieverId) {
            console.log(recieverId)
            const reciever = await Userdb.findById(recieverId)
              .populate("registrationDataId")
              .exec();
            const { userName } = reciever.registrationDataId;
            const { avatar } = reciever;
            // Get last message
            const chatMessage = await Chatdb.findById(chat._id)
              .populate("messages")
              .exec();
            const messages = chatMessage.messages;
            return {
              avatar: avatar,
              recieverId: recieverId[0],
              username: userName,
              messages: messages[messages.length - 1],
              chatId: chat._id,
            };
          }
        })
      );
      res.status(200).json({
        msg: "request successful",
        data: chatData,
      });
    } else {
      res.status(400).json({ data: null, msg: "no chat found" });
    }
  } catch (error) {
    res.status(400).json({ msg: "failed", error: error });
  }
};

//get messages in a chat
const getMessages = async (req, res) => {
  const { id } = req.params;
  
  try {
    const chat = await Chatdb.findById({ _id: id }).populate({
      path: "messages",
      populate: [
        { path: "refrenceChat"},
        { path: "replies"},
        
      ]
    })
  .exec();
    const messages = chat.messages;
    if (messages) {
      res.status(200).json(messages);
    } else {
      res.status(400).json({ msg: "no messges" });
    }
  } catch (error) {
    res.status(404).json({ msg: "failed, unable to get chat", error: error });
  }
};

//delete chats
const deleteChat = async (req, res) => {
  const { id } = req.params;
  const deletedmessage = Chatdb.findByIdAndDelete(id);
};

//delete user chats
const deleteUserChat = async (req, res) => {
  const {userId} = req.body
  console.log(req.body)
  const { id } = req.params;
  const chat = await Chatdb.findById(id)
  const friendId  = chat.members.filter((member)=>{return member != userId  })
  console.log('deleteing', userId,id)
  if (userId&&id) {
    try {
      await Userdb.updateOne(
        { _id: userId },
        { $pull: { chats: id }}
      );
      await Userdb.findOneAndUpdate(
        { _id: userId },
        { $pull: { friends: { friend: friendId } } },
        { new: true },)
    res.status(200).json({msg:'success: chat deleted'})

    } catch (error) {
    res.status(500).json({msg:'error: something went wrong',error})
      
    }
  } else {
    res.status(400).json({msg:'error: invalid id'})
  }

};

//blockchat

const blockChat = async (req, res) => {
  const {userId} = req.body
  const { id } = req.params;
  console.log('blocking', userId,id)
  const chat = await Chatdb.findById(id)
  const friendId  = chat.members.filter((member)=>{return member != userId  })
  console.log(friendId)
  if (friendId) {
    try {
        await Userdb.updateOne(
    { _id: userId },
    { $push: { blockedChats: id }}
  );
  await Userdb.updateOne(
    { _id: userId },
    { $set: { "friends.$[elem].blocked": true } }, { arrayFilters: [{ "elem.friend": friendId  }] }
  );
  res.status(200).json({msg:'success: chat blocked'})
    } catch (error) {
    res.status(500).json({msg:'error: something went wrong'})
      
    }
  } else {
    res.status(400).json({msg:'error: unable to resolve friendId'})
  }

};

const unBlockChat = async (req, res) => {
  const {userId} = req.body
const chat = await Chatdb.find({ members: { $in: [userId] } })

  const friendId  = chat.members.filter((member)=>{return member != userId  })
  await Userdb.updateOne(
    { _id: userId },
    { $pull: { blockedChats: chat._id.toString() }}
  );
  await Userdb.updateOne(
    { _id: userId },
    { $set: { "friends.$[elem].blocked": false } }, { arrayFilters: [{ "elem.friend": friendId  }] }
  );
};

const updateMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedmessage = await Messagesdb.findByIdAndUpdate(id, req.body);
  } catch (error) {
    res.send(error);
  }
};
const reactToMessage = async (req, res) => {
  const { id } = req.params;
  const { reaction, from } = req.body;
  try {
    const message = await Messagesdb.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          reactions: {
            reaction: reaction,
            from: mongoose.Types.ObjectId(from),
          },
        },
      }
    ).exec();
    res.status(201).send("reacted to message");
  } catch (error) {
    res.status(401).json({ msg: "unsucessful reply", error: error });
  }
};
const replyMessage = async (req, res) => {
  //id of the chat
  const { id } = req.params;
  console.log(req.body)

  
  const chatid = mongoose.Types.ObjectId(id);
  //id of the chat taht is being replied
  const { referenceid, from, to, ...others } = req.body;
  if (referenceid&& from&& to) {
    try {
      const message = new Messagesdb({
        ...others,
        from: mongoose.Types.ObjectId(from),
        to: mongoose.Types.ObjectId(to),
        refrenceChat: mongoose.Types.ObjectId(referenceid),
        isReply: true,
        //add refrenced chat to the reply
      });
      try {
        //add the reply to the refrenced chat
        const refrence = await Messagesdb.findOneAndUpdate(
          { _id: referenceid },
          { $push: { replies: message._id } }
        ).exec();
        await message.save(message);
        //save the reply as a message to the current chat
        await Chatdb.findOneAndUpdate(
          { _id: chatid },
          { $push: { messages: message._id } }
        ).exec();
        res.status(201).json({ msg: "message replied successfully" });
      } catch (error) {
        res.json({ msg: "reply creation is not successful", error });
      }
      res.status(201).send;
    } catch (error) {
      res.send(error);
    }
  } else {
    res.status(400).json({msg:'reply failed'})
  }

};
const deleteChatMessage = async(req,res)=>{
  const {chatId,messageId} = req.params
  console.log(chatId,messageId)
  try {
    //find the chat with ChatId and pull message that has _id of messageId
    await Chatdb.findOneAndUpdate(
      { _id: chatId },
      { $pull: { messages: messageId} }
    ).exec();
    //delete the message
    await Messagesdb.findByIdAndDelete(messageId)
    res.status(201).json({ msg: "message deleted successfully" });
  } catch (error) {
    res.json({ msg: "message deletion is not successful", error });
  }

}
const deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedmessage = await Messagesdb.findByIdAndDelete(id);
    res.status(202).json({ msg: "chat deleted", error: error });
  } catch (error) {
    res.status(401).json({ msg: "delete failed", error: error });
  }
};

module.exports = {
  deleteChat,
  deleteUserChat,
  replyMessage,
  reactToMessage,
  createMessage,
  getAllChats,
  updateMessage,
  deleteMessage,
  getMessages,
  createChat,
  getUserChats,
  blockChat,
  deleteChatMessage,
  unBlockChat,
};
