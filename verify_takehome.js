// Verify takehome.js against hand-computed cases. Run: node verify_takehome.js
var assert = require("assert");
var calc = require("./takehome.js").calcTakeHome;
function close(a, b, tol) { assert(Math.abs(a - b) <= tol, "expected " + b + ", got " + a); }

// V1: $2,375 biweekly, 22% tax, $150 other
var v1 = calc({ gross: 2375, checksPerYear: 26, taxRatePct: 22, other: 150 });
close(v1.tax, 522.50, 1e-9);
close(v1.net, 1702.50, 1e-9);
close(v1.annualNet, 44265, 1e-9);
close(v1.monthlyNet, 3688.75, 1e-9);
close(v1.takeHomePct, 1702.5 / 2375 * 100, 1e-9);

// V2: $5,000 monthly, 18% tax, no other deductions
var v2 = calc({ gross: 5000, checksPerYear: 12, taxRatePct: 18, other: 0 });
close(v2.tax, 900, 1e-9);
close(v2.net, 4100, 1e-9);
close(v2.annualNet, 49200, 1e-9);
close(v2.monthlyNet, 4100, 1e-9);
close(v2.takeHomePct, 82, 1e-9);

// V3: $1,000 weekly, 0% tax, $50 other — monthly is annual/12, not weekly*4
var v3 = calc({ gross: 1000, checksPerYear: 52, taxRatePct: 0, other: 50 });
close(v3.net, 950, 1e-9);
close(v3.annualNet, 49400, 1e-9);
close(v3.monthlyNet, 49400 / 12, 1e-9);
close(v3.takeHomePct, 95, 1e-9);

// V4: biweekly monthly conversion uses 26/12, not 2x
var v4 = calc({ gross: 2000, checksPerYear: 26, taxRatePct: 10, other: 0 });
close(v4.net, 1800, 1e-9);
close(v4.monthlyNet, 1800 * 26 / 12, 1e-9);

// Invalid inputs return null
assert.strictEqual(calc({ gross: 0, checksPerYear: 26, taxRatePct: 20, other: 0 }), null);
assert.strictEqual(calc({ gross: 1000, checksPerYear: 26, taxRatePct: 101, other: 0 }), null);
assert.strictEqual(calc({ gross: 1000, checksPerYear: 26, taxRatePct: 20, other: 900 }), null); // net < 0
assert.strictEqual(calc({ gross: 1000, checksPerYear: 26, taxRatePct: -5, other: 0 }), null);
console.log("verify_takehome: all assertions passed");
