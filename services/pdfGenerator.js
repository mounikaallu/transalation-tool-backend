const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

async function generateTranslatedPDF(originalFilePath, translatedBlocks, originalFileName) {
  const originalPdfBytes = fs.readFileSync(originalFilePath); // this is the _cleaned.pdf from Ghostscript
  const originalPdf = await PDFDocument.load(originalPdfBytes);
  const numPages = originalPdf.getPageCount();

  const newPdf = await PDFDocument.create();
  const font = await newPdf.embedFont(StandardFonts.Helvetica);

  // ✅ Import pages with layout from cleaned PDF
  const importedPages = await newPdf.copyPages(originalPdf, [...Array(numPages).keys()]);
  importedPages.forEach((page) => newPdf.addPage(page));

  const pages = newPdf.getPages();

  for (const block of translatedBlocks) {
    const pageIndex = block.page - 1;
    const page = pages[pageIndex];

    if (!page) continue;

    // ✅ Use block.y directly (already bottom-left origin)
    page.drawText(block.translatedText, {
      x: block.x,
      y: block.y,
      size: block.fontSize || 10,
      font,
      color: rgb(0, 0, 0),
    });
  }

  const pdfBytes = await newPdf.save();
  const baseName = originalFileName.replace(/\.pdf$/i, "").replace(/\s+/g, "_");
  const translatedFileName = `${baseName}_translated_clean.pdf`;
  const translatedPath = path.join("translations", translatedFileName);

  fs.writeFileSync(translatedPath, pdfBytes);

  return {
    translatedFileName,
    translatedPath,
  };
}

module.exports = {
  generateTranslatedPDF,
};
