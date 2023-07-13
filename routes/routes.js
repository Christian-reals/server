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
  deleteUserEvents,
} = require("../controllers/events");
const { getAccount, deleteAccount, getAllAccounts, blockUser, createAvatar, getUserBlockedAccounts, getNotifications, markNotificationAsSeen, markManyNotificationsAsSeen, likeAccount, unlikeAccount, addFriend, removeFriend, getAllAccountsMail, uploadImages, deleteUserImage } = require("../controllers/account");
const {
  login,
  register,
  verifyMail,
  createProfile,
  changePassword,
  verifyToken,
  resetPassword,
  forgotPasswordLink,
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
  blockChat,
  deleteUserChat,
  deleteChatMessage,
  unBlockChat,
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
  unregisterMeetups,
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
const { verifyResetPasswordToken, adminAuthMiddleware } = require("../middleware/jwt");
const { createCheckout, checkUserPlan, checkPaymentStatus, getPaymentMethod, stripeWebhook } = require("../controllers/stripe");
const { singleImage, userImages } = require("../middleware/handleImageUpload");
const { adminGetAllLoveQuests } = require("../controllers/admin");
const { createFeedback, getAllFeedback, getFeedbackById, deleteFeedbackById, replyFeedback, editReply } = require("../controllers/feedback");
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
//get a single account 
route.get("/account/:userId", getAccount);
// get all accounts
route.get("/accounts",getAllAccounts);
//get a list of all verified mails
route.get("/accounts/mail",getAllAccountsMail);
//get blocked accounts
route.get("/accounts/blockedAccounts/:userId", auth,getUserBlockedAccounts);
route.put("/accounts/block/:id",auth,blockUser)
route.put("/account/like/:accountId",auth,likeAccount)
route.put("/account/unLike/:accountId",auth,unlikeAccount)
route.put("/account/addFriend/:friendId",auth,addFriend)
route.put("/account/removeFriend/:friendId",auth,removeFriend)
//avatar
route.post('/account/createAvatar',auth,singleImage,createAvatar)
//upload images
route.post("/account/upload-images", auth,userImages, uploadImages);
//delete user Images
route.put('/account/delete-user-image/:id',auth,deleteUserImage)
route.get('/account/notifications/:userId', getNotifications)
route.put('/account/notifications/mark/:notificationId', markNotificationAsSeen)
route.put('/account/notifications/markMany/:userId', markManyNotificationsAsSeen)



//auth
route.post("/register", register);
route.post("/login", login);
route.post("/profile", createProfile);
route.get("/verify", verify);
route.get("/resetPassword/verify", verifyResetPasswordToken);
route.put("/changePassword",auth, changePassword);
route.put("/resetPassword/:id", resetPassword);
route.post("/resetPassword/link", forgotPasswordLink);
route.get("/verifyToken", auth, verifyToken);

//payments

route.post('/payment/checkout',createCheckout)
route.get('/payment/checkPlan/:userId',checkUserPlan)
route.get('/payment/paymentMethod/:userId',getPaymentMethod)
route.get('/payment/checkPaymentStatus/:userId',checkPaymentStatus)
route.post('/payment/webhook',stripeWebhook)





//Events
route.post("/event", adminAuthMiddleware, createEvent);
route.get("/event",auth, getAllEvents);
route.get("/event/:id", auth, getEvent);
route.get("/event/myEvents/:userId",auth,getUserEvents);
route.post("/event/register/:id",auth, registerEvents);
route.post("/event/delete/:id",auth, deleteUserEvents);
route.get("/event/like/:id", auth,likeEvents);
route.put("/event/:id", adminAuthMiddleware, updateEvent);
route.delete("/event/:id", adminAuthMiddleware, deleteEvent);

//Meetups
route.post("/meetup", auth, createMeetup);
route.get("/meetup", auth,getAllMeetups);
route.get("/meetup/:id", auth, getMeetup);
route.get("/meetup/myMeetups/:userId", auth,getUserMeetups);
route.post("/meetup/register/:id", auth,registerMeetups);
route.get("/meetup/like/:id", auth,likeMeetups);
route.put("/meetup/delete/:id",auth, unregisterMeetups);
route.put("/meetup/:id", adminAuthMiddleware, updateMeetup);
route.delete("/meetup/:id", adminAuthMiddleware, deleteMeetup);


//Feedbacks
route.post("/feedback", auth, createFeedback);
route.get("/feedback", adminAuthMiddleware,getAllFeedback);
route.get("/feedback/:id", adminAuthMiddleware, getFeedbackById);
route.put("/feedback/reply:id", adminAuthMiddleware, replyFeedback);
route.put("/feedback/reply/edit:id", adminAuthMiddleware, editReply);
route.delete("/feedback/:id", adminAuthMiddleware,deleteFeedbackById);

// discussion
route.get("/discussion/:id", auth,getDiscussion);
route.post("/discussion/react/:id",auth, reactToDiscussion);
route.post("/discussion/reply/:id",auth, replyDiscussion);
route.get("/discussion",auth, getAllDiscussions);


//lovequest
route.post("/lovequest",auth, createLoveQuest);
route.get("/lovequest",getAllLoveQuests);
route.get("/lovequest/:id",auth, getLoveQuest);
route.put("/lovequest/like/:id",auth,likeLoveQuest);
route.put("/lovequest/dislike/:id",auth,dislikeLoveQuest)
route.put("/lovequest/:id", auth, updateLoveQuest);
route.delete("/lovequest/:id", auth, deleteLoveQuest);

//chats and message
route.post("/chat/message", auth, createMessage);
route.get("/chats/:id",  getUserChats);
route.get("/chats", auth, getAllChats);
route.post("/chat", auth,createChat);
route.get("/chat/message/:id",auth, getMessages);
route.put("/chat/message/:id", auth, updateMessage);
route.post("/chat/message/react/:id",auth, reactToMessage);
route.post("/chat/message/reply/:id", auth,replyMessage);
route.delete("/chat/message/:id", auth, deleteMessage);
route.delete("/chat/:id", auth, deleteChat);
route.delete("/chat/:chatId/message/:messageId",auth, deleteChatMessage);
route.put("/chat/delete/:id",auth, deleteUserChat);
route.put("/chat/block/:id", auth,blockChat);
route.put("/chat/unblock/:friendId", auth,unBlockChat);



module.exports = route;
