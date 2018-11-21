const fs = require('fs');

exports.filterDuplication = (features) => {
  let i = 1;
  while (i < features.length) {
    if (features[i].properties.id === features[i-1].properties.id) {
      features.splice(i, 1);
    } else {
      i++;
    }
  }
  return features;
}
