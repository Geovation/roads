const assert = require('assert');
const {inRange} = require('../src/comparator/checker.js');

describe('checker.js function "inRange" checks distance between statring points of two links if there are in range', () => {
  it('Test when road links in range. Return true', () => {
    const input1 = {"geometry": {"coordinates": [[0.13, 52],[0.1, 53], [0, 54]]}};
    const input2 = {"geometry": {"coordinates": [[0.131, 52],[0.1, 53], [0, 54]]}};;
    const expected = true;
    const output = inRange(input1, input2);
    assert.equal(expected, output);
  });

  it('Test when road links not in range. Return false', () => {
    const input1 = {"geometry": {"coordinates": [[0.15, 52],[0.1, 53], [0, 54]]}};
    const input2 = {"geometry": {"coordinates": [[0.131, 52],[0.1, 53], [0, 54]]}};;
    const expected = false;
    const output = inRange(input1, input2);
    assert.equal(expected, output);
  });
});
