const translationMap = require("../utils/translationMap");

function translateText(inputText) {
  let outputText = inputText;

  Object.keys(translationMap).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b`, "gi"); // Match whole words, case-insensitive
    outputText = outputText.replace(regex, translationMap[key]);
  });

  return outputText;
}

module.exports = {
  translateText,
};
