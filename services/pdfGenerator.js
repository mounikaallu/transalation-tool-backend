const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

async function generateTranslatedPDF(originalFilePath, translatedBlocks, originalFileName) {
  const originalPdfBytes = fs.readFileSync(originalFilePath); // this is the _cleaned.pdf from Ghostscript
  const originalPdf = await PDFDocument.load(originalPdfBytes);
  const numPages = originalPdf.getPageCount();

  const newPdf = await PDFDocument.create();
  const font = await newPdf.embedFont(StandardFonts.Helvetica);

  //Import pages with layout from cleaned PDF
  const importedPages = await newPdf.copyPages(originalPdf, [...Array(numPages).keys()]);
  importedPages.forEach((page) => newPdf.addPage(page));

  const pages = newPdf.getPages();
  const multiLineMap = {
    "# DE BON DE COMMANDE": ["# DE BON", "DE COMMANDE"],
    "DÉTAIL DES NOUVEAUX FRAIS": ["DÉTAIL DES", "NOUVEAUX FRAIS"],
  };

  for (const block of translatedBlocks) {
    const pageIndex = block.page - 1;
    const page = pages[pageIndex];

    if (!page) continue;

    let fontSize = block.fontSize || 10;
    const maxWidth = block.width;
    const MIN_FONT_SIZE = 6;

    //Handle multi-line special cases
    if (multiLineMap[block.translatedText]) {
      const lines = multiLineMap[block.translatedText];
      const initialFontSize = fontSize;

      // STEP 1: Find the widest line
      const widestLine = lines.reduce((max, line) => {
        const width = font.widthOfTextAtSize(line, fontSize);
        return Math.max(max, width);
      }, 0);

      // STEP 2: Shrink font if widest line exceeds bounding width
      if (widestLine > maxWidth) {
        const scaleFactor = maxWidth / widestLine;
        const scaledFontSize = fontSize * scaleFactor;
        fontSize = Math.max(scaledFontSize, MIN_FONT_SIZE);
      }

      // STEP 3: Calculate vertical centering and draw each line
      const totalHeight = lines.length * fontSize;
      const startY = block.y + (block.height - totalHeight) / 2;

      lines.forEach((line, i) => {
        const lineWidth = font.widthOfTextAtSize(line, fontSize);
        const centeredX = block.x + (maxWidth - lineWidth) / 2;

        page.drawText(line, {
          x: centeredX,
          y: startY + (lines.length - 1 - i) * fontSize,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });

    } else {
      //Regular single-line logic
      let textWidth = font.widthOfTextAtSize(block.translatedText, fontSize);
      if (textWidth > maxWidth) {
        const scaleFactor = maxWidth / textWidth;
        const scaledFontSize = fontSize * scaleFactor;
        fontSize = Math.max(scaledFontSize, MIN_FONT_SIZE);
      }

      page.drawText(block.translatedText, {
        x: block.x,
        y: block.y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }
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
