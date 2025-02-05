const bucket = require("../models/firebase");
const Image = require('../models/image');

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on("error", (error) => {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed." });
    });

    stream.on("finish", async () => {
      // Make the file publicly accessible
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      res.status(200).json({ url: publicUrl });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

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



