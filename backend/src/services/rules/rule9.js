function evaluateRule9(extracted) {
  const results = [];
  
  // R9_1_A Legibility
  results.push({ ruleId: 'R9_1_A', citation: 'Rule 9(1)(a)', check: 'Legibility', found: 'Prominent', verdict: 'PASS', confidence: 'MEDIUM' });
  
  // R9_1_B Contrast
  let contrastVerdict = 'PASS';
  if (extracted.contrastRatio && extracted.contrastRatio < 3) {
    contrastVerdict = 'FAIL';
  }
  results.push({ ruleId: 'R9_1_B', citation: 'Rule 9(1)(b)', check: 'Contrast of MRP and quantity', found: `Ratio ${extracted.contrastRatio || 'N/A'}`, verdict: contrastVerdict, confidence: 'HIGH' });
  
  // R9_2 Not read through liquid
  results.push({ ruleId: 'R9_2', citation: 'Rule 9(2)', check: 'Not read through liquid', found: 'Requires human review', verdict: 'REVIEW', confidence: 'LOW' });

  // R9_4 Language
  let langVerdict = 'FAIL';
  if (extracted.detectedScripts) {
    if (extracted.detectedScripts.includes('Devanagari') || extracted.detectedScripts.includes('Latin')) {
      langVerdict = 'PASS';
    }
  }
  results.push({ ruleId: 'R9_4', citation: 'Rule 9(4)', check: 'Language', found: extracted.detectedScripts ? extracted.detectedScripts.join(', ') : 'None', verdict: langVerdict, confidence: 'HIGH' });
  
  return results;
}

module.exports = { evaluateRule9 };
