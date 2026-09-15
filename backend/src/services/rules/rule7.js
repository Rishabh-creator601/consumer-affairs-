function lookupTableI(netQuantityGrams) {
  if (netQuantityGrams <= 200) return 1;
  if (netQuantityGrams <= 500) return 2;
  return 4;
}

function lookupTableII(panelAreaCm2) {
  if (panelAreaCm2 <= 100) return 1;
  if (panelAreaCm2 <= 500) return 2;
  if (panelAreaCm2 <= 2500) return 4;
  return 6;
}

function evaluateRule7(extracted, category, calibrationData) {
  const results = [];
  if (!calibrationData || !calibrationData.isCalibrated) {
    results.push({ ruleId: 'R7_2_T1', citation: 'Rule 7(2) Table I', check: 'Numeral height by weight/volume', found: 'No calibration data', verdict: 'REVIEW', confidence: 'LOW' });
    results.push({ ruleId: 'R7_2_T2', citation: 'Rule 7(2) Table II', check: 'Numeral height by panel area', found: 'No calibration data', verdict: 'REVIEW', confidence: 'LOW' });
    results.push({ ruleId: 'R7_3', citation: 'Rule 7(3)', check: 'Letter height and width ratio', found: 'No calibration data', verdict: 'REVIEW', confidence: 'LOW' });
    return results;
  }

  // R7_2_T1
  const qty = extracted.netQuantity ? extracted.netQuantity.valueInGrams || 100 : 100;
  const reqHeightI = lookupTableI(qty);
  const measuredHeight = extracted.declarations ? extracted.declarations.numeralHeightMm : 0;
  const v1 = measuredHeight >= reqHeightI ? 'PASS' : 'FAIL';
  results.push({ ruleId: 'R7_2_T1', citation: 'Rule 7(2) Table I', check: 'Numeral height by weight/volume', found: measuredHeight + 'mm', required: reqHeightI + 'mm', verdict: v1, confidence: 'HIGH' });

  // R7_3
  const measuredWidth = extracted.declarations ? extracted.declarations.letterWidthMm : 0;
  const reqWidth = measuredHeight / 3;
  const v3 = measuredWidth >= reqWidth ? 'PASS' : 'FAIL';
  results.push({ ruleId: 'R7_3', citation: 'Rule 7(3)', check: 'Letter height and width ratio', found: measuredWidth + 'mm', required: reqWidth + 'mm', verdict: v3, confidence: 'HIGH' });

  return results;
}

module.exports = { evaluateRule7 };
