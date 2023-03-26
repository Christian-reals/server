const mongoose = require("mongoose");

var registerSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      required: [true, `please specify gender`],
    },
    datingNeed: {
      type: String,
      required: [true, `please specify dating need`],
    },
    firstName: {
      type: String,
      required: [true, `First Name cannot be empty`],
    },
    surname: {
      type: String,
      required: [true, `Surname cannot be empty`],
    },
    email: {
      type: String,
      required: [true, `Email cannot be empty`],
      unique: true,
    },
    email_verified: {
      type: Boolean,
      default: false,
      required: [true],
    },
    city: {
      type: String,
      required: [true, `city cannot be empty`],
    },
    state: {
      type: String,
      required: [true, `state cannot be empty`],
    },
    country: {
      type: String,
      required: [true, `country cannot be empty`],
    },
    userName: {
      type: String,
      required: [true, `username cannot be empty`],
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    postCode: {
      type: Number,
      required: [true, "postCode cannot be empty"],
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    date: { type: String },
  },
  { timestamps: true }
);

var profileSchema = new mongoose.Schema({
  relationship_status: {
    type: String,
    required: [true, `status cannot be empty`],
  },
  ethnic_background: {
    type: String,
    required: [true, `ethnic background cannot be empty`],
  },
  other_ethnic_background: {
    type: String,
    // required:[true,`ethnic background cannot be empty`],
  },
  education: {
    type: String,
    required: [true, `education cannot be empty`],
  },
  other_education: {
    type: String,
    // required:[true,`education cannot be empty`],
  },
  employment_status: {
    type: String,
    required: [true, `employment cannot be empty`],
  },
  current_work: {
    type: String,
    required: [true, `current work cannot be empty`],
  },
  dream_job: {
    type: String,
    required: [true, `career goal cannot be empty`],
  },
  languages: {
    type: Array,
    required: [true, `languages cannot be empty`],
  },
  height: {
    type: String,
    required: [true, `height cannot be empty`],
  },
  height_unit: {
    type: String,
    required: [true, `height cannot be empty`],
  },
  weight: {
    type: String,
    required: [true, `weight cannot be empty`],
  },
  weight_unit: {
    type: String,
    default: "kg",
    required: [true, `weight cannot be empty`],
  },
  body_type: {
    type: String,
    required: [true, `body type cannot be empty`],
  },
  hair_colour: {
    type: String,
    required: [true, `hair color cannot be empty`],
  },
  eye_colour: {
    type: String,
    required: [true, `eye color cannot be empty`],
  },
  main_language: {
    type: String,
    required: [true, `ethnic_background cannot be empty`],
  },
  other_mainLanguages: {
    type: String,
    // required:[true,`ethnic_background cannot be empty`],
  },
  other_languages: {
    type: String,
    // required:[true,`ethnic_background cannot be empty`],
  },
  no_of_children: {
    type: String,
    required: [true, `no of children cannot be empty`],
  },
  child_age_youngest: {
    type: String,
    required: [true, `child youngest age cannot be empty`],
  },
  child_age_oldest: {
    type: String,
    required: [true, `child_age_oldest cannot be empty`],
  },
  more_children: {
    type: String,
    required: [true, `more children cannot be empty`],
  },
  children_living_with: {
    type: String,
    required: [true, `no of children lived with cannot be empty`],
  },
  have_pets: {
    type: String,
    required: [true, `pets field cannot be empty`],
  },
  have_other_pets: {
    type: String,
    // required:[true,`ethnic_background cannot be empty`],
  },
  live_with_pets: {
    type: String,
    required: [true, `live with pets cannot be empty`],
  },
  specify_pets: {
    type: String,
    // required:[true,`ethnic_background cannot be empty`],
  },

  about: {
    type: String,
    required: [true, `about cannot be empty`],
  },
  family_description: {
    type: Array,
    required: [true, `family_description cannot be empty`],
  },
  colleague_description: {
    type: Array,
    required: [true, `colleague_description about cannot be empty`],
  },
  exPartner_description: {
    type: Array,
    required: [true, `exPartner_description about cannot be empty`],
  },
  friend_description: {
    type: Array,
    required: [true, `friend_description about cannot be empty`],
  },

  free_time: {
    type: String,
    required: [true, `free_time cannot be empty`],
  },
  ideal_holiday: {
    type: Array,
    minlength: 1,
    required: [true, `ideal_holiday cannot be empty`],
  },
  // music_choice:{
  //     type:String,
  //     required:[true,`music_choice cannot be empty`],

  // },
  desire: {
    type: String,
    required: [true, `desire cannot be empty`],
  },
  mantra: {
    type: String,
    required: [true, `mantra cannot be empty`],
  },
  faith_status: {
    type: Array,
    minlength: 1,
    required: [true, `faith_status cannot be empty`],
  },
  about_christain_faith: {
    type: String,
    required: [true, `about_christain_faith cannot be empty`],
  },
  inspirational_verses: {
    type: String,
    required: [true, `inspirational_verses cannot be empty`],
  },
  church_role: {
    type: Array,
    required: [true, `church_role cannot be empty`],
  },
  other_church_role: {
    type: String,
    // required:[true,`other_church_role cannot be empty`],
  },
  church_group_member: {
    type: String,
    // required:[true,`church_group_member cannot be empty`],
  },
  church_group_leader: {
    type: String,
    // required:[true,`church_group_member cannot be empty`],
  },
  gender_roles_view: {
    type: Array,
    required: [true, `ethnic_background cannot be empty`],
  },
  age_preference: {
    type: String,
    required: [true, `age_preference cannot be empty`],
  },
  tolerable_age_gap: {
    type: String,
    required: [true, `tolerable_age_gap cannot be empty`],
  },
  cooking_frequency: {
    type: String,
    required: [true, `cooking_frequency cannot be empty`],
  },
  cooking: {
    type: String,
    required: [true, `cookingy cannot be empty`],
  },
  cooking_partner: {
    type: String,
    required: [true, `cooking_partner cannot be empty`],
  },
  planning: {
    type: String,
    required: [true, `planning cannot be empty`],
  },
  cleaning: {
    type: String,
    required: [true, `cleaning cannot be empty`],
  },
  always_clean: {
    type: String,
    required: [true, `always_clean cannot be empty`],
  },
  eating_pattern: {
    type: String,
    required: [true, `eating_pattern cannot be empty`],
  },
  excercise: {
    type: String,
    required: [true, `excercise cannot be empty`],
  },
  alcohol: {
    type: String,
    required: [true, `alcohol cannot be empty`],
  },
  smoke: {
    type: String,
    required: [true, `smoke cannot be empty`],
  },
  dislike: {
    type: String,
    required: [true, `dislike cannot be empty`],
  },
  like: {
    type: String,
    required: [true, `like cannot be empty`],
  },
  ease_with_partner: {
    type: String,
    required: [true, `ease_with_partner cannot be empty`],
  },
  opposite_sex_friends: {
    type: String,
    required: [true, `opposite_sex_friends cannot be empty`],
  },
  ex_friendship: {
    type: String,
    required: [true, `ex_friendship cannot be empty`],
  },
  grave_offense: {
    type: String,
    required: [true, `grave_offense cannot be empty`],
  },
  other_grave_offense: {
    type: String,
    // required:[true,`grave_offense cannot be empty`],
  },
});

var userschema = new mongoose.Schema(
  {
    registrationDataId: {
      type: mongoose.Types.ObjectId,
      ref: "registrationData",
      required: [true, "registrationDataId can not be empty"],
    },
    profile_data: profileSchema,
    profile_complete: {
      type: Boolean,
      default: false,
    },
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Events",
      },
    ],
    meetups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Events",
      },
    ],
    friends: [
      {
        friend: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        blocked: {
          type: String,
          default: false,
        },
      },
    ],
    subscription:Object,
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    blockedChats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chats",
      },
    ],
    avatar:String,
    photos:[{
      id:mongoose.Types.ObjectId,
      url:String
    }],
    isPremium: {
      type: Boolean,
      default: false,
    },
    sessionId:String,
    customerId:String,
    subscriptionId:String,
    paymentIntentId:String,
    isBanned: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      banStart: {
        type: Date,
      },
      banEnd: {
        type: Date,
      },
      type: Boolean,
      default: false,
      reason: String,
    },
    notifications:[{
      from:      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      message:String,
      date:{
        type: Date,
        default: Date.now()
      },
      seen:{
        default:false
      }
    }],
    date: String,
  },
  {
    timestamps: true,
  }
);

const Userdb = mongoose.model("Users", userschema);
const registrationDb = mongoose.model("registrationData", registerSchema);
module.exports = { Userdb, registrationDb };
