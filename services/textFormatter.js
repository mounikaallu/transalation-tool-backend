function formatText(text) {
  if (!text) return text;

  //address substitutions
  text = text.replace(/\bATTN:\b/g, "A/S");
  text = text.replace(/\bACCOUNTS PAYABLE\b/g, "COMPTES PAYABLES");
  text = text.replace(/\bRENE-LEVESQUE\b/g, "RENÉ-LEVESQUE");
  text = text.replace(/\bMONTREAL\b/g, "MONTRÉAL");

 //Handles ATTN
  text = text.replace(/\bATTN\s*:\s*/gi, "A/S ");

  text = text.replace(/CHECK\s+#(\d+)\s*-\s*THANK YOU/gi, "CHÈQUE #$1 - MERCI");

  //Credit card ending
  text = text.replace(/CREDIT CARD ENDING IN\s*(\d+)/gi, "CARTE DE CRÉDIT SE TERMINANT PAR $1");

  //Dynamic CALLS TOTAL @$X ea → TOTAL APPELS @ X $ ch.
text = text.replace(/CALLS TOTAL\s*@\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/gi, (_, amount) => {
  const formatted = amount.replace(",", " ").replace(".", ",");
  return `TOTAL APPELS @ ${formatted} $ ch.`;
});

// Dynamic X CALLS - Y BASE = Z ADDITIONAL CALLS → French
text = text.replace(
  /(\d+)\s+CALLS\s*-\s*(\d+)\s+BASE\s*=\s*(\d+)\s+ADDITIONAL CALLS/gi,
  (_, total, base, additional) =>
    `${total} APPELS - ${base} DE BASE = ${additional} APPELS ADDITIONNELS`
);
// Dynamic "X of Y" → "X de Y"
text = text.replace(/\b(\d+)\s+of\s+(\d+)\b/gi, (_, x, y) => `${x} de ${y}`);




  // Optional: add accent to more common city/street names
  text = text.replace(/\bQUEBEC\b/g, "QUÉBEC");

  // Convert MM/DD/YYYY → YYYY-MM-DD
  const dateRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g;
  text = text.replace(dateRegex, (_, mm, dd, yyyy) => {
    mm = parseInt(mm, 10);
    dd = parseInt(dd, 10);
  
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      const paddedMM = mm.toString().padStart(2, "0");
      const paddedDD = dd.toString().padStart(2, "0");
      return `${yyyy}-${paddedMM}-${paddedDD}`;
    }
  
    return `${mm}/${dd}/${yyyy}`; // fallback to original if invalid
  });
  // Convert all currency values:
  // Matches: 1,152.29 → 1 152,29 AND 10.50 → 10,50
  const currencyRegex = /\b(\d{1,3}(?:,\d{3})+|\d+)(\.\d{2})\b/g;
  text = text.replace(currencyRegex, (_, intPart, decimal) => {
    // Replace thousands comma with space (only if present)
    const spacedInt = intPart.includes(",")
      ? intPart.replace(/,/g, " ")
      : intPart;

    // Replace decimal point with comma
    const frenchDecimal = decimal.replace(".", ",");

    return `${spacedInt}${frenchDecimal}`;
  });

  return text;
}

function isValidForTranslation(text) {
  if (!text || text.trim() === "") return false;

  const trimmed = text.trim();

  // Exclude short strings
  if (trimmed.length < 3) return false;

  // Exclude emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) return false;

  // Exclude numeric-only
  if (/^\d+$/.test(trimmed)) return false;

  // Exclude currency values like 1,152.29 or 10.50
  if (/^\d{1,3}(,\d{3})*(\.\d{2})$/.test(trimmed) || /^\d+\.\d{2}$/.test(trimmed)) return false;

  // Exclude MM/DD/YYYY or DD/MM/YYYY with optional quotes
  if (/^"?\d{1,2}\/\d{1,2}\/\d{4}"?$/.test(trimmed)) return false;

  // Exclude date strings already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;

  // Exclude percentages or special numeric units
  if (/^\d+%$/.test(trimmed)) return false;

  return true; // Passed all exclusion checks
}

module.exports = {formatText, isValidForTranslation };
