const express = require("express");
const {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getEvent,
} = require("../controllers/events");
const {getAccount,deleteAccount} =require('../controllers/account')
const { login, register, verifyMail,createProfile, changePassword } = require("../controllers/auth");
const {
  createMessage,
  getAllChats,
  updateMessage,
  deleteMessage,
  deleteChat,
  reactToMessage,
  replyMessage,
  createChat,
  getUserChats,
  getMessages,
} = require("../controllers/chat");
//auth middleware
const auth = require('../middleware/jwt').authMiddleware
const verify = require('../middleware/jwt').verifyToken

const route = express.Router();
// require('./chatRoutes')

route.get('/',(req,res)=>{
  res.status(200).json({message: 'REquest sucessfull'})
})


//acount
route.post("/deleteAccount",deleteAccount );
route.post("/getAccount", getAccount);


//auth
route.post("/register", register);
route.post("/login", login);
route.post("/profile", createProfile);
route.get('/verify',verify)
route.put('/changePassword',changePassword)


//Events
route.post("/event", createEvent);
route.get("/event", getAllEvents);
route.get("/event/:id", getEvent);
route.put("/event/:id", updateEvent);
route.delete("/event/:id", deleteEvent);


//chats and message
route.post("/chat/message",auth, createMessage);
route.get("/chats/:id",auth, getUserChats);
route.get("/chats",auth, getAllChats);
route.post('/chat',auth,createChat)
route.get("/chat/message/:id", getMessages);
route.put("/chat/message/:id",auth, updateMessage);
route.post("/chat/message/react/:id",auth, reactToMessage);
route.post("/chat/message/reply/:id",auth, replyMessage);
route.delete("/chat/message/:id",auth, deleteMessage);
route.delete("/chat/:id",auth, deleteChat);



module.exports = route;
