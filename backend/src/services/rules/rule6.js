const { parseMRP } = require('../../utils/priceParser');
const { parseMonthYear } = require('../../utils/dateParser');

function evaluateRule6(extracted, category) {
  const results = [];

  // R6_1_A: Manufacturer
  const mfg = extracted.manufacturer || {};
  let mfgVerdict = 'PASS';
  if (!mfg.name || !mfg.address) {
    mfgVerdict = 'FAIL';
  }
  results.push({ ruleId: 'R6_1_A', citation: 'Rule 6(1)(a)', check: 'Manufacturer / packer / importer present', found: `Name: ${mfg.name}, Address: ${mfg.address}`, verdict: mfgVerdict, confidence: 'HIGH' });

  // R6_1_B: Generic Name
  let genericNameVerdict = extracted.genericName ? 'PASS' : 'FAIL';
  results.push({ ruleId: 'R6_1_B', citation: 'Rule 6(1)(b)', check: 'Generic Name present', found: extracted.genericName || 'Not found', verdict: genericNameVerdict, confidence: 'HIGH' });

  // R6_1_C: Net Quantity
  let netQtyVerdict = (extracted.netQuantity && extracted.netQuantity.value && extracted.netQuantity.unit) ? 'PASS' : 'FAIL';
  results.push({ ruleId: 'R6_1_C', citation: 'Rule 6(1)(c)', check: 'Net Quantity present', found: extracted.netQuantity ? `${extracted.netQuantity.value} ${extracted.netQuantity.unit}` : 'Not found', verdict: netQtyVerdict, confidence: 'HIGH' });

  // R6_1_D: Month Year
  const exemptedFromDate = ['bidi', 'incense', 'lpg', 'food', 'cosmetics', 'baby_food'].includes(category.id);
  if (exemptedFromDate) {
    results.push({ ruleId: 'R6_1_D', citation: 'Rule 6(1)(d)', check: 'Month and Year present', found: 'N/A', verdict: 'NOT_APPLICABLE', confidence: 'HIGH' });
  } else {
    const d = parseMonthYear(extracted.monthYear);
    const dateVerdict = (d.month && d.year) ? 'PASS' : 'FAIL';
    results.push({ ruleId: 'R6_1_D', citation: 'Rule 6(1)(d)', check: 'Month and Year present', found: extracted.monthYear || 'Not found', verdict: dateVerdict, confidence: 'HIGH' });
  }

  // R6_1_E: MRP
  if (['bidi'].includes(category.id)) {
    results.push({ ruleId: 'R6_1_E', citation: 'Rule 6(1)(e)', check: 'Retail Sale Price present', found: 'N/A', verdict: 'NOT_APPLICABLE', confidence: 'HIGH' });
  } else {
    const mrpObj = parseMRP(extracted.mrp);
    const mrpVerdict = mrpObj.isValid ? 'PASS' : 'FAIL';
    results.push({ ruleId: 'R6_1_E', citation: 'Rule 6(1)(e)', check: 'Retail Sale Price present', found: extracted.mrp || 'Not found', verdict: mrpVerdict, confidence: 'HIGH' });
  }

  // R6_2: Consumer Care
  const cc = extracted.consumerCare || {};
  let ccVerdict = 'PASS';
  let missing = [];
  if (!cc.name) missing.push('name');
  if (!cc.address) missing.push('address');
  if (!cc.telephone) missing.push('telephone');
  if (!cc.email) missing.push('email');
  if (missing.length > 0) ccVerdict = 'FAIL';
  results.push({ ruleId: 'R6_2', citation: 'Rule 6(2)', check: 'Consumer Care complete', found: missing.length > 0 ? `Missing: ${missing.join(', ')}` : 'Complete', verdict: ccVerdict, confidence: 'HIGH' });

  // R6_3: Sticker
  let stickerVerdict = extracted.hasStickerOverMRP ? 'FAIL' : 'PASS';
  results.push({ ruleId: 'R6_3', citation: 'Rule 6(3)', check: 'No sticker over MRP', found: extracted.hasStickerOverMRP ? 'Sticker found' : 'No sticker', verdict: stickerVerdict, confidence: 'MEDIUM' });

  return results;
}

module.exports = { evaluateRule6 };
