const fs = require("fs");
const path = require("path");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
  __dirname,
  "../node_modules/pdfjs-dist/legacy/build/pdf.worker.js"
);

async function extractTextWithBounds(pdfPath) {
  const rawData = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data: rawData }).promise;

  const results = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      const transform = item.transform;
      const x = transform[4];
      const y = transform[5];
      const width = item.width;
      const height = item.height || 10;
      const fontSize = transform[0];

      results.push({
        text: item.str,
        x,
        y,
        width,
        height,
        fontSize,
        page: pageNum,
      });
    }
  }

  return results;
}

module.exports = {
  extractTextWithBounds,
};
