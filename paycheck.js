/* SalaryLab — Paycheck Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     regular  = hourly * regularHours
     overtime = hourly * multiplier * overtimeHours
     gross    = regular + overtime          (per paycheck, gross / pre-tax)
     annual   = gross * checksPerYear       (assumes every paycheck in the
                                              year looks like this one)
     effective = gross / (regularHours + overtimeHours)
     Semimonthly note: a semimonthly period averages 86.67 hours at a
     40-hour week (2080 hours / 24 checks), not 80 — entering 80 hours
     for a semimonthly check understates the year.
  */
  function calcPaycheck(o) {
    var regular = o.hourly * o.regHours;
    var overtime = o.hourly * o.mult * o.otHours;
    var gross = regular + overtime;
    var totalHours = o.regHours + o.otHours;
    return {
      regular: regular,
      overtime: overtime,
      gross: gross,
      annual: gross * o.checksPerYear,
      totalHours: totalHours,
      effective: totalHours > 0 ? gross / totalHours : 0
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calcPaycheck: calcPaycheck };
    return;
  }

  function num(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(el.value);
    return isFinite(v) && v >= 0 ? v : 0;
  }
  function money(x) {
    return "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(x) {
    return "$" + Math.round(x).toLocaleString("en-US");
  }

  function calc() {
    var hourly = num("pcHourly");
    var freqEl = document.getElementById("pcFreq");
    var checks = freqEl ? parseInt(freqEl.value, 10) : 26;
    var reg = num("pcRegHours");
    var ot = num("pcOtHours");
    var mult = num("pcMult");
    var out = document.getElementById("pcResults");
    var err = document.getElementById("pcError");
    err.textContent = "";
    if (!(hourly > 0) || !(reg > 0 && ot >= 0) || !(mult > 0) || !(checks > 0)) {
      if (!(hourly > 0)) {
        err.textContent = "Enter an hourly wage above zero.";
      } else if (!(mult > 0)) {
        err.textContent = "Enter an overtime multiplier above zero (1.5 is the usual time-and-a-half).";
      } else {
        err.textContent = "Enter regular hours above zero and overtime hours of zero or more.";
      }
      out.classList.remove("show");
      return;
    }
    if (ot === 0 && reg <= 0) {
      err.textContent = "Enter regular hours above zero.";
      out.classList.remove("show");
      return;
    }
    var r = calcPaycheck({ hourly: hourly, regHours: reg, otHours: ot, mult: mult, checksPerYear: checks });
    document.getElementById("pcBig").textContent = money(r.gross);
    document.getElementById("pcBigDelta").textContent =
      money(hourly) + "/hr × " + reg + " regular hours + " + ot + " overtime hours at " +
      mult + "× = " + money(r.gross) + " gross per paycheck.";
    document.getElementById("pcRegular").textContent = money(r.regular);
    document.getElementById("pcOvertime").textContent = money(r.overtime);
    document.getElementById("pcGross").textContent = money(r.gross);
    document.getElementById("pcAnnual").textContent = money0(r.annual) + " (" + checks + " paychecks a year)";
    document.getElementById("pcEffective").textContent = money(r.effective) + "/hr";
    document.getElementById("pcTotalHours").textContent = r.totalHours + " hours";
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcPaycheckBtn");
    if (btn) btn.addEventListener("click", calc);
  });
})();
