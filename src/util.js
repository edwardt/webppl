'use strict';

var _ = require('underscore');


function runningInBrowser() {
  return (typeof window !== 'undefined');
}

function makeGensym() {
  var seq = 0;
  return function(prefix) {
    var result = prefix + seq;
    seq += 1;
    return result;
  };
}

var gensym = makeGensym();

function prettyJSON(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

function sum(xs) {
  if (xs.length === 0) {
    return 0.0;
  } else {
    var total = _(xs).reduce(
        function(a, b) {
          return a + b;
        });
    return total;
  }
}

function normalizeHist(hist) {
  var normHist = {};
  var Z = sum(_.values(hist));
  _.each(hist, function(val, key) {
    normHist[key] = hist[key] / Z;
  });
  return normHist;
}

function normalizeArray(xs) {
  var Z = sum(xs);
  return xs.map(function(x) {
    return x / Z;
  });
}

function logsumexp(a) {
  var m = Math.max.apply(null, a);
  var sum = 0;
  for (var i = 0; i < a.length; ++i) {
    sum += (a[i] === -Infinity ? 0 : Math.exp(a[i] - m));
  }
  return m + Math.log(sum);
}

// More efficient version of (indexOf o map p)
var indexOfPred = function(l, p, start) {
  var start = start || 0;
  for (var i = start; i < l.length; i++) {
    if (p(l[i])) {
      return i;
    }
  }
  return -1;
};

// more efficient version of (indexOf o map p o reverse)
var lastIndexOfPred = function(l, p, start) {
  var start = start || l.length - 1;
  for (var i = start; i >= 0; i--) {
    if (p(l[i])) return i;
  }
  return -1;
};

// func(x, i, xs, nextK)
// nextK()
function cpsForEach(func, nextK, xs, i) {
  i = (i === undefined) ? 0 : i;
  if (i === xs.length) {
    return nextK();
  } else {
    return func(xs[i], i, xs, function() {
      return cpsForEach(func, nextK, xs, i + 1);
    });
  }
}

function histsApproximatelyEqual(hist, expectedHist, tolerance) {
  var allOk = true;
  _.each(
      expectedHist,
      function(expectedValue, key) {
        var value = hist[key] || 0;
        var testPassed = Math.abs(value - expectedValue) <= tolerance;
        allOk = allOk && testPassed;
      });
  if (!allOk) {
    console.log('Expected:', expectedHist);
    console.log('Actual:', hist);
  }
  return allOk;
}

module.exports = {
  cpsForEach: cpsForEach,
  gensym: gensym,
  logsumexp: logsumexp,
  indexOfPred: indexOfPred,
  lastIndexOfPred: lastIndexOfPred,
  makeGensym: makeGensym,
  normalizeArray: normalizeArray,
  normalizeHist: normalizeHist,
  prettyJSON: prettyJSON,
  runningInBrowser: runningInBrowser,
  sum: sum,
  histsApproximatelyEqual: histsApproximatelyEqual
};
