const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin_kp:admin123@cluster0.hlr4lt7.mongodb.net/files?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));

// Create a file model
const fileSchema = new mongoose.Schema({
  filename: String,
  mimetype: String,
  size: Number,
});
const File = mongoose.model('File', fileSchema);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const fileId = req.fileId; // Assuming you pass the document _id as "fileId" in the request
    const originalFileName = file.originalname;
    const fileExtension = path.extname(originalFileName);
    const fileName = fileId + fileExtension;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const newFile = new File({
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const savedFile = await newFile.save();
    res.json(savedFile._id); // Send back the _id of the stored document as the response
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get file route
app.get('/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, 'uploads', file.filename);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/',(req,res)=>{
  res.status(200).send("Home");
})


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

