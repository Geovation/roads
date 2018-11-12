const {roadFlow}  = require('../src/index.js')

const inputFiles = {
  "OS": './input/London_OS.gpkg',
  "OSM": './input/London_OSM.pbf'
};

const outputFiles = {
  "OS": './output/onewayUKOS.json',
  "OSM": './output/onewayUKOSM.json',
  "Info":'./output/onewayMismatch.json'
};

const tempFiles = {
  "OS": './temp/OS.json',
  "OSM": './temp/OSM.json'
};

roadFlow(inputFiles, outputFiles, tempFiles);