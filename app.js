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
})
  socket.on('disconnect',()=>{
    io.emit('disconnected','disconnected')
  })
})

server.listen(process.env.PORT||5000,()=>{
  console.log(`server is running on ${process.env.PORT}`)
})


