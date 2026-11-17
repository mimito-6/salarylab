// Verify realraise.js against hand-computed cases. Run: node verify_realraise.js
var assert = require("assert");
var m = require("./realraise.js");
var calc = m.calcRealRaise;
var needed = m.calcNominalNeeded;
function close(a, b, tol) { assert(Math.abs(a - b) <= tol, "expected " + b + ", got " + a); }

// V1: $60,000 + 5% raise, 3% inflation (independent Python check)
var v1 = calc({ current: 60000, raisePct: 5, inflationPct: 3 });
close(v1.newNominal, 63000, 1e-9);
close(v1.standStill, 61800, 1e-9);
close(v1.realSalary, 63000 / 1.03, 1e-6);
close(v1.realRaisePct, (1.05 / 1.03 - 1) * 100, 1e-9);
close(v1.ppGain, 63000 / 1.03 - 60000, 1e-6);
close(v1.nominalSurplus, 1200, 1e-9);
close(v1.breakEvenPct, 3, 1e-9);
close(v1.newMonthly, 5250, 1e-9);
close(v1.realMonthly, 63000 / 1.03 / 12, 1e-6);
// exact figures quoted on the page
close(v1.realSalary, 61165.05, 0.01);
close(v1.realRaisePct, 1.9417, 0.0001);
close(v1.ppGain, 1165.05, 0.01);

// V2: $80,000 + 2% raise, 3.5% inflation — a real pay cut
var v2 = calc({ current: 80000, raisePct: 2, inflationPct: 3.5 });
close(v2.newNominal, 81600, 1e-9);
close(v2.standStill, 82800, 1e-9);
close(v2.realSalary, 81600 / 1.035, 1e-6);
close(v2.realRaisePct, (1.02 / 1.035 - 1) * 100, 1e-9);
close(v2.ppGain, 81600 / 1.035 - 80000, 1e-6);
close(v2.nominalSurplus, -1200, 1e-9);
close(v2.realSalary, 78840.58, 0.01);
close(v2.realRaisePct, -1.4493, 0.0001);
close(v2.ppGain, -1159.42, 0.01);

// V3: $50,000 + 0% raise, 4% inflation
var v3 = calc({ current: 50000, raisePct: 0, inflationPct: 4 });
close(v3.newNominal, 50000, 1e-9);
close(v3.realSalary, 50000 / 1.04, 1e-6);
close(v3.realRaisePct, (1 / 1.04 - 1) * 100, 1e-9);
close(v3.realSalary, 48076.92, 0.01);
close(v3.realRaisePct, -3.8462, 0.0001);

// V4: $75,000 + 8% raise, 2.5% inflation
var v4 = calc({ current: 75000, raisePct: 8, inflationPct: 2.5 });
close(v4.newNominal, 81000, 1e-9);
close(v4.realSalary, 81000 / 1.025, 1e-6);
close(v4.realRaisePct, (1.08 / 1.025 - 1) * 100, 1e-9);
close(v4.realSalary, 79024.39, 0.01);
close(v4.realRaisePct, 5.3659, 0.0001);
close(v4.ppGain, 4024.39, 0.01);

// V5: break-even — raise equals inflation
var v5 = calc({ current: 60000, raisePct: 3, inflationPct: 3 });
close(v5.realSalary, 60000, 1e-9);
close(v5.realRaisePct, 0, 1e-9);
close(v5.ppGain, 0, 1e-9);

// V6: deflation — $60,000 + 3% raise, -1% inflation
var v6 = calc({ current: 60000, raisePct: 3, inflationPct: -1 });
close(v6.realSalary, 61800 / 0.99, 1e-6);
close(v6.realRaisePct, (1.03 / 0.99 - 1) * 100, 1e-9);
close(v6.realSalary, 62424.24, 0.01);
close(v6.realRaisePct, 4.0404, 0.0001);

// Reverse lookup: nominal raise needed for a target real raise
var n1 = needed({ current: 60000, realTargetPct: 2, inflationPct: 3 });
close(n1.nominalPct, 5.06, 1e-9);
close(n1.newNominal, 63036, 1e-9);
var n2 = needed({ current: 60000, realTargetPct: 0, inflationPct: 3 });
close(n2.nominalPct, 3, 1e-9);
var n3 = needed({ current: 60000, realTargetPct: 5, inflationPct: 2 });
close(n3.nominalPct, 7.1, 1e-9);
// deflation can make a real raise free
assert.strictEqual(needed({ current: 60000, realTargetPct: 1, inflationPct: -2 }), null);

// Invalid inputs return null
assert.strictEqual(calc({ current: 0, raisePct: 5, inflationPct: 3 }), null);
assert.strictEqual(calc({ current: 60000, raisePct: -3, inflationPct: 3 }), null);
assert.strictEqual(calc({ current: 60000, raisePct: 5, inflationPct: 100 }), null);
assert.strictEqual(calc({ current: 60000, raisePct: 5, inflationPct: -100 }), null);
assert.strictEqual(needed({ current: 0, realTargetPct: 2, inflationPct: 3 }), null);
// a negative real target is still computable (nominal raise still positive here)
var n4 = needed({ current: 60000, realTargetPct: -1, inflationPct: 3 });
close(n4.nominalPct, 1.97, 1e-9);
close(n4.newNominal, 61182, 1e-9);
console.log("verify_realraise: all assertions passed");
