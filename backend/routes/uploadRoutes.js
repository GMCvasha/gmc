const express = require("express");
const { updateUserImage } = require("../controllers/uploadController");
const upload = require("../utils/multerConfig");

const router = express.Router();

// Route for uploading a file
router.put('/image', upload.single('image'), updateUserImage);

module.exports = router;

