const commentdb = require('../models/commentdb');

const Devotional = require('../models/devotional');

const createDevotional = async (req, res) => {
  if (req.file) {
    try {
      const { title, body,author,content,verse, date } = req.body;
      const devotional = new Devotional({ title, body, imageUrl:req.file.path,author,content,verse,date });
      await devotional.save();
      res.status(201).json(devotional);
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: error.message });
    }
  }

};

const replyDevotional = async (req, res) => {
  //id of the devotional
  const { id } = req.params;
  
  const { userId, ...others } = req.body;
  try {
    //create comment
    const comment = new commentdb({
      ...others,
      commentator: mongoose.Types.ObjectId(userId),
    });
    try {
      //add the reply to the refrenced dicussion
      const devotional = await Devotional.findOneAndUpdate(
        { _id: id },
        { $push: { comments: comment._id} }
      ).exec();
      await comment.save(comment);
      //save the reply as a comment to the devotion
      res.status(201).json({ msg: "reply created successfully" });
    } catch (error) {
      res.json({ msg: "reply creation is not successful", error });
    }
    res.status(201).send;
  } catch (error) {
    res.send(error);
  }
};


const updateDevotional = async (req, res) => {
  try {
    const { title, content, verse, date } = req.body;
    const devotional = await Devotional.findById(req.params.id);
    if (title) devotional.title = title;
    if (content) devotional.content = content;
    if (verse) devotional.verse = verse;
    if (date) devotional.date = date;
    await devotional.save();
    res.json(devotional);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDevotionals = async (req, res) => {
  try {
    const devotionals = await Devotional.find().populate({
      path:'comments.commentator',
      populate: { path: "registrationDataId" },
    });
    res.json({msg:'request sucessfull',devotionals});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDailyDevotional = async (req, res) => {
  try {
    const devotionals = await Devotional.find().populate({
      path:'comments.commentator',
      populate: { path: "registrationDataId" },
    });

    const dailyDevotion = devotionals.filter((devotion)=>{
      return new Date(devotion).toDateString() ===  new Date(req.params.date).toDateString() 
    })
    res.status(200).json({devotion:dailyDevotion});
  } catch (error) {
    res.status(500).json({ message: error.message||'something went wrong' });
  }
};

const deleteDevotional = async (req, res) => {
  try {
    const devotional = await Devotional.findById(req.params.id);
    await devotional.remove();
    res.json({ message: 'Devotional deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDevotional,
  updateDevotional,
  getAllDevotionals,
  getDailyDevotional,
  replyDevotional,
  deleteDevotional,
};
