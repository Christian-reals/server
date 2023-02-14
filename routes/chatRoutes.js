const {
  createMessage,
  getAllChats,
  updateMessage,
  deleteMessage,
  deleteChat,
  reactToMessage,
  getChat,
  replyMessage,
} = require("../controllers/chat");
const express = require("express");
const route = express.Router();


route.post("/chat/message", createMessage);
route.get("/chat", getAllChats);
route.get("/chat/:id", getChat);
route.put("/chat/message/:id", updateMessage);
route.post("/chat/message/:id", reactToMessage);
route.post("/chat/message/:id", replyMessage);
route.delete("/chat/message/:id", deleteMessage);
route.delete("/chat/:id", deleteChat);

module.exports=route