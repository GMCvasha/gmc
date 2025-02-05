const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true }, // Image URL
  description: { type: String, required: false }, // Optional image description
  dateTaken: { type: Date, required: false }, // Date when the image was taken
  uploadedAt: { type: Date, default: Date.now }, // Timestamp of when the image was uploaded
  tags: { type: String, default: "General" }, // Array of tags for categorization
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
