const { default: mongoose } = require("mongoose");
const commentdb = require("../models/commentdb");
const Discussiondb = require("../models/discussionsdb");

const createDiscussion = async (req, res) => {
  console.log(req.body)
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
    
    try {
      const discussion = await Discussiondb.findOne({_id:id})
      .populate(
        {
          path: "comments",
          populate: { path: "commentator",populate:{path:'registrationDataId'} },
        }
      )
        if (discussion) {
             res.status(200).json({ data: discussion, msg: "request sucessful" });
            
        } else {
            res.status(201).json({ msg: "request failed" });
            
        }
    } catch (error) {
      console.log(error)
      res.status(400).json({ msg: "failed", error: error });
    }
  };
const getAllDiscussions = async (req, res) => {
  try {
    const discussion = await Discussiondb.find({}).populate(
      {
        path: "comments",
        populate: { path: "commentator",populate:{path:'registrationDataId'} },
      }
    )
      .lean()
    res.status(200).json({ data: discussion, msg: "request sucessful" });
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: "failed", error: error });
  }
};
const deleteDiscussion = async (req, res) => {
  const { id } = req.params;
  try {
  const deletedDiscussion = await Discussiondb.findByIdAndDelete(id);
    res.status(200).json({msg:'discussion deleted'})
  } catch (error) {
    res.status(500).json({msg:'somethingwent wrong, discussion not deleted'})
    
  }
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
        { $push: { comments: comment._id} }
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

const likeDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  const { userId } = req.body;
  try {
    const discussion = await Discussiondb.findById(discussionId);
    const hasLiked = discussion?.likes?.some((like) => like.from.equals(userId));

    if (hasLiked) {
      res.status(400).json({ msg: "you have already liked this discussion" });
    } else {
      const like = {
        from: userId,
      };

      // Update the recipient's notifications array in the database
      const discussion = await Discussiondb.findByIdAndUpdate(
        discussionId,
        {
          $push: {
            likes: like,
          },
        },
        { new: true }
      );

      console.log(discussion);

      res.status(200).json({ msg: "discussion liked", likes: discussion.likes });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "something went wrong: could not like discussion" });
  }
};

module.exports = {
  createDiscussion,
  getAllDiscussions,
  deleteDiscussion,
  updateDiscussion,
  reactToDiscussion,
  replyDiscussion,
  getDiscussion,
  likeDiscussion
};
