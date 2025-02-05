const multer = require("multer");

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit files to 10MB
});

module.exports = upload;
