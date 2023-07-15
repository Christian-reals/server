const Feedback = require('../models/feedback');

// User Feedback Create Controller
exports.createFeedback = async (req, res) => {
  try {
    const { firstname, surname, email, subject, message,userId } = req.body;
    const feedback = new Feedback({
      firstname,
      surname,
      email,
      subject,
      message,
      userId
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback created successfully', });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Something went wrong' ,error});
  }
};

// Admin Get All Feedback Controller
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort('-createdAt');
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Admin Get Feedback by ID Controller
exports.getFeedbackById = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Admin Delete Feedback by ID Controller
exports.deleteFeedbackById = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await Feedback.findByIdAndDelete(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};


// Reply to Feedback Controller
exports.replyFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id
    const { reply } = req.body;

    // Find the feedback by ID
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Update the feedback with the reply message
    feedback.reply = reply;
   feedback.isReplied = true;

    await feedback.save();


    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};


// Reply to Feedback Controller
exports.editReply= async (req, res) => {
    try {
      const feedbackId = req.params.id
      const { reply } = req.body;
  
      // Find the feedback by ID
      const feedback = await Feedback.findById(feedbackId);
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
  
      // Update the feedback with the reply message
      feedback.reply = reply;
     feedback.isReplied = true;
  
      await feedback.save();
  
  
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  };