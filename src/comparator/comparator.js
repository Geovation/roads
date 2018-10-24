const io = require('./io.js');
const progress = require('./progress.js');
const compareOSroadWithOSM= require('./compareOSroadWithOSM.js');
const print = require('./print.js');

//compare names of the roads for match betwwen OS and OSM
loop = (input) => {
  let roadCounters = {  //object holds counter of road links
    noMatch: 0,  //counter of zero match
    oneMatch: 0,  //counter of one match
    multiMatch: 0,  //counter of multi match
    noName: 0,  //counter of no names links
    processedOS: 0,  //counter for processed OS roads
    totalRoadsOS: 0
  };
  let mismatch = [], arrayOS = [], arrayOSM = [];
  let startTime = new Date();
  let i = 0;
  [dataOS, dataOSM] = io.read(input[0], input[1]); //read input files
  if (!print.header(dataOS.features.length, dataOSM.features.length)) {
      throw 'ERROR! Input files length error.'
  }
  roadCounters.totalRoadsOS = dataOS.features.length;
  for (let roadOS of dataOS.features) { //loop through OS links
    roadCounters.processedOS ++;
    if (!roadOS.properties.name) { //check if no name increment counter
      // TODO: consider this case.
      roadCounters.noName ++;
      continue;
    }
    compareOSroadWithOSM.compare(roadOS, dataOSM, roadCounters, mismatch, arrayOS, arrayOSM);

    progress.calculate(startTime, roadCounters);
  }
  return [arrayOS, arrayOSM, mismatch, roadCounters];
}

//========== script start here ==========
exports.start = (input, output, time = new Date()) => {
  let promise = new Promise((resolve, reject) => {
    resolve(loop(input));
  });

  promise.then( (values) => { //call main function loop
    console.log('Writing data to files');
    io.write(output[0], values[0]); //write data to files
    io.write(output[1], values[1]);
    io.write(output[2], values[2]);
    print.report(values[3].counters); //print report of number of link matches
    print.footer(time); //print time taken
  });
}
