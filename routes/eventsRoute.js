
const express = require('express')
const {createEvent,getAllEvents,updateEvent,deleteEvent,getEvent}=require('../controllers/Events')
const route=  express.Router()

route.post('/event',createEvent)
route.get('/event',getAllEvents)
route.get('/event/:id',getEvent)
route.put('/event/:id',updateEvent)
route.delete('/event/:id',deleteEvent)




module.exports = route