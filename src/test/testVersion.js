import Version from '../Version';
import test from 'unit.js';

/**
describe('my suite', () => {
  // test cases
  it('my test', () => {
    // should set the timeout of this test to 1000 ms; instead will fail
    this.timeout(1000);
    assert.ok(true);
  });
});

describe.only // Only test this suite
describe.skip // Skip this suite
it.only // Only test this test
it.skip // Skip test this test

before // before the test suite
after // after the test suite
beforeEach // before the each test case
AfterEach // after the each test case

describe('Array', function() {
  describe('#indexOf()', function() {
    it.skip('should return -1 unless present', function() {
      // this test will not be run
    });

    it('should return the index when present', function() {
      // this test will be run
    });
  });
});

 */

// test suite
describe('Version', () => {
    // test case
    it('should be parsed correctly', () => {
        let v = new Version();
        test.number(v.major).is(0);
        test.number(v.minor).is(0);
        test.number(v.revision).is(0);

        v = new Version('1');
        test.number(v.major).is(1);
        test.number(v.minor).is(0);
        test.number(v.revision).is(0);

        v = new Version('1.1');
        test.number(v.major).is(1);
        test.number(v.minor).is(1);
        test.number(v.revision).is(0);

        v = new Version('1.1.1');
        test.number(v.major).is(1);
        test.number(v.minor).is(1);
        test.number(v.revision).is(1);
    });

    it('should be parsed with expected exception', () => {
        test.exception(() => {
            new Version('a');
        });
        test.exception(() => {
            new Version('1.a');
        });
        test.exception(() => {
            new Version('1.1.a');
        });
    });
});