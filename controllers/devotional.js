const Devotional = require('../models/devotional');

const createDevotional = async (req, res) => {
  console.log(req.body)
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
    const devotionals = await Devotional.find();
    res.json({msg:'request sucessfull',devotionals});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDailyDevotional = async (req, res) => {
  try {
    const devotional = await Devotional.findOne({ date: req.params.date });
    res.json(devotional);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  deleteDevotional,
};
