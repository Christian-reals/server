const { default: mongoose } = require("mongoose");
const commentdb = require("../models/commentdb");
const Discussiondb = require("../models/discussionsdb");

const createDiscussion = async (req, res) => {
  const discussion = new Discussiondb(req.body);
  try {
    await discussion.save(discussion);
    res.status(201).json({ msg: "discussion created successfully" });
  } catch (error) {
    res.status(400).json({
      msg: "discussion creation is not successful",
      error: error,
    });
  }
};
const getDiscussion = async (req, res) => {
    const {id} = req.params
    console.log(id)
    try {
      const discussion = await Discussiondb.findOne({_id:id})
        .populate('comments');
        if (discussion) {
             res.status(200).json({ data: discussion, msg: "request sucessful" });
            
        } else {
            res.status(201).json({ msg: "request failed" });
            
        }
    } catch (error) {
      res.status(400).json({ msg: "failed", error: error });
    }
  };
const getAllDiscussions = async (req, res) => {
  try {
    const discussion = await Discussiondb.find({})
      .lean()
    res.status(200).json({ data: discussion, msg: "request sucessful" });
  } catch (error) {
    res.status(400).json({ msg: "failed", error: error });
  }
};
const deleteDiscussion = async (req, res) => {
  const { id } = req.params;
  const deleteddiscussion = Discussiondb.findByIdAndDelete(id);
};
const updateDiscussion = async (req, res) => {
  const { id } = req.params;
  try {
    const updateddiscussion = await Discussiondb.findByIdAndUpdate(
      id,
      req.body
    );
    res.status(201).json({ msg: "discussion updated sucessfully" });
  } catch (error) {
    res.send(error);
  }
};
const reactToDiscussion = async (req, res) => {
  const { id } = req.params;
  const { reaction, from } = req.body;
  try {
    const discussion = await Discussiondb.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          reactions: {
            reaction: reaction,
            from: mongoose.Types.ObjectId(from),
          },
          participants:from
        },
      }
    ).exec();
    res.status(201).send("reacted to discussion");
  } catch (error) {
    res.status(401).json({ msg: "unsucessful reply", error: error });
  }
};
const replyDiscussion = async (req, res) => {
  //id of the chat
  const { id } = req.params;
  console.log(id);
  const { userId, ...others } = req.body;
  try {
    //create comment
    const comment = new commentdb({
      ...others,
      commentator: mongoose.Types.ObjectId(userId),
    });
    try {
      //add the reply to the refrenced dicussion
      const discussion = await Discussiondb.findOneAndUpdate(
        { _id: id },
        { $push: { comments: comment._id,participants:userId } }
      ).exec();
      await comment.save(comment);
      //save the reply as a discussion to the current chat
      res.status(201).json({ msg: "reply created successfully" });
    } catch (error) {
      res.json({ msg: "reply creation is not successful", error });
    }
    res.status(201).send;
  } catch (error) {
    res.send(error);
  }
};

module.exports = {
  createDiscussion,
  getAllDiscussions,
  deleteDiscussion,
  updateDiscussion,
  reactToDiscussion,
  replyDiscussion,
  getDiscussion
};
