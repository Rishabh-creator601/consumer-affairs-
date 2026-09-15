/**
 * Maps raw OCR tokens onto the 6 statutory declaration heads.
 */

const extractDeclarations = (ocrTokens) => {
  const result = {
    manufacturer: { name: null, address: null, qualifier: null, confidence: 0 },
    genericName: { value: null, confidence: 0 },
    netQuantity: { value: null, unit: null, raw: null, confidence: 0 },
    monthYear: { month: null, year: null, raw: null, confidence: 0 },
    mrp: { value: null, wording: null, raw: null, confidence: 0 },
    consumerCare: { name: null, address: null, phone: null, email: null, confidence: 0 },
    dimensions: { value: null, confidence: 0 },
    additionalInfo: []
  };

  const fullText = ocrTokens.map(t => t.text).join(' ');

  // 1. Manufacturer
  const mfgMatch = fullText.match(/(?:manufactured by|mfg by|packed by|imported by|mktd by|marketed by)[:\s]+([^.0-9]+(?:\d{1,6}[^.0-9]+)?)/i);
  if (mfgMatch) {
    result.manufacturer.qualifier = mfgMatch[0].split(' ')[0].toLowerCase();
    result.manufacturer.name = mfgMatch[1].trim();
    result.manufacturer.confidence = 0.85;
  }

  // 2. Generic Name (Simple heuristic rejecting brands)
  // Assuming words directly before Net Wt or generic commodities
  const commodityKeywords = ['biscuits', 'soap', 'shampoo', 'rice', 'wheat', 'oil', 'flour'];
  const genericMatch = ocrTokens.find(t => commodityKeywords.some(kw => t.text.toLowerCase().includes(kw)));
  if (genericMatch) {
    result.genericName.value = genericMatch.text;
    result.genericName.confidence = genericMatch.confidence || 0.9;
  }

  // 3. Net Quantity
  const netQtyMatch = fullText.match(/(?:net wt|net weight|net quantity|net vol|volume|qty|net)\.?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(g|kg|ml|l|liter|litre|oz)s?/i);
  if (netQtyMatch) {
    result.netQuantity.raw = netQtyMatch[0];
    result.netQuantity.value = parseFloat(netQtyMatch[1]);
    result.netQuantity.unit = netQtyMatch[2].toLowerCase();
    result.netQuantity.confidence = 0.95;
  }

  // 4. Month/Year
  const dateMatch = fullText.match(/\b(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{2}\/\d{4}|\d{2}-\d{4})\b/i);
  if (dateMatch) {
    result.monthYear.raw = dateMatch[0];
    result.monthYear.confidence = 0.9;
    // Basic parse
    const parts = dateMatch[0].split(/[\/\-\s]/);
    if (parts.length >= 2) {
      result.monthYear.year = parts[parts.length - 1];
      result.monthYear.month = parts[0];
    }
  }

  // 5. MRP
  const mrpMatch = fullText.match(/(?:mrp|maximum retail price)\s*(?:rs\.?|₹|inr)?\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)/i);
  if (mrpMatch) {
    result.mrp.raw = mrpMatch[0];
    result.mrp.wording = mrpMatch[0].replace(mrpMatch[1], '').trim();
    result.mrp.value = parseFloat(mrpMatch[1]);
    result.mrp.confidence = 0.92;
  }

  // 6. Consumer Care
  const phoneMatch = fullText.match(/\b\d{10,11}\b/);
  const emailMatch = fullText.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  if (phoneMatch || emailMatch || fullText.toLowerCase().includes('consumer care')) {
    result.consumerCare.phone = phoneMatch ? phoneMatch[0] : null;
    result.consumerCare.email = emailMatch ? emailMatch[0] : null;
    result.consumerCare.confidence = 0.88;
  }

  return result;
};

module.exports = { extractDeclarations };
