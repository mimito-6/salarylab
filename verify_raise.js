// Verify raise.js against hand-computed cases. Run: node verify_raise.js
var assert = require("assert");
var m = require("./raise.js");
var calc = m.calcRaise;
var needed = m.calcNeededPct;
function close(a, b, tol) { assert(Math.abs(a - b) <= tol, "expected " + b + ", got " + a); }

// V1: $60,000 + 5%, 40h x 52w
var v1 = calc({ current: 60000, pct: 5, hoursPerWeek: 40, weeksPerYear: 52 });
close(v1.newAnnual, 63000, 1e-9);
close(v1.annualDiff, 3000, 1e-9);
close(v1.monthlyDiff, 250, 1e-9);
close(v1.newMonthly, 5250, 1e-9);
close(v1.currentMonthly, 5000, 1e-9);
close(v1.hourlyOld, 60000 / 2080, 1e-9);
close(v1.hourlyNew, 63000 / 2080, 1e-9);
close(v1.hourlyDiff, 3000 / 2080, 1e-9);

// V2: $80,000 + 10%, 40h x 52w
var v2 = calc({ current: 80000, pct: 10, hoursPerWeek: 40, weeksPerYear: 52 });
close(v2.newAnnual, 88000, 1e-9);
close(v2.annualDiff, 8000, 1e-9);
close(v2.monthlyDiff, 8000 / 12, 1e-9);
close(v2.hourlyOld, 80000 / 2080, 1e-9);
close(v2.hourlyNew, 88000 / 2080, 1e-9);

// V3: 0% raise is valid, all diffs zero
var v3 = calc({ current: 52000, pct: 0, hoursPerWeek: 40, weeksPerYear: 52 });
close(v3.newAnnual, 52000, 1e-9);
close(v3.annualDiff, 0, 1e-9);
close(v3.monthlyDiff, 0, 1e-9);
close(v3.hourlyDiff, 0, 1e-9);

// V4: part-time $30,000 + 7.5%, 20h x 52w (1040h year, not 2080)
var v4 = calc({ current: 30000, pct: 7.5, hoursPerWeek: 20, weeksPerYear: 52 });
close(v4.newAnnual, 32250, 1e-9);
close(v4.annualDiff, 2250, 1e-9);
close(v4.hourlyOld, 30000 / 1040, 1e-9);
close(v4.hourlyNew, 32250 / 1040, 1e-9);
close(v4.hourlyDiff, 2250 / 1040, 1e-9);

// V5: seasonal 48 weeks, $30 x 35h base check via annual route
var v5 = calc({ current: 50400, pct: 4, hoursPerWeek: 35, weeksPerYear: 48 });
close(v5.newAnnual, 52416, 1e-9);
close(v5.annualDiff, 2016, 1e-9);
close(v5.hourlyOld, 50400 / 1680, 1e-9);

// Reverse: target lookup
close(needed({ current: 60000, target: 63000 }), 5, 1e-9);
close(needed({ current: 60000, target: 66000 }), 10, 1e-9);
close(needed({ current: 60000, target: 60000 }), 0, 1e-9);
close(needed({ current: 50000, target: 62500 }), 25, 1e-9);

// Invalid inputs return null
assert.strictEqual(calc({ current: 0, pct: 5, hoursPerWeek: 40, weeksPerYear: 52 }), null);
assert.strictEqual(calc({ current: 60000, pct: -3, hoursPerWeek: 40, weeksPerYear: 52 }), null);
assert.strictEqual(calc({ current: 60000, pct: 5, hoursPerWeek: 0, weeksPerYear: 52 }), null);
assert.strictEqual(calc({ current: 60000, pct: 5, hoursPerWeek: 40, weeksPerYear: 0 }), null);
assert.strictEqual(needed({ current: 0, target: 60000 }), null);
assert.strictEqual(needed({ current: 60000, target: 55000 }), null);
console.log("verify_raise: all assertions passed");
