const fs = require('fs');
const path = require('path');
const { evaluateRule6, evaluateRule7, evaluateRule8, evaluateRule9, evaluateRule11, evaluateRule12, evaluateRule13 } = require('./rules');
const { calculatePenalty } = require('../utils/penaltyCalculator');

const categoriesPath = path.join(__dirname, '../data/categories.json');
const rulePackPath = path.join(__dirname, '../data/rulePack_v1.json');

function evaluateCompliance(extractedData, rulePackVersion, categoryId, calibrationData) {
  let categories = [];
  try {
    categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  } catch (err) {
    // mock fallback if not loaded
  }
  
  let category = categories.find(c => c.id === categoryId) || { id: 'unknown', whenPackedAllowed: false };

  let allResults = [];
  
  allResults = allResults.concat(evaluateRule6(extractedData, category));
  allResults = allResults.concat(evaluateRule7(extractedData, category, calibrationData));
  allResults = allResults.concat(evaluateRule8(extractedData));
  allResults = allResults.concat(evaluateRule9(extractedData));
  allResults = allResults.concat(evaluateRule11(extractedData, category));
  allResults = allResults.concat(evaluateRule12(extractedData, category));
  allResults = allResults.concat(evaluateRule13(extractedData));
  
  const violations = allResults.filter(r => r.verdict === 'FAIL');
  const penalty = calculatePenalty(violations);
  
  return {
    results: allResults,
    violations: violations,
    penaltyExposure: penalty
  };
}

module.exports = {
  evaluateCompliance
};
