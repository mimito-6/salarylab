/* SalaryLab — Overtime Pay Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";
  var WEEKS_DEFAULT = 52;

  /* ---------- pure math (node-testable) ----------
     base       = regular hourly wage (from hourly input, or salary / (hoursPerWeek * 52))
     otWeekly   = base * multiplier * otHoursPerWeek
     otAnnual   = otWeekly * weeks
     grossAnnual = (base * hoursPerWeek + otWeekly) * weeks
     totalHoursAnnual = (hoursPerWeek + otHoursPerWeek) * weeks
     effectiveRate = grossAnnual / totalHoursAnnual  (premium averaged over every hour worked)
  */
  function overtimePay(o) {
    var base = o.base;
    var otWeekly = base * o.multiplier * o.otHoursPerWeek;
    var grossWeekly = base * o.hoursPerWeek + otWeekly;
    var grossAnnual = grossWeekly * o.weeks;
    var otAnnual = otWeekly * o.weeks;
    var otHoursAnnual = o.otHoursPerWeek * o.weeks;
    var totalHoursAnnual = (o.hoursPerWeek + o.otHoursPerWeek) * o.weeks;
    var effectiveRate = totalHoursAnnual > 0 ? grossAnnual / totalHoursAnnual : 0;
    var regularAnnual = base * o.hoursPerWeek * o.weeks;
    return {
      base: base,
      otWeekly: otWeekly,
      grossWeekly: grossWeekly,
      regularAnnual: regularAnnual,
      otAnnual: otAnnual,
      grossAnnual: grossAnnual,
      otHoursAnnual: otHoursAnnual,
      totalHoursAnnual: totalHoursAnnual,
      effectiveRate: effectiveRate
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { overtimePay: overtimePay, WEEKS_DEFAULT: WEEKS_DEFAULT };
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
  function hoursStr(x) {
    return Math.round(x).toLocaleString("en-US") + " hours";
  }

  function calcOvertime() {
    var basisHourly = document.getElementById("basisHourly").checked;
    var hpw = num("otHoursPerWeek") || 40;
    var salary = num("otSalary");
    var hourly = num("otHourly");
    var otH = num("otHours");
    var weeks = num("otWeeks") || WEEKS_DEFAULT;
    var sel = document.getElementById("otMult");
    var multiplier = sel.value === "custom" ? num("otMultCustom") : parseFloat(sel.value);

    var out = document.getElementById("overtimeResults");
    var err = document.getElementById("overtimeError");
    err.textContent = "";
    var base = basisHourly ? hourly : (hpw > 0 ? salary / (hpw * WEEKS_DEFAULT) : 0);
    if (!(base > 0) || !(hpw > 0)) {
      err.textContent = "Enter a pay rate above zero (hourly wage, or salary plus weekly hours).";
      out.classList.remove("show");
      return;
    }
    if (!(multiplier > 0)) {
      err.textContent = "Enter an overtime multiplier above zero (e.g. 1.5 for time-and-a-half).";
      out.classList.remove("show");
      return;
    }

    var r = overtimePay({
      base: base, multiplier: multiplier,
      otHoursPerWeek: otH, hoursPerWeek: hpw, weeks: weeks
    });

    document.getElementById("otBase").textContent = money(r.base) + "/hr";
    document.getElementById("otWeeklyPay").textContent = money(r.otWeekly);
    document.getElementById("otAnnualPay").textContent = money0(r.otAnnual);
    document.getElementById("otAnnualGross").textContent = money0(r.grossAnnual);
    document.getElementById("otAnnualHours").textContent =
      hoursStr(r.otHoursAnnual) + " (" + otH + "h × " + weeks + " weeks)";
    document.getElementById("otEffective").textContent = money(r.effectiveRate) + "/hr";
    var prem = document.getElementById("otPremium");
    prem.textContent = "Your effective rate rises by " + money(r.effectiveRate - r.base) +
      "/hr over your regular rate — that's the overtime premium spread across every hour you work.";
    var multLbl = multiplier === 1.5 ? "time-and-a-half" : multiplier + "×";
    document.getElementById("otBig").textContent = money0(r.otAnnual);
    document.getElementById("otBigDelta").textContent =
      hoursStr(r.otHoursAnnual) + " of extra work at " + multLbl + " earns " +
      money0(r.otAnnual) + " on top of your " + money0(r.regularAnnual) + " base pay.";

    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcOvertimeBtn");
    if (btn) btn.addEventListener("click", calcOvertime);
    var bh = document.getElementById("basisHourly");
    var bs = document.getElementById("basisSalary");
    function toggleBasis() {
      var useHourly = bh.checked;
      document.getElementById("rowHourly").style.display = useHourly ? "" : "none";
      document.getElementById("rowSalary").style.display = useHourly ? "none" : "";
      document.getElementById("rowHours").style.display = useHourly ? "none" : "";
    }
    if (bh && bs) { bh.addEventListener("change", toggleBasis); bs.addEventListener("change", toggleBasis); toggleBasis(); }
    var mult = document.getElementById("otMult");
    if (mult) {
      mult.addEventListener("change", function () {
        document.getElementById("rowCustomMult").style.display =
          mult.value === "custom" ? "" : "none";
      });
    }
  });
})();
