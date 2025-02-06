const express = require("express");
const { updateUserImage, getAllImages } = require("../controllers/uploadController");
const upload = require('../middleware/upload');

const router = express.Router();

// Route for uploading a file
router.put('/image', upload.single('image'), updateUserImage);
router.get('/images', getAllImages);
module.exports = router;

