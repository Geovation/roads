//module to compare names of two road
const stringSimilarity = require('string-similarity');
exports.compare = (nameOne, nameTwo) => {
  console.log("XXXXXX ", stringSimilarity.compareTwoStrings(nameOne, nameTwo))
  const similarRtn = stringSimilarity.compareTwoStrings(nameOne, nameTwo) > 0.6;
  return similarRtn && !!nameOne ;
}
