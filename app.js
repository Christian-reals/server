const app = require("express")();
const route = require("./routes/routes");
const adminRoutes = require("./routes/adminRoutes");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const socket = require("socket.io");
const formatmsg = require("./utils/formatMessage");
require("./db/connectdb");
const dotenv = require("dotenv");
const cors = require("cors");
const { Userdb } = require("./models/userdb");
// const { ExpressPeerServer } = require("peer");
const server = http.createServer(app);
const webPush = require("web-push");

const expressLogging = require("express-logging");

const logger = require("logops");
const { sendNotificationEmail } = require("./utils/mailer");
const Notifications = require("./models/notification");
const Discussiondb = require("./models/discussionsdb");

// app.use(expressLogging(logger));
//set up express middlewares
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/", route);
app.use("/admin", adminRoutes);

// //SETTING PEER SERVER
// const peerServer = ExpressPeerServer(server, {
//   debug: true,
//   path: "/", // change 'myapp' to whatever path you'd like to use
// });

// app.use("/peerjs", peerServer); // endpoint for connecting to PeerJS server

//setting up web-push

webPush.setVapidDetails(
  "mailto:ayomikunfaluyi@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

//subscribe to webpush

app.post("/subscribe", async (req, res) => {
  console.log("subscribe");
  try {
    console.log(req.body);
    //Get push subscription object

    const { subscription, userId } = req.body;

    //store subcription to database

    await Userdb.findByIdAndUpdate(
      userId,
      { subscription: subscription },
      { upsert: true }
    );

    //create payload
    const payload = JSON.stringify({
      title: "Welcome back",
      body: "Please respect the website guidelines",
    });

    //Pass object into sendNotification
    webPush
      .sendNotification(subscription, payload)
      .catch((err) => {
        console.log(err);
      })
      .then((data) => {
        console.log("pushSent");
        res.status(200).json({ msg: "success", data });
      });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

//setting up stripe

const io = socket(server, {
  cors: {
    origin: `*`,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
  },
});

const botname = "Crbot";

//socket function
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  // Set the user ID as a property of the socket object
  socket.userId = userId;

  // video call set up
  socket.emit("me", userId);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    console.log("calling", userToCall, from);
    socket.emit("callUser", { to: userToCall, signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  //socket for messaging, chatting and notifications
  // socket.emit('connect',formatmsg(botname,' welcome to chatcord'))
  socket.on("joinRoom", ({ userid, roomid }) => {
    socket.join(roomid);
    socket.emit("info", { userid, roomid });
    socket.emit("info", formatmsg(botname, " welcome to chatcord"));
    socket.broadcast
      .to(roomid)
      .emit("info", formatmsg(botname, `${userid} has joined the chat`));
    socket.on("chatMessage", async (message) => {
      try {
        const { recieverId, userId } = message;
        console.log(message);
        //get sender username
        const user = await Userdb.findById(userId).populate(
          "registrationDataId"
        );
        const username = user.registrationDataId.userName;
        // Find the recipient's push subscription object
        const reciever = await Userdb.findById(recieverId).populate(
          "registrationDataId"
        );
        const subscription = reciever?.subscription;

        // Create payload
        const payload = JSON.stringify({
          title: "New Message",
          body: `${reciever.registrationDataId.userName} You have a new message from ${username}`,
        });

        // Send push notification
        webPush
          .sendNotification(subscription, payload)
          .catch((err) => {
            console.log(err);
          })
          .then(() => {
            console.log("Push notification sent");
          });

        // Broadcast message to other users in the room
        socket.broadcast.to(roomid).emit("message", formatmsg(userid, message));
      } catch (error) {
        console.log(error);
      }

      socket.broadcast.to(roomid).emit("message", formatmsg(userid, message));
    });
    socket.on("videoCall", (message) => {
      socket.broadcast.to(roomid).emit("videoCall", formatmsg(userid, message));
    });
  });


  //socket for discussion rooms
  socket.on("joinDiscusionRoom", ({ userid, roomid }) => {
    console.log('discussion' ,userId)
    socket.join(roomid);
    socket.broadcast
      .to(roomid)
      .emit("info", formatmsg(botname, `${userid} has joined the chat`));
      console.log(formatmsg(botname, `${userid} has joined the chat`))
    socket.on("discussionMessage", async (message) => {
      console.log('discussion')
      try {
        const { userId } = message;
        console.log(message);
        //get sender username
        const user = await Userdb.findById(userId).populate(
          "registrationDataId"
        );
        const username = user.registrationDataId.userName;

        const discussion = Discussiondb.findById(roomid).then(
          async (discuss) => {
            await Promise.all(
              discuss.participants.map(async (participant) => {
                // Find the recipient's push subscription object
                const reciever = await Userdb.findById(participant).populate(
                  "registrationDataId"
                );
                const notifications = {
                  from: user._id,
                  message:  `${username} added a new comment on the discussion topic : ${discuss.topic}`,
                  to: reciever._id,
                  seen: false,
                  notificationType: "discussion",
                  date: Date.now(),
                };
                // create the recipient's notification in the database
          
                const newNotification = await Notifications.create(notifications);
                newNotification.save();
                await sendNotificationEmail(
                  reciever.registrationDataId.email,
                  `${username} added a new comment on the discussion topic : ${discuss.topic}`,
                  discussion,
                  username,
                  user.avatar,
                  Date.now()
                );
                const subscription = reciever?.subscription;

                // Create payload
                const payload = JSON.stringify({
                  title: "New Message",
                  body: `${username} commented on a discussion you are involved in  ${discuss.topic}`,
                });

                // Send push notification
                webPush
                  .sendNotification(subscription, payload)
                  .catch((err) => {
                    console.log(err);
                  })
                  .then(() => {
                    console.log("Push notification sent");
                  });
              })
            );
          }
        );

        // Broadcast message to other users in the room
        socket.broadcast
          .to(roomid)
          .emit("discussion", formatmsg(userid, message));
      } catch (error) {
        console.log(error, 'catch error');
      }

      socket.broadcast
        .to(roomid)
        .emit("discussion", formatmsg(userid, message));
    });
  });

  // notification socket
  socket.on("notification", async (notification) => {
    const { from, reciever, message, type } = notification;
    console.log("notify");
    console.log(message, reciever);

    try {
      const notifications = {
        from: from,
        message: message,
        to: reciever,
        seen: false,
        notificationType: "message",
        date: Date.now(),
      };
      // create the recipient's notification in the database

      const newNotification = await Notifications.create(notifications);
      newNotification.save();

      //get user
      const user = await Userdb.findById(reciever).populate(
        "registrationDataId"
      );

      console.log(user?.registrationDataId?.userName);

      await socket.emit("notify", {
        from: from,
        to: reciever,
        message: message,
      });
      console.log("notified hopefully");

      const sender = await Userdb.findById(from).populate("registrationDataId");

      await sendNotificationEmail(
        user.registrationDataId.email,
        message,
        notifications.notificationType,
        sender.registrationDataId.userName,
        sender.avatar,
        notifications.date
      );

      // Find the recipient's push subscription object
      const recipient = await Userdb.findById(reciever);
      // console.log(recipient,'recioient data')
      const subscription = recipient.subscription;

      if (subscription) {
        // Create payload
        const payload = JSON.stringify({
          title: "New notification",
          body: message,
        });

        // Send push notification
        webPush
          .sendNotification(subscription, payload)
          .catch((err) => {
            console.log(err);
          })
          .then(() => {
            console.log("Push notification sent");
          });
      } else {
        console.log("Recipient has no push subscription.");
      }
    } catch (error) {
      console.log(error,'push error');
    }
  });
  socket.on("disconnect", () => {
    io.emit("disconnected", "disconnected");
  });
  socket.on("error", (error) => {
    io.emit("error", error);
    console.log('socket error' , error)
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`server is running on ${process.env.PORT}`);
});
