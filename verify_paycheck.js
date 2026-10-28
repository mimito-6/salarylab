/* Verify paycheck.js pure math against hand-computed vectors. Run: node verify_paycheck.js */
"use strict";
var assert = require("assert");
var calcPaycheck = require("./paycheck.js").calcPaycheck;

function approx(a, b, eps) {
  assert.ok(Math.abs(a - b) < (eps || 1e-9), "expected " + b + ", got " + a);
}

// V1: biweekly default — $25/hr, 80 regular + 10 OT at 1.5x
var v1 = calcPaycheck({ hourly: 25, regHours: 80, otHours: 10, mult: 1.5, checksPerYear: 26 });
assert.strictEqual(v1.regular, 2000);
assert.strictEqual(v1.overtime, 375);
assert.strictEqual(v1.gross, 2375);
assert.strictEqual(v1.annual, 61750);
assert.strictEqual(v1.totalHours, 90);
approx(v1.effective, 2375 / 90);

// V2: weekly, no overtime — $20/hr x 40h
var v2 = calcPaycheck({ hourly: 20, regHours: 40, otHours: 0, mult: 1.5, checksPerYear: 52 });
assert.strictEqual(v2.regular, 800);
assert.strictEqual(v2.overtime, 0);
assert.strictEqual(v2.gross, 800);
assert.strictEqual(v2.annual, 41600);
assert.strictEqual(v2.effective, 20);

// V3: semimonthly at a 40-hour week — 2080/24 = 86.666... hours, $30/hr
var v3 = calcPaycheck({ hourly: 30, regHours: 2080 / 24, otHours: 0, mult: 1.5, checksPerYear: 24 });
approx(v3.regular, 2600);
approx(v3.annual, 62400);

// V4: monthly — $25/hr, 2080/12 hours, no OT: annual must equal $52,000
var v4 = calcPaycheck({ hourly: 25, regHours: 2080 / 12, otHours: 0, mult: 1.5, checksPerYear: 12 });
approx(v4.annual, 52000);

// V5: double time — $25/hr, 80 + 5 OT at 2x, biweekly
var v5 = calcPaycheck({ hourly: 25, regHours: 80, otHours: 5, mult: 2, checksPerYear: 26 });
assert.strictEqual(v5.overtime, 250);
assert.strictEqual(v5.gross, 2250);
assert.strictEqual(v5.annual, 58500);

// V6: zero hours -> all zeros, effective 0 (no division blow-up)
var v6 = calcPaycheck({ hourly: 25, regHours: 0, otHours: 0, mult: 1.5, checksPerYear: 26 });
assert.strictEqual(v6.gross, 0);
assert.strictEqual(v6.annual, 0);
assert.strictEqual(v6.effective, 0);

console.log("verify_paycheck: all 6 vectors PASS");
