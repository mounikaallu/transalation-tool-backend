const path = require("path");
const { extractTextWithBounds } = require("../services/pdfBoxExtractor");
const { generateTranslatedPDF } = require("../services/pdfGenerator");
const { removeTextLayer } = require("../services/removeTextLayer");
const { formatText } = require("../services/textFormatter");
const translationMap = require("../utils/translationMap");

exports.handleUpload = async (req, res) => {
  try {
    const uploadedFile = req.file;
    if (!uploadedFile) return res.status(400).json({ message: "No file uploaded" });

    const filePath = path.join(__dirname, "..", uploadedFile.path);
    const cleanedPath = filePath.replace(".pdf", "_cleaned.pdf");

    // Step 1: Remove the original text layer
    await removeTextLayer(filePath, cleanedPath);

    // Step 2: Extract text with coordinates
    const textBlocks = await extractTextWithBounds(filePath);

    // Step 3: Apply translationMap and dynamic formatters
    const translatedBlocks = textBlocks.map((block) => {
      let translatedText = block.text;

      // Static label replacement
      if (translationMap[translatedText]) {
        translatedText = translationMap[translatedText];
      } else {
        // Apply date & currency formatting
        translatedText = formatText(translatedText);
      }

      return {
        ...block,
        translatedText,
        originalText: block.text,
      };
    });

    // Step 4: Generate new PDF
    const { translatedFileName, translatedPath } = await generateTranslatedPDF(
      cleanedPath,
      translatedBlocks,
      uploadedFile.originalname
    );

    return res.status(200).json({
      message: "Translated PDF generated successfully",
      translatedFileName,
      downloadUrl: `/api/translate/download/${translatedFileName}`,
    });
  } catch (err) {
    console.error("Error in upload:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
