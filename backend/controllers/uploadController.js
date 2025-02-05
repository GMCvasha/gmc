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
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const uploadResponse = await uploadFile(file);

    if (uploadResponse.status !== "success") {
      return res.status(500).json({ message: "Upload failed", error: uploadResponse.message });
    }

    res.status(200).json({ message: "Image uploaded successfully", url: uploadResponse.url });
  } catch (error) {
    console.error("Error in updateUserImage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



