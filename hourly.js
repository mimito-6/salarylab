/* SalaryLab — Hourly to Salary Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     annualHours = hoursPerWeek * weeks
     weekly  = hourly * hoursPerWeek
     biweekly = weekly * 2
     monthly = annual / 12
     annual  = hourly * annualHours
     All figures are gross (pre-tax). Monthly is annual / 12, not weekly * 4,
     so a 52-week year gives 4.333... weeks per month, not 4.
  */
  function hourlyToSalary(o) {
    var annualHours = o.hoursPerWeek * o.weeks;
    var weekly = o.hourly * o.hoursPerWeek;
    var biweekly = weekly * 2;
    var annual = o.hourly * annualHours;
    var monthly = annual / 12;
    return {
      annualHours: annualHours,
      weekly: weekly,
      biweekly: biweekly,
      monthly: monthly,
      annual: annual
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { hourlyToSalary: hourlyToSalary };
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

  function calcHourly() {
    var hourly = num("hsHourly");
    var hpw = num("hsHoursPerWeek");
    var weeks = num("hsWeeks") || 52;
    var out = document.getElementById("hsResults");
    var err = document.getElementById("hsError");
    err.textContent = "";
    if (!(hourly > 0) || !(hpw > 0) || !(weeks > 0)) {
      err.textContent = "Enter an hourly wage, weekly hours, and weeks per year, all above zero.";
      out.classList.remove("show");
      return;
    }
    var r = hourlyToSalary({ hourly: hourly, hoursPerWeek: hpw, weeks: weeks });
    document.getElementById("hsBig").textContent = money0(r.annual);
    document.getElementById("hsBigDelta").textContent =
      money(hourly) + "/hr × " + hpw + " hours/week × " + weeks + " weeks = " +
      money0(r.annual) + " a year (" + Math.round(r.annualHours).toLocaleString("en-US") + " hours).";
    document.getElementById("hsWeekly").textContent = money(r.weekly);
    document.getElementById("hsBiweekly").textContent = money(r.biweekly);
    document.getElementById("hsMonthly").textContent = money(r.monthly);
    document.getElementById("hsAnnual").textContent = money0(r.annual);
    document.getElementById("hsHours").textContent =
      Math.round(r.annualHours).toLocaleString("en-US") + " hours";
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcHourlyBtn");
    if (btn) btn.addEventListener("click", calcHourly);
  });
})();
