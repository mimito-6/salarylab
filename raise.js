/* SalaryLab — Salary Raise Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     newAnnual   = current * (1 + pct / 100)
     annualDiff  = newAnnual - current
     monthlyDiff = annualDiff / 12
     newMonthly  = newAnnual / 12
     hourlyOld   = current / (hoursPerWeek * weeksPerYear)
     hourlyNew   = newAnnual / (hoursPerWeek * weeksPerYear)
     hourlyDiff  = hourlyNew - hourlyOld
     neededPct   = (target - current) / current * 100   (reverse lookup)
     Returns null when inputs are out of range. A raise of 0% is valid
     (new == current, all diffs zero); a negative pct is rejected — this
     tool prices a raise, not a pay cut.
  */
  function calcRaise(o) {
    if (!(o.current > 0) || !(o.pct >= 0) ||
        !(o.hoursPerWeek > 0) || !(o.weeksPerYear > 0)) {
      return null;
    }
    var newAnnual = o.current * (1 + o.pct / 100);
    var annualDiff = newAnnual - o.current;
    var hoursPerYear = o.hoursPerWeek * o.weeksPerYear;
    return {
      newAnnual: newAnnual,
      annualDiff: annualDiff,
      monthlyDiff: annualDiff / 12,
      newMonthly: newAnnual / 12,
      currentMonthly: o.current / 12,
      hourlyOld: o.current / hoursPerYear,
      hourlyNew: newAnnual / hoursPerYear,
      hourlyDiff: (newAnnual - o.current) / hoursPerYear
    };
  }

  function calcNeededPct(o) {
    if (!(o.current > 0) || !(o.target >= o.current)) {
      return null;
    }
    return (o.target - o.current) / o.current * 100;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calcRaise: calcRaise, calcNeededPct: calcNeededPct };
    return;
  }

  function num(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : NaN;
  }
  function money(x) {
    return "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(x) {
    return "$" + Math.round(x).toLocaleString("en-US");
  }

  function calc() {
    var current = num("rCurrent");
    var pct = num("rPct");
    var hours = num("rHours");
    var weeks = num("rWeeks");
    var out = document.getElementById("rResults");
    var err = document.getElementById("rError");
    err.textContent = "";
    if (isNaN(current) || !(current > 0)) {
      err.textContent = "Enter a current annual salary above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(pct) || pct < 0) {
      err.textContent = "Enter a raise of 0 percent or more. (A pay cut is a negative raise — this tool prices raises.)";
      out.classList.remove("show");
      return;
    }
    if (isNaN(hours) || !(hours > 0) || isNaN(weeks) || !(weeks > 0)) {
      err.textContent = "Enter hours per week and weeks per year above zero.";
      out.classList.remove("show");
      return;
    }
    var r = calcRaise({ current: current, pct: pct, hoursPerWeek: hours, weeksPerYear: weeks });
    if (!r) {
      err.textContent = "Check the numbers and try again.";
      out.classList.remove("show");
      return;
    }
    document.getElementById("rBig").textContent = money0(r.newAnnual);
    document.getElementById("rBigDelta").textContent =
      money0(current) + " + " + pct + "% = " + money0(r.newAnnual) + " a year (+" +
      money(r.annualDiff) + " a year, +" + money(r.monthlyDiff) + " a month).";
    document.getElementById("rNewAnnual").textContent = money0(r.newAnnual);
    document.getElementById("rAnnualDiff").textContent = money(r.annualDiff);
    document.getElementById("rMonthlyDiff").textContent = money(r.monthlyDiff);
    document.getElementById("rNewMonthly").textContent = money(r.newMonthly);
    document.getElementById("rCurrentMonthly").textContent = money(r.currentMonthly);
    document.getElementById("rHourlyOld").textContent = money(r.hourlyOld);
    document.getElementById("rHourlyNew").textContent = money(r.hourlyNew);
    document.getElementById("rHourlyDiff").textContent = money(r.hourlyDiff);
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function calcTarget() {
    var current = num("rCurrent");
    var target = num("tTarget");
    var out = document.getElementById("tResults");
    var err = document.getElementById("tError");
    err.textContent = "";
    if (isNaN(current) || !(current > 0)) {
      err.textContent = "Enter a current annual salary above zero first (in the calculator above).";
      out.classList.remove("show");
      return;
    }
    if (isNaN(target) || !(target >= current)) {
      err.textContent = "Enter a target salary at or above your current salary.";
      out.classList.remove("show");
      return;
    }
    var pct = calcNeededPct({ current: current, target: target });
    document.getElementById("tNeeded").textContent = pct.toFixed(2) + "%";
    document.getElementById("tAnnualDiff").textContent = money(target - current);
    document.getElementById("tMonthlyDiff").textContent = money((target - current) / 12);
    out.classList.add("show");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcRaiseBtn");
    if (btn) btn.addEventListener("click", calc);
    var btn2 = document.getElementById("calcTargetBtn");
    if (btn2) btn2.addEventListener("click", calcTarget);
  });
})();
