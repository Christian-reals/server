const mongoose = require("mongoose");

const loveQuestAnswer = new mongoose.Schema(
  {
    question: {
      type: String,
      required: ["question cannot be empty"],
    },
    title: {
        type: String,
        required: ["title cannot be empty"],
      },
    answer: {
      type: String,
    },
    author: {
      type: String,
      required: ["LoveQuest must have an author"],
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'users'
      },
    respondentRole: {
      type: String,
      default:'Admin/Love Expert'
    },
    respondent:{
        type: String,
      },
    authorImgUrl: {
      type: String,
    },
    likes:[{
      from:      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required:true
      },
      date:{
        type: Date,
        default: Date.now()
      },
    }],
  },
  {
    timestamps: true,
  }
);

const LoveQuestdb = mongoose.model("LoveQuests", loveQuestAnswer);

module.exports = LoveQuestdb;
