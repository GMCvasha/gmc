const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Event', EventSchema);
