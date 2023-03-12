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
      type: String
    },
    respondent:{
        type: String,
      },
    authorImgUrl: {
      type: String,
    },
    likes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const LoveQuestdb = mongoose.model("LoveQuests", loveQuestAnswer);

module.exports = LoveQuestdb;
