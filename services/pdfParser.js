const fs = require("fs");
const pdfParse = require("pdf-parse");

async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);

  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error("Error extracting text from PDF: " + error.message);
  }
}

module.exports = {
  extractTextFromPDF,
};
