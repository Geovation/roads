const turf = require('@turf/turf');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const config = require('./comparator-config.json');

let dataOS,
    dataOSM = [];

// === Extract data from file ===========================
readFile = (path) => {
  return fs.readFileAsync(path); //return file data
}

// === Write data to file ================================
writeFile = (path, data) => {
  return fs.writeFileAsync(path, data); //return file data
}

//  === Extract data from each file =======================
readAllFiles = () => {
  var promises = [];
  promises.push(readFile(config.inputFileOS)); //read in OS file first
  promises.push(readFile(config.inputFileOSM)); //read in OSM file second
  return Promise.all(promises); //return promise that is resolved when all files are done loading
}

// === Create or append to output files specified in config file ====
createOutputFiles = () => {
  var promises = [];

  if (config.outputMode === "new") { //if user wants new output files
    promises.push(writeFile(config.outputFileOS, JSON.stringify({"roads": []}, null, 2)));
    promises.push(writeFile(config.outputFileOSM, JSON.stringify({"roads": []}, null, 2)));
    return Promise.all(promises); //create new output files
  } else if (config.outputMode === "append"){
    return Promise.resolve(true); // else files already exist
  } else {
    return console.error("Please enter new or append for output mode.");
  }
}

// === Start comparing data sets ======================
createOutputFiles().then((res) => {
  readAllFiles().then((res) => {
    dataOS = JSON.parse(res[0].toString()); //parse OS data
    dataOSM = JSON.parse(res[res.length-1].toString()); //parse OSM data

    const numOfRoadsOS = dataOS.features.length; //number of OS roads to check
    const numOfRoadsOSM = dataOSM.features.length; //number of OS roads to check
    console.log(numOfRoadsOS + "  " + numOfRoadsOSM);
    let numOfRoadsChecked = 0; //number of OS roads that have been checked
    let zeroCounter = oneCounter = multiCounter = noNameCounter = 0;
    let onewayCounterOS = onewayCounterOSM = directionMatches = 0;
    let isOnewayOSM;

    // for every OS road
    for (var i = 0; i < numOfRoadsOS; i++) {
      let isOnewayOS = false;
      let roadOSName = dataOS.features[i].properties.roadname ? dataOS.features[i].properties.roadname : "";
      roadOSName = roadOSName.slice(3,roadOSName.length-1).toLowerCase();
      let direction = dataOS.features[i].properties.directionality ? dataOS.features[i].properties.directionality : "";
      if(direction.slice(0,1) == "in"){
        onewayCounterOS ++;
        isOnewayOS = true;
        let directionAngleOS = onewayDirection(dataOS.features[i].properties.geometry.coordinates);
        if(dataOS.features[i].properties.directionality == "in opposite direction"){
          directionAngleOS += 180;
        }
      }

      let roadOSMName;
      let numOfMatches = 0;

      // for every OSM road
      for (var j = 0; j < numOfRoadsOSM; j++) {
        // extract street name in OSM data
        roadOSMName = dataOSM.features[j].properties.name ? dataOSM.features[j].properties.name.toLowerCase() : "";

        if ((roadOSName == roadOSMName) && (roadOSName != "")){
          numOfMatches++;
          compareRoadsForOverlap(dataOS.features[i], dataOSM.features[j]);
          // find oneway tag and extract it from the string "other_tags" in OSM JSON data
          if(dataOSM.features[j].properties.other_tags && isOnewayOS){
            let index = dataOSM.features[j].properties.other_tags.search("oneway");
            //check if search finds "oneway" substring and if first letter is n or y for no and yes respectively.
            if(index == -1 || dataOSM.features[j].properties.other_tags.charAt(index+10).toLowerCase() == "n"){
              continue;  // if not oneway continue loop. This code should be manipulated when looking for other road properties.
            } else if (dataOSM.features[j].geometry){
              onewayCounterOSM ++;
              let directionAngleOSM = onewayDirection(dataOSM.features[j].geometry.coordinates);
              if(Math.abs(directionAngleOS - directionAngleOSM) < 20){
                directionMatches ++;
              }
              console.log(roadOSMName + "  " + directionAngleOSM);
            }
          }
        }
      }

      switch(numOfMatches){
        case 0:
          zeroCounter++;
          break;
        case 1:
          oneCounter++;
          break;
        default:
          if (roadOSName != "" ){
            multiCounter++;
          } else {
            noNameCounter++;
          }
        }
        console.log("Number of matches of segment " + roadOSName.toUpperCase() + " from OS are " + numOfMatches + " in OSM");
        console.log(dataOS.features[i].properties.gml_id);
      }
      console.log("Number of roads from OS with NO match in OSM: \t\t" + zeroCounter);
      console.log("Number of roads from OS with ONE match in OSM: \t\t" + oneCounter);
      console.log("Number of roads from OS with MULTIPLE match in OSM: \t" + multiCounter);
      console.log("Number of roads without a name in OS: \t\t\t" + noNameCounter);
console.log("OS: " + numOfRoadsOS + "  OSM: " +  numOfRoadsOSM);
  });
});

//  ==== Start finding Direction of oneway roads ==================
onewayDirection = (roadCoordinates) => {
  let index = roadCoordinates.length - 1;
  let xDifference = roadCoordinates[index][0] - roadCoordinates[0][0];
  let yDifference = roadCoordinates[index][1] - roadCoordinates[0][1];
  let tanTheta = Math.atan(Math.abs(yDifference/xDifference));
/*console.log("x:  " + roadCoordinates[index][0] +  "   "  + roadCoordinates[0][0]);
console.log("y:  " + roadCoordinates[index][1] +  "   "  + roadCoordinates[0][1]);
console.log(xDifference + "   " + yDifference);*/
  switch(true){
    case (xDifference >= 0 && yDifference >= 0):  //angle in 1st quadratic
      return convertToDegree(tanTheta);
      break;
    case (xDifference < 0 && yDifference >= 0):  //angle in 2nd quadratic
      return convertToDegree(Math.PI - tanTheta);
      break;
    case (xDifference < 0 && yDifference < 0):  //angle in 3rd quadratic
      return convertToDegree(tanTheta - Math.PI);
      break;
    case (xDifference >= 0 && yDifference < 0):  //angle in 4th quadratic
      return convertToDegree(-tanTheta);
      break;
  }
}

convertToDegree = (angle) => {
  return angle * (180 / Math.PI);
}

compareRoadsForOverlap = (road1, road2) => {
  if((road1.geometry.coordinates != NaN) & (road2.geometry.coordinates != NaN)){
    const turfRoad1 = turf.lineString(road1.geometry.coordinates); //convert OS road to turf linestring
    const turfRoad2 = turf.lineString(road2.geometry.coordinates); //convert OSM road to turf linestring
    console.log( turf.lineOverlap(turfRoad1, turfRoad2, {tolerance: 0.01}).features.length + "    " + road2.properties.osm_id);
  }
}
