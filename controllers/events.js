const fs = require("fs");
const path = require("path");
const multer = require("multer");
const EventDb = require("../models/eventdb");
const { Userdb } = require("../models/userdb");

//getting the directory outside controller
const dirnamearr = __dirname.split(`\\`);
const dirname = dirnamearr.splice(0, dirnamearr.length - 1).join("/");

//setting up multer diskStorage method
const storage = multer.diskStorage({
  destination: `${dirname}/tmp/uploads`,
  filename: (req, file, cb) => {
    cb(null, file.fieldname + Date.now() + ".jpg");
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fieldNameSize: 300,
    fileSize: 5048579, // 5Mb
  },
}).single("image");
//the
const createEvent = async (req, res) => {
  console.log(path.basename(__dirname));
  upload(req, res, async (err) => {
    console.log(req.file);
    if (req.body && req.file) {
      if (err) {
        res.status(401).json({msg: 'fields are not correctly filled',err});
      } else {
        const { title, category, venue, description, date } = req.body;
        console.log(dirname);
        const event = new EventDb({
          title: title,
          category: category,
          venue: venue,
          description: description,
          date: date,
          // image:{
          //     data: fs.readFileSync(path.join(dirname + 'tmp/uploads/' + req.file.filename)),
          //     contentType: 'image/*'
          // },
          imageUrl: path.join(dirname + "tmp/uploads/" + req.file.filename),
        });
        try {
          await event.save(event);
          res.status(201).json({ msg: "event created successfully" });
        } catch (error) {
          res.json({ msg: "event creation is not successful", error: error });
        }
      }
    } else {
      res.status(404).json({ msg: "request body cannot be empty" });
    }
  });
};

const getAllEvents = async (req, res) => {
  try {
    const events = await EventDb.find({}).lean();

    res.status(200).json(events);
  } catch (error) {
    res.status(404).json({ msg: "failed: unable to process request", error });
  }
};
const getEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const Event = await EventDb.findById({ _id: id });
    res.status(200).json(Event);
  } catch (error) {
    res.status(404).json({ msg: "failed", error });
  }
};

const getUserEvents = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await Userdb.findOne({ _id: userId });
    const userEvents = user.events;
    res.status(201).json({ data: userEvents });
  } catch (error) {
    res.status(400).json({ msg: "could not fetch event", error });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedEvent = await EventDb.findByIdAndUpdate(id, req.body);
  } catch (error) {
    res.send(error);
  }
};

const deleteEvent = (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = EventDb.findByIdAndDelete(id);
  } catch (error) {
    res.status(422).json({ msg: "unable to delete event", error });
  }
};

const likeEvents = async (req, res) => {
  const { id } = req.params;
  try {
    const likedEvent = await EventDb.findOneAndUpdate(
      { _id: id },
      { $inc: { likes: 1 } }
    ).exec();
  } catch (error) {
    res.send(error);
  }
};
const registerEvents = async (req, res) => {
  const { id } = req.params;
  const { userid } = req.body;
  try {
    await EventDb.findOneAndUpdate(
      { _id: id },
      { $push: { participants: userid } }
    ).exec();
  } catch (error) {
    res.status(400).json({msg:'event registration failed',error});
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getEvent,
  registerEvents,
  likeEvents,
  getUserEvents,
};
