const express = require("express");
const {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getEvent,
  getUserEvents,
  registerEvents,
  likeEvents,
} = require("../controllers/events");
const { getAccount, deleteAccount, getAllAccounts } = require("../controllers/account");
const {
  login,
  register,
  verifyMail,
  createProfile,
  changePassword,
  verifyToken,
} = require("../controllers/auth");
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
const {
  getAllMeetups,
  registerMeetups,
  likeMeetups,
  getMeetup,
  createMeetup,
  deleteMeetup,
  updateMeetup,
  getUserMeetups,
} = require("../controllers/meetups");
const {
  createDiscussion,
  getAllDiscussions,
  deleteDiscussion,
  updateDiscussion,
  reactToDiscussion,
  replyDiscussion,
  getDiscussion,
} = require("../controllers/discussion");
const {
  createLoveQuest,
  getAllLoveQuests,
  deleteLoveQuest,
  updateLoveQuest,
  likeLoveQuest,
  getLoveQuest,
  dislikeLoveQuest,
} = require("../controllers/loveQuest");
//auth middleware
const auth = require("../middleware/jwt").authMiddleware;
const verify = require("../middleware/jwt").verifyToken;

const route = express.Router();
// require('./chatRoutes')

route.get("/", (req, res) => {
  res.status(200).json({ message: "REquest sucessfull" });
});

//acount
route.post("/account/delete", auth, deleteAccount);
route.post("/account/:userId", auth, getAccount);
route.get("/accounts", auth,getAllAccounts);

//auth
route.post("/register", register);
route.post("/login", login);
route.post("/profile", createProfile);
route.get("/verify", verify);
route.put("/changePassword", changePassword);
route.get("/verifyToken", auth, verifyToken);

//Events
route.post("/event", auth, createEvent);
route.get("/event",auth, getAllEvents);
route.get("/event/:id", auth, getEvent);
route.get("/event/myEvents/:userId", auth,getUserEvents);
route.post("/event/register/:id",auth, registerEvents);
route.get("/event/like/:id", auth,likeEvents);
route.put("/event/:id", auth, updateEvent);
route.delete("/event/:id", auth, deleteEvent);

//Meetups
route.post("/meetup", auth, createMeetup);
route.get("/meetup", auth,getAllMeetups);
route.get("/meetup/:id", auth, getMeetup);
route.get("/meetup/myMeetups/:userId", auth,getUserMeetups);
route.post("/meetup/register/:id", auth,registerMeetups);
route.get("/meetup/like/:id", auth,likeMeetups);
route.put("/meetup/:id", auth, updateMeetup);
route.delete("/meetup/:id", auth, deleteMeetup);

// discussion
route.post("/discussion",auth, createDiscussion);
route.get("/discussion", auth,getAllDiscussions);
route.get("/discussion/:id", auth,getDiscussion);
route.post("/discussion/react/:id",auth, reactToDiscussion);
route.post("/discussion/reply/:id",auth, replyDiscussion);
route.put("/discussion/:id", auth, updateDiscussion);
route.delete("/discussion/:id", auth, deleteDiscussion);

//lovequest
route.post("/lovequest",auth, createLoveQuest);
route.get("/lovequest",auth, getAllLoveQuests);
route.get("/lovequest/:id",auth, getLoveQuest);
route.get("/lovequest/like/:id",auth,likeLoveQuest);
route.get("/lovequest/dislike/:id",auth,dislikeLoveQuest)
route.put("/lovequest/:id", auth, updateLoveQuest);
route.delete("/lovequest/:id", auth, deleteLoveQuest);

//chats and message
route.post("/chat/message", auth, createMessage);
route.get("/chats/:id", auth, getUserChats);
route.get("/chats", auth, getAllChats);
route.post("/chat", auth, createChat);
route.get("/chat/message/:id", auth, getMessages);
route.put("/chat/message/:id", auth, updateMessage);
route.post("/chat/message/react/:id", auth, reactToMessage);
route.post("/chat/message/reply/:id", auth, replyMessage);
route.delete("/chat/message/:id", auth, deleteMessage);
route.delete("/chat/:id", auth, deleteChat);

module.exports = route;
