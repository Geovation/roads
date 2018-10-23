//module to find distance between first node of two links

const turf = require('@turf/turf');

exports.inRange = (roadOne, roadTwo, range = 1) => {
  if (!roadOne || !roadTwo) { // check if road links are not empty
    return false;
  }
  if (!roadOne.geometry.coordinates || !roadOne.geometry.coordinates.length) {
    return false;
  }
  if (!roadTwo.geometry.coordinates || !roadTwo.geometry.coordinates.length) {
    return false;
  }

  // find 1 point in first road
  const pointOne = roadOne.geometry.coordinates[0];
  // find 1 point in second road
  const pointTwo = roadTwo.geometry.coordinates[0];
  // find distance
  const distance = turf.distance(pointOne, pointTwo);
  // if longer than the range (in km) return false
  console.log(distance);
  if (distance > range) {
    return false;
  }
  return true;
}
