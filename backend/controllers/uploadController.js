const { bucket } = require('../config/firebase');
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

exports.updateUserImage = async (req, res) => {
  try {

    const file = req.file; // Handling single file upload
    const { description, dateTaken, tags } = req.body; // Extract metadata
   console.log('==================================');
   console.log(description);
   console.log('==================================');
   console.log(dateTaken);
   console.log('============= in =================');
   console.log(tags);
   console.log('==================================');
   console.log(file);
   console.log('==================================');
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload the file and get the URL
    const imageUrl = await uploadFile(file);

    // Create a new image document
    const image = new Image({
      url: imageUrl,
      description,
      dateTaken: dateTaken ? new Date(dateTaken) : undefined,
      tags: tags || "General",
    });

    await image.save();

    res.status(200).json({
      message: 'Image updated successfully',
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



