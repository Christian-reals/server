
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const EventDb = require('../models/eventdb');

//getting the directory outside controller
const dirnamearr= __dirname.split(`\\`)
const dirname = dirnamearr.splice(0,dirnamearr.length-1).join('/')

//setting up multer diskStorage method
const storage = multer.diskStorage({
	destination: `${dirname}/tmp/uploads`,
	filename: (req, file, cb) => {
		cb(null, file.fieldname +Date.now()+'.jpg')
	},
    
});

const upload = multer({ storage: storage,  limits: {
    fieldNameSize: 300,
    fileSize: 5048579, // 5Mb
  }}).single('image');
//the 
const createEvent = (async (req,res)=>{
    console.log(path.basename(__dirname))
    upload( req,res,async (err)=>{
        console.log(req.file)
        if (req.body && req.file) {
            if (err) {
                res.status(401).send(err)
            }
            else{
                const {title,category,venue,description,date} = req.body
                console.log(dirname)
                const event = new EventDb({
                    title:title,
                    category:category,
                    venue:venue,
                    description:description,
                    date:date,
                    image:{
                        data: fs.readFileSync(path.join(dirname + '/uploads/' + req.file.filename)),
                        contentType: 'image/*'
                    },
                    imageUrl:path.join(dirname + '/uploads/' + req.file.filename)
                })
                try {
                    await event.save(event)
                    res.status(201).json({msg:'event created successfully'})
                } catch (error) {
                    res.json({msg:'Upload is not successful',error:error})
                }
            }
        }
        else{
            res.status(404).json({msg:'request body cannot be empty'})
        }

    })
})

const getAllEvents = async (req,res)=>{
    try {
        const {image,...others}= await EventDb.find({}).lean()
        console.log(others)
        res.status(200).json(others)

    } catch (error) {
        res.status(404).json({msg:'failed: unable to process request',error})
    }
}
const getEvent = async (req,res)=>{
    const {id} = req.params
    try {
        const Event= await EventDb.findById({_id:id})
        res.status(200).json(Event)
    } catch (error) {
        res.status(404).json({msg:'failed',error})
    }
}


const updateEvent = async (req,res)=>{
    const {id} = req.params
    try {
        const updatedEvent = await EventDb.findByIdAndUpdate(id,req.body)
    } catch (error) {
        res.send(error)
    }
    
}

const deleteEvent = (req,res)=>{
    const {id} = req.params
    try {
        const deletedEvent = EventDb.findByIdAndDelete(id)
    } catch (error) {
        res.status(422).json({msg:'unable to delete event',error})
    }
    
}

const likeEvents = async (req,res)=>{
    const {id} = req.params
    try {
        const likedEvent = await EventDb.findOneAndUpdate({_id :id}, {$inc : {'likes' : 1}}).exec();

    } catch (error) {
        res.send(error)
    }
}
const registerEvents = async (req,res)=>{
    const {id} = req.params
    const {userid}=req.body
    try {
        await EventDb.findOneAndUpdate({_id :id}, {$push : {'participants' :userid }}).exec();

    } catch (error) {
        res.send(error)
    }
}

module.exports={createEvent,getAllEvents,updateEvent,deleteEvent,getEvent,registerEvents,likeEvents}