const fs = require("fs");
const path = require("path");
const multer = require("multer");
const EventDb = require("../models/eventdb");
const { Userdb } = require("../models/userdb");
const { sendEventRegistrationEmail } = require("../utils/mailer");

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
    console.log(req.file,'file');
    console.log(req.body,'body');

    if (req.body || req.file) {
      if (err) {
        res.status(401).json({ msg: "fields are not correctly filled", err });
      } else {
        const { title, category, venue, description, date } = req.body;
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
          imageUrl:req?.file&& path.join(dirname + "tmp/uploads/" + req?.file.filename),
        });
        try {
          await event.save(event);
          res.status(201).json({ msg: "event created successfully" });
        } catch (error) {
          res.status(500).json({ msg: "event creation is not successful", error: error });
        }
      }
    } else {
      res.status(404).json({ msg: "request body cannot be empty" });
    }
  });
};

const getAllEvents = async (req, res) => {
  try {
    const events = await EventDb.find({}).populate('attendee').lean();

    res.status(200).json({events,msg:'events found'});
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
  const { userId } = req.params;
  try {
    const user = await Userdb.findOne({ _id: userId })
      .populate("events")
      .exec();
    const userEvents = user.events;
    console.log("events");
    if (userEvents.length > 0) {
      res.status(201).json({ data: userEvents, msg: "user events found" });
    } else {
      res.status(400).json({ msg: "user has no events" });
    }
  } catch (error) {
    res.status(400).json({ msg: "could not fetch event", error });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  console.log(req.body,'body')
  try {
    upload(req, res, async (err) => {
      console.log(req.file);
      if (req.body || req.file) {
        if (err) {
          res.status(401).json({ msg: "fields are not correctly filled", err });
        } else {
          const { title, category, venue, description, date } = req.body;
          const update = {
            title: title,
            category: category,
            venue: venue,
            description: description,
            date: date,
            // image:{
            //     data: fs.readFileSync(path.join(dirname + 'tmp/uploads/' + req.file.filename)),
            //     contentType: 'image/*'
            // },
            imageUrl: req.file && path.join(dirname + "tmp/uploads/" + req.file.filename),
          };
          const updatedEvent = await EventDb.findByIdAndUpdate(id, update);
          console.log(updatedEvent)
          res.status(200).json({ msg: "event updated"});
        }
      } else {
        res.status(404).json({ msg: "request body cannot be empty" });
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: "event creation is not successful", error: error });

  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  try {
    const deletedEvent = await EventDb.findByIdAndDelete(id);
    console.log(deletedEvent)
    res.status(200).json({ msg: "event deleted", });

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
    if (likedEvent) {
      res.status(200).json({ msg: "request sucessfull" });
    }
  } catch (error) {
    res.status(400).json({ msg: "request not sucessfull", error });
  }
};
const registerEvents = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const user = await Userdb.findById(userId).populate("registrationDataId");
    const userRegistered = user.events.filter((event) => {
      return event.toString() == id;
    });
    if (userRegistered.length > 0) {
      res.status(201).json({ msg: "event already exists" });
    } else {
      const event = await EventDb.findOne({ _id: id, participants: { $ne: userId } }).exec();
      if (event) {
        await EventDb.findOneAndUpdate(
          { _id: id },
          { $push: { participants: userId } }
        ).exec();
        await Userdb.findOneAndUpdate(
          { _id: userId },
          { $push: { events: id } }
        ).exec();
        sendEventRegistrationEmail(user?.registrationDataId?.email, event);
        res.status(200).json({ msg: "event registration successful" });
      } else {
        res.status(400).json({ msg: "event was not found or user has already registered" });
      }
    }
  } catch (error) {
    res.status(400).json({ msg: "event registration failed", error });
  }
};


const deleteUserEvents = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const event = await EventDb.findOneAndUpdate(
      { _id: id },
      { $pull: { participants: userId } }
    ).exec();
    if (event) {
      await Userdb.findOneAndUpdate(
        { _id: userId },
        { $pull: { events: id } }
      ).exec();
      res.status(200).json({ msg: "event deleted sucessfully" });
    } else {
      res.status(201).json({ msg: "event was not found" });
    }
  } catch (error) {
    res.status(400).json({ msg: "event deletion failed", error });
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
  deleteUserEvents,
};
