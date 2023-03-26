const app = require("express")();
const route = require("./routes/routes");
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
const { ExpressPeerServer } = require("peer");
const server = http.createServer(app);
const webPush = require("web-push");
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)


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

//SETTING PEER SERVER
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/", // change 'myapp' to whatever path you'd like to use
});

app.use("/peerjs", peerServer); // endpoint for connecting to PeerJS server

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
        //get sender username
        const user = await Userdb.findById(userId).populate(
          "registrationDataId"
        );
        const username = user.registrationDataId.userName;
        // Find the recipient's push subscription object
        const reciever = await Userdb.findById(recieverId);
        const subscription = reciever?.subscription;

        // Create payload
        const payload = JSON.stringify({
          title: "New Message",
          body: `You have a new message from ${username}`,
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
  socket.on("notification", async ({ from, reciever, message }) => {
    console.log("notify");
    try {
      const user = await Userdb.findByIdAndUpdate(
        reciever,
        { $push: { notifications: { from: from, message: message } } },
        { new: true }
      );
      const recipientSockets = await io.in(reciever.toString()).fetchSockets();
      recipientSockets.forEach((socket) => {
        socket.emit("notification", { from: from, message: message });
      });
      console.log("notify done");
      // Find the recipient's push subscription object
      const recipient = await Userdb.findById(reciever);
      const subscription = recipient.subscription;

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
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("disconnect", () => {
    io.emit("disconnected", "disconnected");
  });
  socket.on("error", (error) => {
    io.emit("error", error);
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`server is running on ${process.env.PORT}`);
});
