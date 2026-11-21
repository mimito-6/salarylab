// Verify contractor.js against hand-computed cases. Run: node verify_contractor.js
var assert = require("assert");
var m = require("./contractor.js");
var calc = m.calcContractor;
function close(a, b, tol) { assert(Math.abs(a - b) <= tol, "expected " + b + ", got " + a); }

// V1 (headline example, independent Python check):
// Employee $80,000 + $12,000 benefits, 40h/week, 15 PTO days.
// Contractor $60/h x 40h x 48 weeks, SE rate 15.3%.
var v1 = calc({ salary: 80000, benefits: 12000, empHours: 40, ptoDays: 15,
  rate: 60, billHours: 40, billWeeks: 48, seRatePct: 15.3 });
close(v1.empTotal, 92000, 1e-9);
close(v1.empWorkHours, 40 * (52 - 3), 1e-9);           // 1960
close(v1.empEff, 92000 / 1960, 1e-9);
close(v1.billHoursYear, 1920, 1e-9);
close(v1.gross, 115200, 1e-9);
close(v1.seFactor, 0.9235 * 0.153, 1e-12);            // 0.1412955
close(v1.seTax, 115200 * 0.9235 * 0.153, 1e-6);
close(v1.net, 115200 - 115200 * 0.9235 * 0.153, 1e-6);
close(v1.conEff, (115200 - 115200 * 0.9235 * 0.153) / 1920, 1e-9);
close(v1.breakEven, 92000 / (1 - 0.9235 * 0.153) / 1920, 1e-9);
// exact figures quoted on the page
close(v1.empEff, 46.94, 0.01);
close(v1.seTax, 16277.24, 0.01);
close(v1.net, 98922.76, 0.01);
close(v1.conEff, 51.52, 0.01);
close(v1.breakEven, 55.80, 0.01);

// V2 (split winners): same offers, contractor only 30h x 40 weeks.
// Per-hour winner is still the contractor ($51.52/h), but total winner flips
// to the employee ($92,000 vs $61,826.72).
var v2 = calc({ salary: 80000, benefits: 12000, empHours: 40, ptoDays: 15,
  rate: 60, billHours: 30, billWeeks: 40, seRatePct: 15.3 });
close(v2.gross, 72000, 1e-9);
close(v2.seTax, 72000 * 0.9235 * 0.153, 1e-6);
close(v2.net, 72000 - 72000 * 0.9235 * 0.153, 1e-6);
close(v2.conEff, 51.52, 0.01);                         // rate after SE tax is hours-independent
close(v2.net, 61826.72, 0.01);
close(v2.breakEven, 92000 / (1 - 0.9235 * 0.153) / 1200, 1e-9);
close(v2.breakEven, 89.28, 0.01);
assert(v2.conEff > v2.empEff, "V2 per-hour winner should be contractor");
assert(v2.net < v2.empTotal, "V2 total winner should be employee");

// V3: SE rate 0% — net equals gross, break-even is plain division.
// Employee $60,000, no benefits, 40h, 10 PTO days; contractor $50/h, 40h, 50 weeks.
var v3 = calc({ salary: 60000, benefits: 0, empHours: 40, ptoDays: 10,
  rate: 50, billHours: 40, billWeeks: 50, seRatePct: 0 });
close(v3.empWorkHours, 2000, 1e-9);
close(v3.empEff, 30, 1e-9);
close(v3.gross, 100000, 1e-9);
close(v3.seTax, 0, 1e-9);
close(v3.net, 100000, 1e-9);
close(v3.conEff, 50, 1e-9);
close(v3.breakEven, 30, 1e-9);

// V4: PTO days are 5-day weeks — 20 PTO days = 4 weeks off.
// Employee $50,000 + $5,000 benefits, 40h, 20 PTO days;
// contractor $45/h, 35h, 50 weeks, 15.3%.
var v4 = calc({ salary: 50000, benefits: 5000, empHours: 40, ptoDays: 20,
  rate: 45, billHours: 35, billWeeks: 50, seRatePct: 15.3 });
close(v4.empTotal, 55000, 1e-9);
close(v4.empWorkHours, 1920, 1e-9);
close(v4.empEff, 55000 / 1920, 1e-9);
close(v4.gross, 78750, 1e-9);
close(v4.seTax, 78750 * 0.9235 * 0.153, 1e-6);
close(v4.net, 78750 - 78750 * 0.9235 * 0.153, 1e-6);
close(v4.conEff, (78750 - 78750 * 0.9235 * 0.153) / 1750, 1e-9);
close(v4.breakEven, 55000 / (1 - 0.9235 * 0.153) / 1750, 1e-9);
close(v4.empEff, 28.65, 0.01);
close(v4.seTax, 11127.02, 0.01);
close(v4.net, 67622.98, 0.01);
close(v4.conEff, 38.64, 0.01);
close(v4.breakEven, 36.60, 0.01);

// V5: contractor below break-even — employee wins both.
// Employee $100,000 + $20,000 benefits, 40h, 25 PTO days (47 working weeks);
// contractor $55/h, 40h, 48 weeks, 15.3%.
var v5 = calc({ salary: 100000, benefits: 20000, empHours: 40, ptoDays: 25,
  rate: 55, billHours: 40, billWeeks: 48, seRatePct: 15.3 });
close(v5.empWorkHours, 1880, 1e-9);
close(v5.empEff, 120000 / 1880, 1e-9);
close(v5.gross, 105600, 1e-9);
close(v5.net, 105600 - 105600 * 0.9235 * 0.153, 1e-6);
close(v5.breakEven, 120000 / (1 - 0.9235 * 0.153) / 1920, 1e-9);
close(v5.empEff, 63.83, 0.01);
close(v5.net, 90679.20, 0.01);
close(v5.conEff, 47.23, 0.01);
close(v5.breakEven, 72.78, 0.01);
assert(v5.conEff < v5.empEff, "V5 per-hour winner should be employee");
assert(v5.net < v5.empTotal, "V5 total winner should be employee");

// Invalid inputs return null
var base = { salary: 80000, benefits: 12000, empHours: 40, ptoDays: 15,
  rate: 60, billHours: 40, billWeeks: 48, seRatePct: 15.3 };
function withChange(k, v) { var o = Object.assign({}, base); o[k] = v; return o; }
assert.strictEqual(calc(withChange("salary", 0)), null);
assert.strictEqual(calc(withChange("salary", -100)), null);
assert.strictEqual(calc(withChange("benefits", -1)), null);
assert.strictEqual(calc(withChange("empHours", 0)), null);
assert.strictEqual(calc(withChange("ptoDays", -1)), null);
assert.strictEqual(calc(withChange("ptoDays", 260)), null);   // PTO covers the whole year
assert.strictEqual(calc(withChange("rate", 0)), null);
assert.strictEqual(calc(withChange("billHours", 0)), null);
assert.strictEqual(calc(withChange("billWeeks", 0)), null);
assert.strictEqual(calc(withChange("billWeeks", 53)), null);  // more than a year
assert.strictEqual(calc(withChange("seRatePct", -1)), null);
assert.strictEqual(calc(withChange("seRatePct", 101)), null);
// PTO of 259 days still leaves one working day — valid, not null
assert.notStrictEqual(calc(withChange("ptoDays", 259)), null);
console.log("verify_contractor: all assertions passed");
