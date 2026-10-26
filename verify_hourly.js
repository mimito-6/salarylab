// Verify hourlyToSalary against hand-computed cases (run: node verify_hourly.js).
const assert = require("assert");
const { hourlyToSalary } = require("./hourly.js");
const close = (a, b, eps = 1e-9) => assert(Math.abs(a - b) < eps, `${a} != ${b}`);

// V1: $25 x 40h x 52w (standard full-time, matches page example)
let r = hourlyToSalary({ hourly: 25, hoursPerWeek: 40, weeks: 52 });
assert.strictEqual(r.annualHours, 2080);
assert.strictEqual(r.weekly, 1000);
assert.strictEqual(r.biweekly, 2000);
assert.strictEqual(r.annual, 52000);
close(r.monthly, 52000 / 12);

// V2: part-time $15 x 20h x 52w
r = hourlyToSalary({ hourly: 15, hoursPerWeek: 20, weeks: 52 });
assert.strictEqual(r.annual, 15600);
assert.strictEqual(r.weekly, 300);
assert.strictEqual(r.biweekly, 600);
assert.strictEqual(r.monthly, 1300);

// V3: seasonal $30 x 35h x 48w (unpaid time off)
r = hourlyToSalary({ hourly: 30, hoursPerWeek: 35, weeks: 48 });
assert.strictEqual(r.annualHours, 1680);
assert.strictEqual(r.annual, 50400);
assert.strictEqual(r.weekly, 1050);
assert.strictEqual(r.biweekly, 2100);
assert.strictEqual(r.monthly, 4200);

// V4: fractional wage $18.50 x 37.5h x 52w
r = hourlyToSalary({ hourly: 18.5, hoursPerWeek: 37.5, weeks: 52 });
close(r.weekly, 693.75);
close(r.annual, 36075);

// V5: zero hours -> all zero (DOM layer rejects it, pure math stays sane)
r = hourlyToSalary({ hourly: 25, hoursPerWeek: 0, weeks: 52 });
assert.strictEqual(r.annual, 0);
assert.strictEqual(r.weekly, 0);

console.log("verify_hourly: all 5 cases PASS");
