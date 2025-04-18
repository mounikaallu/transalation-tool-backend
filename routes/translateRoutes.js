const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const translateController = require("../controllers/translateController");

// Configure multer storage
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

// Filter to allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Route: POST /api/translate/upload-invoice
router.post("/upload-invoice", upload.single("file"), translateController.handleUpload);

const fs = require("fs");

// Serve the translated PDF
router.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "..", "translations", filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});


module.exports = router;
