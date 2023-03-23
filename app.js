const app = require('express')()
const route = require('./routes/routes')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const http = require('http')
const socket = require('socket.io')
const formatmsg = require('./utils/formatMessage')
require('./db/connectdb')
const dotenv=require('dotenv')
const cors = require('cors')
const server= http.createServer(app)



// // Set your secret key. Remember to switch to your live secret key in production.
// // See your keys here: https://dashboard.stripe.com/apikeys
// const stripe = require('stripe')('sk_test_51MnU8aHwyZAkqQEwMdmgXkK9VB6vf2PB1qaJUoT8rjRHCov9XZ6zPf3vzi39yZP6pgiQ8sH5pX5nv02jlnglKD9v00QagTg0Fi');

// // The price ID passed from the client
// //   const {priceId} = req.body;
// const priceId = '{{PRICE_ID}}';

// const session = await stripe.checkout.sessions.create({
//   mode: 'subscription',
//   line_items: [
//     {
//       price: priceId,
//       // For metered billing, do not pass quantity
//       quantity: 1,
//     },
//   ],
//   // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
//   // the actual Session ID is returned in the query parameter when your customer
//   // is redirected to the success page.
//   success_url: 'https://example.com/success.html?session_id={CHECKOUT_SESSION_ID}',
//   cancel_url: 'https://example.com/canceled.html',
// });

// Redirect to the URL returned on the Checkout Session.
// With express, you can redirect with:
//   res.redirect(303, session.url);


const io = socket(server,{
  cors: {
    origin: `*`,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
  },
})
app.use(express.urlencoded({extended:false}))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use('/',route)




const botname = 'Crbot'


io.on('connection',(socket)=>{
  // socket.emit('connect',formatmsg(botname,' welcome to chatcord'))
  console.log('connected to socket',Date().toLocaleString())
  socket.on('joinRoom',({userid,roomid})=>{
    socket.join(roomid)
    socket.emit('info',{userid,roomid})
    socket.emit('info', formatmsg(botname,' welcome to chatcord'))
    socket.broadcast.to(roomid).emit ('info', formatmsg(botname,`${userid} has joined the chat`))
    socket.on('chatMessage',message=>{
        socket.broadcast.to(roomid).emit('message',formatmsg(userid,message))
    })
    socket.on('videoCall',message=>{
      socket.broadcast.to(roomid).emit('videoCall',formatmsg(userid,message))
  })
})
  socket.on('disconnect',()=>{
    io.emit('disconnected','disconnected')
  })
})

server.listen(process.env.PORT||5000,()=>{
  console.log(`server is running on ${process.env.PORT}`)
})


