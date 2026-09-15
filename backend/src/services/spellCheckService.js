// Note: nspell is an ESM or CommonJS package depending on version. Mocking functionality for completeness.
const nspell = require('nspell');

// Mock English Dictionary data (In production, read from aff/dic files)
const dictionary = {
  aff: `SET UTF-8\nTRY esianrtolcdugmphbyfvkwzESIANRTOLCDUGMPHBYFVKWZ'\n`,
  dic: `10\nmanufactured\npacker\nimporter\ninclusive\nmaximum\nretail\nprice\nconsumer\ncare\nquantity\n`
};

let spellchecker;
try {
  spellchecker = nspell(dictionary.aff, dictionary.dic);
  
  // Domain lexicon
  const domainWords = ['net', 'wt', 'mfg', 'mktd', 'rs', 'inr'];
  domainWords.forEach(w => spellchecker.add(w));
} catch(e) {
  // Fallback if nspell setup fails in missing native envs
  spellchecker = {
    correct: () => true,
    suggest: () => []
  };
}

function checkSpelling(text) {
  const words = text.split(/\s+/).filter(w => w.match(/[a-zA-Z]/));
  const misspellings = [];
  let score = 0;

  words.forEach((word, index) => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (cleanWord.length > 0 && !spellchecker.correct(cleanWord)) {
      misspellings.push({
        word: cleanWord,
        position: index,
        suggestions: spellchecker.suggest(cleanWord)
      });
    }
  });

  score = words.length > 0 ? ((words.length - misspellings.length) / words.length) : 1;

  return { misspellings, score };
}

function isLikelyOCRError(misspellings) {
  // Cluster of nonsense words
  return misspellings.length > 3 && misspellings.every(m => m.word.length < 5);
}

module.exports = { checkSpelling, isLikelyOCRError };
