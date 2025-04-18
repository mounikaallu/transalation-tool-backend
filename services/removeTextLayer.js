const { exec } = require("child_process");
const path = require("path");

async function removeTextLayer(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const gsPath = `"C:\\Program Files\\gs\\gs10.05.0\\bin\\gswin64c.exe"`;
    const ghostCmd = `${gsPath} -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dFILTERTEXT -sOutputFile="${outputPath}" "${inputPath}"`;

    exec(ghostCmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Ghostscript error:", error.message);
        return reject(error);
      }
      console.log("Text layer removed:", outputPath);
      resolve(outputPath);
    });
  });
}

module.exports = {
  removeTextLayer,
};
