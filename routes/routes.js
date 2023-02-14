const express = require("express");
const {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getEvent,
} = require("../controllers/Events");
const { login, register } = require("../controllers/auth");
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
const auth = require('../middleware/jwt')

const route = express.Router();
// require('./chatRoutes')

//auth
route.post("/register", register);
route.post("/login", login);


//Events
route.post("/event", createEvent);
route.get("/event", getAllEvents);
route.get("/event/:id", getEvent);
route.put("/event/:id", updateEvent);
route.delete("/event/:id", deleteEvent);


//chats and message
route.post("/chat/message", createMessage);
route.get("/chat", getAllChats);
route.post('/chat',createChat)
route.get("/chat/:id", getChat);
route.put("/chat/message/:id",auth, updateMessage);
route.post("/chat/message/react/:id",auth, reactToMessage);
route.post("/chat/message/reply/:id",auth, replyMessage);
route.delete("/chat/message/:id",auth, deleteMessage);
route.delete("/chat/:id",auth, deleteChat);

module.exports = route;
