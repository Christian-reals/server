const { default: mongoose, Mongoose } = require("mongoose");
const loveQuestdb = require("../models/loveQuestdb");

const createLoveQuest = async (req, res) => {
    const {authorId, ...others} = req.body
  const LoveQuest = new loveQuestdb(
    {
        ...others,
        authorId:mongoose.Types.ObjectId(authorId),
    }
  );
  try {
    await LoveQuest.save(LoveQuest);
    res.status(201).json({ msg: "LoveQuest created successfully" });
  } catch (error) {
    res.status(400).json({
      msg: "LoveQuest creation is not successful",
      error: error,
    });
  }
};
const getLoveQuest = async (req, res) => {
  const { id } = req.params;
  
  try {
    const LoveQuest = await loveQuestdb.findOne({ _id: id });
    if (LoveQuest) {
      res.status(200).json({ data: LoveQuest, msg: "request sucessful" });
    } else {
      res.status(201).json({ msg: "request failed" });
    }
  } catch (error) {
    res.status(400).json({ msg: "failed", error: error });
  }
};
const getAllLoveQuests = async (req, res) => {
  try {
    const LoveQuest = await loveQuestdb.find({answer:{ 
      $exists: true, 
      $regex: /.{2,}/ // matches strings with 2 or more characters 
    }}).lean();
    res.status(200).json({ data: LoveQuest, msg: "request sucessful" });
  } catch (error) {
    res.status(400).json({ msg: "failed", error: error });
  }
};
const deleteLoveQuest = async (req, res) => {
  const { id } = req.params;
  const deletedLoveQuest = loveQuestdb.findByIdAndDelete(id);
};
const updateLoveQuest = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedLoveQuest = await loveQuestdb.findByIdAndUpdate(id, req.body);
    res.status(201).json({ msg: "LoveQuest updated sucessfully" });
  } catch (error) {
    res.send(error);
  }
};
const likeLoveQuest = async (req, res) => {
  const { id } = req.params;
  const {userId} = req.body
  try {
    const liked = await loveQuestdb
      .findOneAndUpdate({ _id: id }, { $push: {likes:{from:userId}} })
    if (liked) {
      res.status(200).json({ msg: "request sucessfull" });
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "request not sucessfull", error });
  }
};
const dislikeLoveQuest = async (req, res) => {
    const { id } = req.params;
  const {userId} = req.body

    try {
      const liked = await loveQuestdb
        .findOneAndUpdate({ _id: id }, { $pull: {likes:{from:userId}} })
      if (liked) {
        res.status(200).json({ msg: "request sucessfull" });
      }
    } catch (error) {
      console.log(error)
      res.status(400).json({ msg: "request not sucessfull", error });
    }
  };
  
  const answerQuestion = async (req, res) => {
    const { answer } = req.body;
    const { id } = req.params;
    try {
      const question = await loveQuestdb.findByIdAndUpdate(
        id,
        { ...req.body},
        { new: true }
      );
      res.status(200).json({msg:'question answered', success: true, question });
    } catch (error) {
      console.error(error);
      res.status(500).json({msg:'question not  answered', success: false, error: error.message });
    }
  };
  

module.exports = {
  createLoveQuest,
  getAllLoveQuests,
  deleteLoveQuest,
  updateLoveQuest,
  likeLoveQuest,
  getLoveQuest,
  dislikeLoveQuest,
  answerQuestion,
};
