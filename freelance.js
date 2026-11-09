/* SalaryLab — Freelance Rate Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     revenue      = (targetTakeHome + expenses) / (1 - taxPct / 100)
     billableYear = billableHoursPerWeek * weeksPerYear
     rate         = revenue / billableYear
     monthly      = revenue / 12
     weekly       = revenue / weeksPerYear
     takeHomePerHour = targetTakeHome / billableYear
     Returns null when inputs are out of range. Tax must be below 100%
     (at 100% no rate can ever produce take-home pay), expenses must be
     zero or more, and every other input must be above zero.
  */
  function calcFreelance(o) {
    if (!(o.target > 0) || !(o.expenses >= 0) ||
        !(o.taxPct >= 0) || !(o.taxPct < 100) ||
        !(o.hoursPerWeek > 0) || !(o.weeksPerYear > 0)) {
      return null;
    }
    var revenue = (o.target + o.expenses) / (1 - o.taxPct / 100);
    var hoursPerYear = o.hoursPerWeek * o.weeksPerYear;
    return {
      revenue: revenue,
      billableHours: hoursPerYear,
      rate: revenue / hoursPerYear,
      monthlyRevenue: revenue / 12,
      weeklyRevenue: revenue / o.weeksPerYear,
      takeHomePerHour: o.target / hoursPerYear
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calcFreelance: calcFreelance };
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
    var target = num("fTarget");
    var expenses = num("fExpenses");
    var tax = num("fTax");
    var hours = num("fHours");
    var weeks = num("fWeeks");
    var out = document.getElementById("fResults");
    var err = document.getElementById("fError");
    err.textContent = "";
    if (isNaN(target) || !(target > 0)) {
      err.textContent = "Enter a target take-home pay above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(expenses) || expenses < 0) {
      err.textContent = "Enter business expenses of zero or more.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(tax) || tax < 0 || tax >= 100) {
      err.textContent = "Enter a tax rate from 0% up to (but not including) 100%.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(hours) || !(hours > 0) || isNaN(weeks) || !(weeks > 0)) {
      err.textContent = "Enter billable hours per week and weeks per year above zero.";
      out.classList.remove("show");
      return;
    }
    var r = calcFreelance({ target: target, expenses: expenses, taxPct: tax, hoursPerWeek: hours, weeksPerYear: weeks });
    if (!r) {
      err.textContent = "Check the numbers and try again.";
      out.classList.remove("show");
      return;
    }
    document.getElementById("fBig").textContent = money(r.rate) + " / hour";
    document.getElementById("fBigDelta").textContent =
      "That rate over " + r.billableHours.toLocaleString("en-US") +
      " billable hours a year bills " + money0(r.revenue) +
      ", which leaves " + money0(target) + " after " + tax + "% tax and " +
      money0(expenses) + " of expenses.";
    document.getElementById("fRate").textContent = money(r.rate);
    document.getElementById("fRevenue").textContent = money0(r.revenue);
    document.getElementById("fMonthly").textContent = money(r.monthlyRevenue);
    document.getElementById("fWeekly").textContent = money(r.weeklyRevenue);
    document.getElementById("fHoursYear").textContent = r.billableHours.toLocaleString("en-US") + " hours";
    document.getElementById("fTakeHomeHour").textContent = money(r.takeHomePerHour);
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcFreelanceBtn");
    if (btn) btn.addEventListener("click", calc);
  });
})();
