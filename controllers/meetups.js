const fs = require("fs");
const path = require("path");
const multer = require("multer");
const MeetupDb = require("../models/meetupdb");
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
const createMeetup = async (req, res) => {
  upload(req, res, async (err) => {
    console.log(req.file);
    if (req.body && req.file) {
      if (err) {
        res.status(401).send(err);
      } else {
        const { title, category, venue, description, date } = req.body;
        console.log(dirname);
        const event = new MeetupDb({
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

const getAllMeetups = async (req, res) => {
  try {
    const events = await MeetupDb.find({}).lean();

    res.status(200).json(events);
  } catch (error) {
    res.status(404).json({ msg: "failed: unable to process request", error });
  }
};
const getMeetup = async (req, res) => {
  const { id } = req.params;
  try {
    const Event = await MeetupDb.findById({ _id: id });
    res.status(200).json(Event);
  } catch (error) {
    res.status(404).json({ msg: "failed", error });
  }
};

const getUserMeetups = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await Userdb.findOne({ _id: userId });
    const userEvents = user.events;
    res.status(201).json({ data: userEvents });
  } catch (error) {
    res.status(400).json({ msg: "could not fetch event", error });
  }
};

const updateMeetup = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedEvent = await MeetupDb.findByIdAndUpdate(id, req.body);
  } catch (error) {
    res.send(error);
  }
};

const deleteMeetup = (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = MeetupDb.findByIdAndDelete(id);
  } catch (error) {
    res.status(422).json({ msg: "unable to delete event", error });
  }
};

const likeMeetups = async (req, res) => {
  const { id } = req.params;
  try {
    const likedEvent = await MeetupDb.findOneAndUpdate(
      { _id: id },
      { $inc: { likes: 1 } }
    ).exec();
    res.status(201).json({ msg: "successful" });
  } catch (error) {
    res.send(error);
  }
};
const registerMeetups = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    await MeetupDb.findOneAndUpdate(
      { _id: id },
      { $push: { participants: userId } }
    ).exec();
    await Userdb.findOneAndUpdate(
      { _id: userId },
      { $push: { meetups: id } }
    ).exec();
    res.status();
  } catch (error) {
    res.send(error);
  }
};

module.exports = {

};
