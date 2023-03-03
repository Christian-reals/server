const express = require("express");
const {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getEvent,
} = require("../controllers/events");
const { login, register, verifyMail,createProfile } = require("../controllers/auth");
const {
  createMessage,
  getAllChats,
  updateMessage,
  deleteMessage,
  deleteChat,
  reactToMessage,
  getChat,
  replyMessage,
  createChat,
} = require("../controllers/chat");
//auth middleware
const auth = require('../middleware/jwt').authMiddleware
const verify = require('../middleware/jwt').verifyToken

const route = express.Router();
// require('./chatRoutes')

route.get('/',(req,res)=>{
  res.status(200).json({message: 'REquest sucessfull'})
})


//auth
route.post("/register", register);
route.post("/login", login);
route.post("/profile", createProfile);
route.get('/verify',verify)


//Events
route.post("/event", createEvent);
route.get("/event", getAllEvents);
route.get("/event/:id", getEvent);
route.put("/event/:id", updateEvent);
route.delete("/event/:id", deleteEvent);


//chats and message
route.post("/chat/message",auth, createMessage);
route.get("/chat",auth, getAllChats);
route.post('/chat',auth,createChat)
route.get("/chat/:id",auth, getChat);
route.put("/chat/message/:id",auth, updateMessage);
route.post("/chat/message/react/:id",auth, reactToMessage);
route.post("/chat/message/reply/:id",auth, replyMessage);
route.delete("/chat/message/:id",auth, deleteMessage);
route.delete("/chat/:id",auth, deleteChat);

module.exports = route;
