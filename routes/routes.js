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
route.get("/accounts", getAllAccounts);

//auth
route.post("/register", register);
route.post("/login", login);
route.post("/profile", createProfile);
route.get("/verify", verify);
route.put("/changePassword", changePassword);
route.get("/verifyToken", auth, verifyToken);

//Events
route.post("/event", auth, createEvent);
route.get("/event", getAllEvents);
route.get("/event/:id", auth, getEvent);
route.get("/event/myEvents/:userId", getUserEvents);
route.post("/event/register/:id", registerEvents);
route.get("/event/like/:id", likeEvents);
route.put("/event/:id", auth, updateEvent);
route.delete("/event/:id", auth, deleteEvent);

//Meetups
route.post("/meetup", auth, createMeetup);
route.get("/meetup", getAllMeetups);
route.get("/meetup/:id", auth, getMeetup);
route.get("/meetup/myMeetups/:userId", getUserMeetups);
route.post("/meetup/register/:id", registerMeetups);
route.get("/meetup/like/:id", likeMeetups);
route.put("/meetup/:id", auth, updateMeetup);
route.delete("/meetup/:id", auth, deleteMeetup);

// discussion
route.post("/discussion", createDiscussion);
route.get("/discussion", getAllDiscussions);
route.get("/discussion/:id", getDiscussion);
route.post("/discussion/react/:id", reactToDiscussion);
route.post("/discussion/reply/:id", replyDiscussion);
route.put("/discussion/:id", auth, updateDiscussion);
route.delete("/discussion/:id", auth, deleteDiscussion);

//lovequest
route.post("/lovequest", createLoveQuest);
route.get("/lovequest", getAllLoveQuests);
route.get("/lovequest/:id", getLoveQuest);
route.get("/lovequest/like/:id",likeLoveQuest);
route.get("/lovequest/dislike/:id",dislikeLoveQuest)
route.put("/lovequest/:id", auth, updateLoveQuest);
route.delete("/lovequest/:id", auth, deleteLoveQuest);

//chats and message
route.post("/chat/message", auth, createMessage);
route.get("/chats/:id", getUserChats);
route.get("/chats", auth, getAllChats);
route.post("/chat",  createChat);
route.get("/chat/message/:id", auth, getMessages);
route.put("/chat/message/:id", auth, updateMessage);
route.post("/chat/message/react/:id", auth, reactToMessage);
route.post("/chat/message/reply/:id", auth, replyMessage);
route.delete("/chat/message/:id", auth, deleteMessage);
route.delete("/chat/:id", auth, deleteChat);

module.exports = route;
