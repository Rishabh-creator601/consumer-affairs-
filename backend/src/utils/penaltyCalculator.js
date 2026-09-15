function calculatePenalty(violations) {
  let total = 0;
  const breakdown = [];
  
  for (const v of violations) {
    if (v.verdict === 'FAIL') {
      const ruleId = v.ruleId;
      let amt = 2000;
      if (['R31_2'].includes(ruleId)) {
        amt = 4000;
      }
      total += amt;
      breakdown.push({ ruleId, penalty: amt, citation: v.citation });
    }
  }
  
  return { total, breakdown };
}

module.exports = {
  calculatePenalty
};
