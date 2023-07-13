const express = require('express');
const { adminGetAllLoveQuests, deleteAccount, suspendAccount, activateAccount, banAccount, adminSignIn, adminSignup } = require('../controllers/admin');
const { deleteLoveQuest, answerQuestion } = require('../controllers/loveQuest');
const { getAllDevotionals, createDevotional, deleteDevotional } = require('../controllers/devotional');
const { singleImage, singleMulterImageHandler } = require('../middleware/handleImageUpload');
const { createDiscussion, getAllDiscussions, updateDiscussion, deleteDiscussion } = require('../controllers/discussion');
const { adminAuthMiddleware } = require('../middleware/jwt');
const { getAllEvents } = require('../controllers/events');
const { getAllMeetups, adminCreateMeetup, approveMeetup } = require('../controllers/meetups');
const route = express.Router();
//admin

//lovequest
route.get("/lovequest",adminGetAllLoveQuests);
route.post("/signin",adminSignIn);
route.post("/signup",adminSignup);
route.delete("/lovequest/:id", deleteLoveQuest);
route.put("/lovequest/:id", answerQuestion);

// account
route.delete("/account/:userId", deleteAccount);
route.put("/account/suspend/:userId", suspendAccount);
route.put("/account/activate/:userId", activateAccount);
route.put("/account/ban/:userId", banAccount);

//devotional
route.get("/devotional",getAllDevotionals);
route.delete("/devotional/:id",deleteDevotional);
route.put("/devotional/update/:id",deleteDevotional);
route.post("/devotional",adminAuthMiddleware,singleMulterImageHandler,createDevotional);

//discussion
route.post("/discussion", createDiscussion);
route.get("/discussion", getAllDiscussions);
route.put("/discussion/update/:id",  updateDiscussion);
route.delete("/discussion/:id",  deleteDiscussion);

//events
route.get("/events",adminAuthMiddleware, getAllEvents);
//meetup
route.get("/meetups",adminAuthMiddleware, getAllMeetups);
route.post("/meetup", adminAuthMiddleware, adminCreateMeetup);
route.put("/meetup/approve/:id", adminAuthMiddleware, approveMeetup);









module.exports = route

