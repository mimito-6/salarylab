// Verify offer.js against hand-computed cases. Run: node verify_offer.js
var assert = require("assert");
var m = require("./offer.js");
var calc = m.calcOffer;
var cmp = m.compareOffers;
function close(a, b, tol) { assert(Math.abs(a - b) <= tol, "expected " + b + ", got " + a); }

// V1: Offer A — $60,000, 40h x 52w, 10 PTO days, no extras
// scheduled 2080h, PTO 10 x 8 = 80h, working 2000h
var v1 = calc({ salary: 60000, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: 10, bonus: 0, benefits: 0, commuteMonthly: 0 });
close(v1.scheduledHours, 2080, 1e-9);
close(v1.ptoHours, 80, 1e-9);
close(v1.workingHours, 2000, 1e-9);
close(v1.totalComp, 60000, 1e-9);
close(v1.effectiveHourly, 30, 1e-9);
close(v1.monthlyPay, 5000, 1e-9);
close(v1.nominalHourly, 60000 / 2080, 1e-9);

// V2: Offer B — $70,000, 45h x 52w, 15 PTO days, $5,000 bonus, $2,000 benefits, $200/mo commute
// scheduled 2340h, PTO 15 x 9 = 135h, working 2205h
// total comp 70000 + 5000 + 2000 - 2400 = 74600
var v2 = calc({ salary: 70000, hoursPerWeek: 45, weeksPerYear: 52, ptoDays: 15, bonus: 5000, benefits: 2000, commuteMonthly: 200 });
close(v2.scheduledHours, 2340, 1e-9);
close(v2.ptoHours, 135, 1e-9);
close(v2.workingHours, 2205, 1e-9);
close(v2.totalComp, 74600, 1e-9);
close(v2.effectiveHourly, 74600 / 2205, 1e-9);
close(v2.monthlyPay, 74600 / 12, 1e-9);
close(v2.nominalHourly, 70000 / 2340, 1e-9);

// V3: split verdict — A $80,000/40h vs B $78,000/35h, no PTO, no extras
// A: working 2080, total 80000, eff 38.4615...  B: working 1820, total 78000, eff 42.8571...
var a3 = calc({ salary: 80000, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: 0, bonus: 0, benefits: 0, commuteMonthly: 0 });
var b3 = calc({ salary: 78000, hoursPerWeek: 35, weeksPerYear: 52, ptoDays: 0, bonus: 0, benefits: 0, commuteMonthly: 0 });
close(a3.workingHours, 2080, 1e-9);
close(a3.effectiveHourly, 80000 / 2080, 1e-9);
close(b3.workingHours, 1820, 1e-9);
close(b3.effectiveHourly, 78000 / 1820, 1e-9);
var c3 = cmp(a3, b3);
assert.strictEqual(c3.hourlyWinner, "B");
assert.strictEqual(c3.compWinner, "A");
close(c3.hourlyDiff, 78000 / 1820 - 80000 / 2080, 1e-9);
close(c3.compDiff, 2000, 1e-9);

// V4: tie — identical offers
var a4 = calc({ salary: 60000, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: 10, bonus: 1000, benefits: 500, commuteMonthly: 100 });
var b4 = calc({ salary: 60000, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: 10, bonus: 1000, benefits: 500, commuteMonthly: 100 });
var c4 = cmp(a4, b4);
assert.strictEqual(c4.hourlyWinner, "tie");
assert.strictEqual(c4.compWinner, "tie");
close(c4.hourlyDiff, 0, 1e-9);
close(c4.compDiff, 0, 1e-9);

// V5: V1 vs V2 — B wins both
var c5 = cmp(v1, v2);
assert.strictEqual(c5.hourlyWinner, "B");
assert.strictEqual(c5.compWinner, "B");
close(c5.compDiff, 14600, 1e-9);
close(c5.hourlyDiff, 74600 / 2205 - 30, 1e-9);

// V6: PTO 0 days — working == scheduled
var v6 = calc({ salary: 52000, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: 0, bonus: 0, benefits: 0, commuteMonthly: 0 });
close(v6.workingHours, 2080, 1e-9);
close(v6.ptoHours, 0, 1e-9);

// V7: part-time PTO — 20h week, 5 PTO days = 5 x 4 = 20h
var v7 = calc({ salary: 30000, hoursPerWeek: 20, weeksPerYear: 52, ptoDays: 5, bonus: 0, benefits: 0, commuteMonthly: 0 });
close(v7.scheduledHours, 1040, 1e-9);
close(v7.ptoHours, 20, 1e-9);
close(v7.workingHours, 1020, 1e-9);
close(v7.effectiveHourly, 30000 / 1020, 1e-9);

// Invalid inputs return null
assert.strictEqual(calc({ salary: 0, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: 10, bonus: 0, benefits: 0, commuteMonthly: 0 }), null);
assert.strictEqual(calc({ salary: 60000, hoursPerWeek: 40, weeksPerYear: 0, ptoDays: 10, bonus: 0, benefits: 0, commuteMonthly: 0 }), null);
assert.strictEqual(calc({ salary: 60000, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: -1, bonus: 0, benefits: 0, commuteMonthly: 0 }), null);
assert.strictEqual(calc({ salary: 60000, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: 10, bonus: -1, benefits: 0, commuteMonthly: 0 }), null);
assert.strictEqual(calc({ salary: 60000, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: 10, bonus: 0, benefits: 0, commuteMonthly: -50 }), null);
// PTO covering the whole year: 300 days x 8h = 2400h > 2080h scheduled
assert.strictEqual(calc({ salary: 60000, hoursPerWeek: 40, weeksPerYear: 52, ptoDays: 300, bonus: 0, benefits: 0, commuteMonthly: 0 }), null);
assert.strictEqual(cmp(null, v1), null);
assert.strictEqual(cmp(v1, null), null);
console.log("verify_offer: all assertions passed");
