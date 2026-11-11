// Verify col.js against hand-computed cases. Run: node verify_col.js
var assert = require("assert");
var m = require("./col.js");
var calc = m.calcCOL;
function close(a, b, tol) { assert(Math.abs(a - b) <= tol, "expected " + b + ", got " + a); }

// V1: $80,000, index 100 -> 120 — 20% more expensive city
// ratio 1.2; equivalent 96000; diff +16000; monthly 8000; buys 66666.6667
var v1 = calc({ salary: 80000, indexFrom: 100, indexTo: 120 });
close(v1.ratio, 1.2, 1e-9);
close(v1.equivalent, 96000, 1e-9);
close(v1.difference, 16000, 1e-9);
close(v1.pctChange, 20, 1e-9);
close(v1.monthlyEquivalent, 8000, 1e-9);
close(v1.monthlyCurrent, 80000 / 12, 1e-9);
close(v1.sameSalaryBuys, 80000 / 1.2, 1e-9);

// V2: $60,000, index 85 -> 70 — cheaper city
// ratio 70/85; equivalent 60000*70/85 = 49411.7647; diff -10588.2353;
// pct -17.6471; monthly 4117.6471; buys 60000*85/70 = 72857.1429
var v2 = calc({ salary: 60000, indexFrom: 85, indexTo: 70 });
close(v2.ratio, 70 / 85, 1e-9);
close(v2.equivalent, 60000 * 70 / 85, 1e-9);
close(v2.difference, 60000 * 70 / 85 - 60000, 1e-9);
close(v2.pctChange, (70 / 85 - 1) * 100, 1e-9);
close(v2.monthlyEquivalent, 60000 * 70 / 85 / 12, 1e-9);
close(v2.monthlyCurrent, 5000, 1e-9);
close(v2.sameSalaryBuys, 60000 * 85 / 70, 1e-9);

// V3: $100,000, index 100 -> 150 — 50% more expensive city
var v3 = calc({ salary: 100000, indexFrom: 100, indexTo: 150 });
close(v3.ratio, 1.5, 1e-9);
close(v3.equivalent, 150000, 1e-9);
close(v3.difference, 50000, 1e-9);
close(v3.pctChange, 50, 1e-9);
close(v3.monthlyEquivalent, 12500, 1e-9);
close(v3.sameSalaryBuys, 100000 / 1.5, 1e-9);

// V4: equal indices — same salary, zero change
var v4 = calc({ salary: 75000, indexFrom: 100, indexTo: 100 });
close(v4.ratio, 1, 1e-9);
close(v4.equivalent, 75000, 1e-9);
close(v4.difference, 0, 1e-9);
close(v4.pctChange, 0, 1e-9);
close(v4.monthlyEquivalent, 6250, 1e-9);
close(v4.sameSalaryBuys, 75000, 1e-9);

// V5: $55,000, index 92.5 -> 110.3 — non-round indices, expressions as expected
var v5 = calc({ salary: 55000, indexFrom: 92.5, indexTo: 110.3 });
close(v5.ratio, 110.3 / 92.5, 1e-9);
close(v5.equivalent, 55000 * 110.3 / 92.5, 1e-9);
close(v5.difference, 55000 * 110.3 / 92.5 - 55000, 1e-9);
close(v5.pctChange, (110.3 / 92.5 - 1) * 100, 1e-9);
close(v5.monthlyEquivalent, 55000 * 110.3 / 92.5 / 12, 1e-9);
close(v5.sameSalaryBuys, 55000 * 92.5 / 110.3, 1e-9);

// Invalid inputs return null
assert.strictEqual(calc({ salary: 0, indexFrom: 100, indexTo: 120 }), null);
assert.strictEqual(calc({ salary: 80000, indexFrom: 0, indexTo: 120 }), null);
assert.strictEqual(calc({ salary: 80000, indexFrom: 100, indexTo: 0 }), null);
assert.strictEqual(calc({ salary: -50000, indexFrom: 100, indexTo: 120 }), null);
assert.strictEqual(calc({ salary: 80000, indexFrom: -100, indexTo: 120 }), null);
console.log("verify_col: all assertions passed");
