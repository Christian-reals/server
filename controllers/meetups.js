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
        const meetup = new MeetupDb({
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
          await meetup.save(meetup);
          res.status(201).json({ msg: "meetup created successfully" });
        } catch (error) {
          res.json({ msg: "meetup creation is not successful", error: error });
        }
      }
    } else {
      res.status(404).json({ msg: "request body cannot be empty" });
    }
  });
};

const adminCreateMeetup = async (req, res) => {
  upload(req, res, async (err) => {
    console.log(req.file);
    if (req.body && req.file) {
      if (err) {
        res.status(401).send(err);
      } else {
        const { title, category, venue, description, date } = req.body;
        console.log(dirname);
        const meetup = new MeetupDb({
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
          meetup.isApproved = true
          await meetup.save(meetup);
          res.status(201).json({ msg: "meetup created successfully" });
        } catch (error) {
          res.json({ msg: "meetup creation is not successful", error: error });
        }
      }
    } else {
      res.status(404).json({ msg: "request body cannot be empty" });
    }
  });
};

const getAllMeetups = async (req, res) => {
  try {
    const meetups = await MeetupDb.find({}).lean();

    res.status(200).json(meetups);
  } catch (error) {
    res.status(404).json({ msg: "failed: unable to process request", error });
  }
};
const getMeetup = async (req, res) => {
  const { id } = req.params;
  try {
    const meetup = await MeetupDb.findById({ _id: id });
    res.status(200).json(meetup);
  } catch (error) {
    res.status(404).json({ msg: "failed", error });
  }
};

const getUserMeetups = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await Userdb.findOne({ _id: userId })
      .populate("meetups")
      .exec();
    const userMeetups = user.meetups;
    res.status(201).json({ data: userMeetups });
  } catch (error) {
    res.status(400).json({ msg: "could not fetch meetup", error });
  }
};

const updateMeetup = async (req, res) => {
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
          const updatedMeetup = await MeetupDb.findByIdAndUpdate(id, update);
          console.log(updatedMeetup)
          res.status(200).json({ msg: "meetup updated"});
        }
      } else {
        res.status(404).json({ msg: "request body cannot be empty" });
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: "meetup creation is not successful", error: error });

  }
};

const deleteMeetup = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  try {
    const deletedMeetup = await MeetupDb.findByIdAndDelete(id);
    console.log(deletedMeetup)
    res.status(200).json({ msg: "meetup deleted", });

  } catch (error) {
    res.status(422).json({ msg: "unable to delete meetup", error });
  }
};

const approveMeetup = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  try {
    const meetup = await MeetupDb.findByIdAndUpdate(id,{$set:{isApproved:true}});
    res.status(200).json({ msg: "meetup approved", });

  } catch (error) {
    res.status(422).json({ msg: "unable to approve meetup", error });
  }
};

const likeMeetups = async (req, res) => {
  const { id } = req.params;
  try {
    const likedMeetup = await MeetupDb.findOneAndUpdate(
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
    res.status(201).json({ msg: "successful" });
  } catch (error) {
    res.send(error);
  }
};
const unregisterMeetups = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    await MeetupDb.findOneAndUpdate(
      { _id: id },
      { $pull: { participants: userId } }
    ).exec();
    await Userdb.findOneAndUpdate(
      { _id: userId },
      { $pull: { meetups: id } }
    ).exec();
    res.status();
  } catch (error) {
    res.send(error);
  }
};

module.exports = {
  getAllMeetups,
  registerMeetups,
  likeMeetups,
  getMeetup,
  createMeetup,
  deleteMeetup,
  updateMeetup,
  getUserMeetups,
  adminCreateMeetup,
  approveMeetup,
  unregisterMeetups,
};
