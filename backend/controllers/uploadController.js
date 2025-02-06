const { bucket } = require('../config/firebase')
const Image = require('../models/image');

async function uploadFiles(files) {
  if (!files || files.length === 0) return [];

  // Use `map` to upload all files and return an array of promises
  const uploadPromises = files.map(async (file) => {
    const fileName = Date.now() + '-' + file.originalname; // Generate unique file name
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (err) => reject(err));
      stream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log("Uploaded image:", publicUrl);
        resolve(publicUrl);
      });
      stream.end(file.buffer);
    });
  });

  // Await all promises and return array of URLs
  return Promise.all(uploadPromises);
}

const updateUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided.' });
    }

    // Upload the image to Firebase
    const uploadedUrls = await uploadFiles([req.file]);
    if (uploadedUrls.length === 0) {
      return res.status(500).json({ message: 'Failed to upload image.' });
    }

    // Save image data to MongoDB
    const { description, dateTaken, tags } = req.body;
    const newImage = new Image({
      url: uploadedUrls[0],
      description,
      dateTaken: dateTaken ? new Date(dateTaken) : undefined,
      tags: tags || 'General',
    });
    await newImage.save();

    res.status(201).json({ message: 'Image uploaded successfully.', image: newImage });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getAllImages = async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { updateUserImage, getAllImages };


