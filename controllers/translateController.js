const path = require("path");
const { extractTextFromPDF } = require("../services/pdfParser");
const { translateText } = require("../services/translator");
const { generateTranslatedPDF } = require("../services/pdfGenerator");
const { extractTextWithBounds } = require("../services/pdfBoxExtractor");
const { translateToFrench } = require("../services/openAITranslator");
const { removeTextLayer } = require("../services/removeTextLayer");

exports.handleUpload = async (req, res) => {
  try {
    const uploadedFile = req.file;
    console.log("uploadedFile", uploadedFile);

    if (!uploadedFile) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "..", uploadedFile.path);

    // Step 1: Remove text layer
    const cleanedPath = filePath.replace(".pdf", "_cleaned.pdf");
    await removeTextLayer(filePath, cleanedPath);

    const textBlocks = await extractTextWithBounds(filePath);

    // Process translations concurrently
    const translatedBlocks = await Promise.all(
      textBlocks.map(async (block) => {
        const translated = await translateToFrench(block.text);
        return {
          ...block,
          translatedText: translated,
          originalText: block.text,
        };
      })
    );

    const { translatedFileName, translatedPath } = await generateTranslatedPDF(
      cleanedPath,
      translatedBlocks,
      uploadedFile.originalname
    );

    res.status(200).json({
      message: "Translated PDF generated successfully",
      translatedFileName,
      downloadUrl: `/api/translate/download/${translatedFileName}`,
    });
  } catch (err) {
    console.error("Error in upload:", err);
    res.status(500).json({ message: "Something went wrong" });    res.status(500).json({ message: "Something went wrong" });
  }
};
