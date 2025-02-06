const express = require("express");
const { updateUserImage, getAllImages } = require("../controllers/uploadController");
const upload = require('../middleware/upload');
const router = express.Router();
const Image = require('../models/image');

// Route for uploading a file
router.put('/image', upload.single('image'), updateUserImage);
router.get('/images', getAllImages);
// Example: DELETE route for deleting an image by its ID
router.delete('/images/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const image = await Image.findByIdAndDelete(id);
      
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
  
      res.status(200).json({ message: "Image deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting the image" });
    }
  });
  
module.exports = router;

