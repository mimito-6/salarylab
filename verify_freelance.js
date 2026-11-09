// Verify freelance.js against hand-computed cases. Run: node verify_freelance.js
var assert = require("assert");
var m = require("./freelance.js");
var calc = m.calcFreelance;
function close(a, b, tol) { assert(Math.abs(a - b) <= tol, "expected " + b + ", got " + a); }

// V1: $60,000 take-home, $5,000 expenses, 25% tax, 30h x 48w
// revenue = 65000 / 0.75 = 86666.6667; hours = 1440; rate = 60.1852
var v1 = calc({ target: 60000, expenses: 5000, taxPct: 25, hoursPerWeek: 30, weeksPerYear: 48 });
close(v1.revenue, 65000 / 0.75, 1e-9);
close(v1.billableHours, 1440, 1e-9);
close(v1.rate, (65000 / 0.75) / 1440, 1e-9);
close(v1.monthlyRevenue, (65000 / 0.75) / 12, 1e-9);
close(v1.weeklyRevenue, (65000 / 0.75) / 48, 1e-9);
close(v1.takeHomePerHour, 60000 / 1440, 1e-9);

// V2: $80,000 take-home, no expenses, 0% tax, 40h x 52w — rate equals take-home/hour
var v2 = calc({ target: 80000, expenses: 0, taxPct: 0, hoursPerWeek: 40, weeksPerYear: 52 });
close(v2.revenue, 80000, 1e-9);
close(v2.billableHours, 2080, 1e-9);
close(v2.rate, 80000 / 2080, 1e-9);
close(v2.monthlyRevenue, 80000 / 12, 1e-9);
close(v2.weeklyRevenue, 80000 / 52, 1e-9);
close(v2.takeHomePerHour, 80000 / 2080, 1e-9);

// V3: $50,000 take-home, $10,000 expenses, 20% tax, 20h x 50w — round $75.00/hr
var v3 = calc({ target: 50000, expenses: 10000, taxPct: 20, hoursPerWeek: 20, weeksPerYear: 50 });
close(v3.revenue, 75000, 1e-9);
close(v3.billableHours, 1000, 1e-9);
close(v3.rate, 75, 1e-9);
close(v3.monthlyRevenue, 6250, 1e-9);
close(v3.weeklyRevenue, 1500, 1e-9);
close(v3.takeHomePerHour, 50, 1e-9);

// V4: $40,000 take-home, $2,000 expenses, 30% tax, 25h x 50w — round $48.00/hr
var v4 = calc({ target: 40000, expenses: 2000, taxPct: 30, hoursPerWeek: 25, weeksPerYear: 50 });
close(v4.revenue, 60000, 1e-9);
close(v4.billableHours, 1250, 1e-9);
close(v4.rate, 48, 1e-9);
close(v4.monthlyRevenue, 5000, 1e-9);
close(v4.weeklyRevenue, 1200, 1e-9);
close(v4.takeHomePerHour, 32, 1e-9);

// V5: $100,000 take-home, $12,000 expenses, 22% tax, 35h x 48w
// revenue = 112000 / 0.78 = 143589.7436; hours = 1680; rate = 85.4701
var v5 = calc({ target: 100000, expenses: 12000, taxPct: 22, hoursPerWeek: 35, weeksPerYear: 48 });
close(v5.revenue, 112000 / 0.78, 1e-6);
close(v5.billableHours, 1680, 1e-9);
close(v5.rate, (112000 / 0.78) / 1680, 1e-6);
close(v5.monthlyRevenue, (112000 / 0.78) / 12, 1e-6);
close(v5.takeHomePerHour, 100000 / 1680, 1e-9);

// Invalid inputs return null
assert.strictEqual(calc({ target: 0, expenses: 0, taxPct: 0, hoursPerWeek: 40, weeksPerYear: 52 }), null);
assert.strictEqual(calc({ target: 60000, expenses: -100, taxPct: 25, hoursPerWeek: 30, weeksPerYear: 48 }), null);
assert.strictEqual(calc({ target: 60000, expenses: 5000, taxPct: 100, hoursPerWeek: 30, weeksPerYear: 48 }), null);
assert.strictEqual(calc({ target: 60000, expenses: 5000, taxPct: -5, hoursPerWeek: 30, weeksPerYear: 48 }), null);
assert.strictEqual(calc({ target: 60000, expenses: 5000, taxPct: 25, hoursPerWeek: 0, weeksPerYear: 48 }), null);
assert.strictEqual(calc({ target: 60000, expenses: 5000, taxPct: 25, hoursPerWeek: 30, weeksPerYear: 0 }), null);
console.log("verify_freelance: all assertions passed");
