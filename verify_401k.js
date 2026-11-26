// Verify 401k.js against hand-computed cases (figures precomputed in Python). Run: node verify_401k.js
var assert = require("assert");
var m = require("./401k.js");
var calc = m.calc401k;
function close(a, b, tol) { assert(Math.abs(a - b) <= tol, "expected " + b + ", got " + a); }

// V1: $80,000, contribute 6%, employer matches 50% up to 6%, 30 years at 7%
var v1 = calc({ salary: 80000, contribPct: 6, matchPct: 50, matchCapPct: 6, years: 30, returnPct: 7 });
close(v1.employeeRaw, 4800, 1e-9);
close(v1.employee, 4800, 1e-9);
assert.strictEqual(v1.capped, false);
close(v1.employer, 2400, 1e-9);
close(v1.total, 7200, 1e-9);
close(v1.missedMatch, 0, 1e-9);
close(v1.monthlyEmployee, 400, 1e-9);
close(v1.monthlyTotal, 600, 1e-9);
close(v1.effectiveRatePct, 9, 1e-9);
// FV factor for 30 years at 7% is 94.460786 (independent Python check)
close(v1.fvTotal, 680117.66, 0.01);
close(v1.fvEmployee, 453411.77, 0.01);
close(v1.fvEmployer, 226705.89, 0.01);

// V2: $100,000, contribute 3%, employer matches 100% up to 4% — leaves $1,000 of match behind
var v2 = calc({ salary: 100000, contribPct: 3, matchPct: 100, matchCapPct: 4, years: 30, returnPct: 7 });
close(v2.employee, 3000, 1e-9);
close(v2.employer, 3000, 1e-9);
close(v2.total, 6000, 1e-9);
close(v2.missedMatch, 1000, 1e-9);
close(v2.monthlyEmployee, 250, 1e-9);
close(v2.monthlyTotal, 500, 1e-9);
close(v2.effectiveRatePct, 6, 1e-9);
close(v2.fvTotal, 566764.72, 0.01);

// V3: $60,000, contribute 10%, employer matches 50% up to 6%, 20 years at 7%
var v3 = calc({ salary: 60000, contribPct: 10, matchPct: 50, matchCapPct: 6, years: 20, returnPct: 7 });
close(v3.employee, 6000, 1e-9);
close(v3.employer, 1800, 1e-9); // match only applies to the first 6% of salary ($3,600)
close(v3.total, 7800, 1e-9);
close(v3.missedMatch, 0, 1e-9);
close(v3.effectiveRatePct, 13, 1e-9);
// FV factor for 20 years at 7% is 40.995492
close(v3.fvTotal, 319764.84, 0.01);

// V4: IRS cap — $300,000 at 10% would be $30,000, capped at the 2026 limit $24,500
var v4 = calc({ salary: 300000, contribPct: 10, matchPct: 50, matchCapPct: 6, years: 30, returnPct: 7 });
close(v4.employeeRaw, 30000, 1e-9);
close(v4.employee, 24500, 1e-9);
assert.strictEqual(v4.capped, true);
close(v4.employer, 9000, 1e-9); // min(24500, 18000) * 50%
close(v4.total, 33500, 1e-9);
close(v4.missedMatch, 0, 1e-9);

// V5: contribute 0% — everything is missed match
var v5 = calc({ salary: 80000, contribPct: 0, matchPct: 50, matchCapPct: 6, years: 30, returnPct: 7 });
close(v5.employee, 0, 1e-9);
close(v5.employer, 0, 1e-9);
close(v5.total, 0, 1e-9);
close(v5.missedMatch, 2400, 1e-9);
close(v5.fvTotal, 0, 1e-9);

// V6: return sensitivity — same V1 inputs at 5% instead of 7%
var v6 = calc({ salary: 80000, contribPct: 6, matchPct: 50, matchCapPct: 6, years: 30, returnPct: 5 });
close(v6.fvTotal, 478359.70, 0.01);

// V7: zero return — future value is just contributions times years
var v7 = calc({ salary: 80000, contribPct: 6, matchPct: 50, matchCapPct: 6, years: 30, returnPct: 0 });
close(v7.fvTotal, 7200 * 30, 1e-9);

// V8: zero years — no projection yet
var v8 = calc({ salary: 80000, contribPct: 6, matchPct: 50, matchCapPct: 6, years: 0, returnPct: 7 });
close(v8.fvTotal, 0, 1e-9);
close(v8.total, 7200, 1e-9);

// V9: no employer match at all (matchPct 0) — missed is 0, total is just the employee part
var v9 = calc({ salary: 50000, contribPct: 8, matchPct: 0, matchCapPct: 6, years: 10, returnPct: 7 });
close(v9.employee, 4000, 1e-9);
close(v9.employer, 0, 1e-9);
close(v9.missedMatch, 0, 1e-9);

// V10: the match is bounded by the (capped) employee contribution, so the
// combined total can never reach the $72,000 annual-additions limit here —
// the employer match is at most the employee's own $24,500.
var v10 = calc({ salary: 400000, contribPct: 20, matchPct: 100, matchCapPct: 25, years: 30, returnPct: 7 });
close(v10.employee, 24500, 1e-9);
close(v10.employer, 24500, 1e-9); // min(24500, 100000) * 100%
close(v10.total, 49000, 1e-9);

// Invalid inputs return null
assert.strictEqual(calc({ salary: 0, contribPct: 6, matchPct: 50, matchCapPct: 6, years: 30, returnPct: 7 }), null);
assert.strictEqual(calc({ salary: 80000, contribPct: 101, matchPct: 50, matchCapPct: 6, years: 30, returnPct: 7 }), null);
assert.strictEqual(calc({ salary: 80000, contribPct: -1, matchPct: 50, matchCapPct: 6, years: 30, returnPct: 7 }), null);
assert.strictEqual(calc({ salary: 80000, contribPct: 6, matchPct: 101, matchCapPct: 6, years: 30, returnPct: 7 }), null);
assert.strictEqual(calc({ salary: 80000, contribPct: 6, matchPct: 50, matchCapPct: 101, years: 30, returnPct: 7 }), null);
assert.strictEqual(calc({ salary: 80000, contribPct: 6, matchPct: 50, matchCapPct: 6, years: 51, returnPct: 7 }), null);
assert.strictEqual(calc({ salary: 80000, contribPct: 6, matchPct: 50, matchCapPct: 6, years: 30, returnPct: 100 }), null);
assert.strictEqual(calc({ salary: 80000, contribPct: 6, matchPct: 50, matchCapPct: 6, years: -1, returnPct: 7 }), null);

// Limits exported for the page copy
assert.strictEqual(m.EMPLOYEE_LIMIT_2026, 24500);
assert.strictEqual(m.TOTAL_LIMIT_2026, 72000);
console.log("verify_401k: all assertions passed");
