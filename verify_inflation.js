// Verify inflation.js against hand-computed cases. Run: node verify_inflation.js
var assert = require("assert");
var m = require("./inflation.js");
var calc = m.calcInflation;
function close(a, b, tol) { assert(Math.abs(a - b) <= tol, "expected " + b + ", got " + a); }

// V1: $50,000, 10 years @ 3% — factor 1.03^10 = 1.3439163793
// equivalent 67195.81897; diff +17195.81897; pct +34.3916;
// monthly 5599.6516; real value 37204.69574
var v1 = calc({ salary: 50000, years: 10, rate: 3 });
close(v1.factor, Math.pow(1.03, 10), 1e-9);
close(v1.equivalent, 50000 * Math.pow(1.03, 10), 1e-6);
close(v1.difference, 50000 * Math.pow(1.03, 10) - 50000, 1e-6);
close(v1.pctChange, (Math.pow(1.03, 10) - 1) * 100, 1e-9);
close(v1.monthlyEquivalent, 50000 * Math.pow(1.03, 10) / 12, 1e-6);
close(v1.monthlyCurrent, 50000 / 12, 1e-9);
close(v1.realValue, 50000 / Math.pow(1.03, 10), 1e-6);

// V2: $80,000, 5 years @ 2.5% — factor 1.025^5 = 1.1314082129
// equivalent 90512.65703; diff +10512.65703; pct +13.1408; real 70708.34301
var v2 = calc({ salary: 80000, years: 5, rate: 2.5 });
close(v2.factor, Math.pow(1.025, 5), 1e-9);
close(v2.equivalent, 80000 * Math.pow(1.025, 5), 1e-6);
close(v2.difference, 80000 * Math.pow(1.025, 5) - 80000, 1e-6);
close(v2.pctChange, (Math.pow(1.025, 5) - 1) * 100, 1e-9);
close(v2.monthlyEquivalent, 80000 * Math.pow(1.025, 5) / 12, 1e-6);
close(v2.realValue, 80000 / Math.pow(1.025, 5), 1e-6);

// V3: $60,000, 20 years @ 3% — factor 1.03^20 = 1.8061112347
// equivalent 108366.67408; real 33220.54525
var v3 = calc({ salary: 60000, years: 20, rate: 3 });
close(v3.factor, Math.pow(1.03, 20), 1e-9);
close(v3.equivalent, 60000 * Math.pow(1.03, 20), 1e-6);
close(v3.realValue, 60000 / Math.pow(1.03, 20), 1e-6);

// V4: $40,000, 15 years @ 4% — factor 1.04^15 = 1.8009435055
// equivalent 72037.74022; real 22210.58011
var v4 = calc({ salary: 40000, years: 15, rate: 4 });
close(v4.factor, Math.pow(1.04, 15), 1e-9);
close(v4.equivalent, 40000 * Math.pow(1.04, 15), 1e-6);
close(v4.realValue, 40000 / Math.pow(1.04, 15), 1e-6);

// V5: deflation — $50,000, 10 years @ -1% — factor 0.99^10 = 0.9043820750
// equivalent 45219.10375 (less than the original); real 55286.36777
var v5 = calc({ salary: 50000, years: 10, rate: -1 });
close(v5.factor, Math.pow(0.99, 10), 1e-9);
close(v5.equivalent, 50000 * Math.pow(0.99, 10), 1e-6);
close(v5.difference, 50000 * Math.pow(0.99, 10) - 50000, 1e-6);
close(v5.pctChange, (Math.pow(0.99, 10) - 1) * 100, 1e-9);
close(v5.realValue, 50000 / Math.pow(0.99, 10), 1e-6);

// V6: 0% rate — factor 1, everything unchanged
var v6 = calc({ salary: 75000, years: 10, rate: 0 });
close(v6.factor, 1, 1e-9);
close(v6.equivalent, 75000, 1e-9);
close(v6.difference, 0, 1e-9);
close(v6.pctChange, 0, 1e-9);
close(v6.realValue, 75000, 1e-9);

// Guide table: $50,000 at 3% — year-by-year equivalents
var table = [1, 5, 10, 15, 20, 25, 30].map(function (y) { return 50000 * Math.pow(1.03, y); });
close(table[0], 51500, 1e-6);
close(table[1], 57963.70, 0.01);
close(table[2], 67195.82, 0.01);
close(table[3], 77898.37, 0.01);
close(table[4], 90305.56, 0.01);
close(table[5], 104688.90, 0.01);
close(table[6], 121363.12, 0.01);

// Rule of 72: at 3%, prices roughly double in 24 years (72 / 3)
close(Math.pow(1.03, 24), 2.0328, 0.001);

// Invalid inputs return null
assert.strictEqual(calc({ salary: 0, years: 10, rate: 3 }), null);
assert.strictEqual(calc({ salary: -50000, years: 10, rate: 3 }), null);
assert.strictEqual(calc({ salary: 50000, years: 0, rate: 3 }), null);
assert.strictEqual(calc({ salary: 50000, years: 51, rate: 3 }), null);
assert.strictEqual(calc({ salary: 50000, years: 10, rate: -6 }), null);
assert.strictEqual(calc({ salary: 50000, years: 10, rate: 21 }), null);
console.log("verify_inflation: all assertions passed");
