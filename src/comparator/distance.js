//module to find distance between first node of two links

const turf = require('@turf/turf');

exports.inRange = (roadOne, roadTwo, range = 1) => {
  if (!!roadOne && !!roadTwo) { // check if road links are not empty
    const coordinatesOne = roadOne.geometry.coordinates;
    const coordinatesTwo = roadTwo.geometry.coordinates;
    if ( (coordinatesOne && coordinatesOne.length) &&
         (coordinatesTwo && coordinatesTwo.length) ) {
      // find 1 point in first road
      const pointOne = coordinatesOne[0];
      // find 1 point in second road
      const pointTwo = coordinatesTwo[0];
      // find distance
      const distance = turf.distance(pointOne, pointTwo);
      // if longer than the range (in km) return false
      if (distance < range) {
        return true;
      }
    }
  }
  return false;
}
