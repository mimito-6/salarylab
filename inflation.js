/* SalaryLab — Inflation-Adjusted Salary Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     factor             = (1 + rate/100) ^ years
     equivalent         = salary * factor
     difference         = equivalent - salary
     pctChange          = (factor - 1) * 100
     monthlyEquivalent  = equivalent / 12
     monthlyCurrent     = salary / 12
     realValue          = salary / factor   (what the salary buys in the
                          other year's dollars)
     The same formula serves both directions: "past -> now" (what a salary
     from N years ago is worth today) and "now -> future" (what today's
     salary must become in N years to keep the same purchasing power).
     Returns null when inputs are out of range: salary must be above zero,
     years above zero and at most 50, rate between -5% (deflation) and 20%.
  */
  function calcInflation(o) {
    if (!(o.salary > 0) || !(o.years > 0) || o.years > 50) {
      return null;
    }
    if (!(o.rate >= -5) || o.rate > 20) {
      return null;
    }
    var factor = Math.pow(1 + o.rate / 100, o.years);
    var equivalent = o.salary * factor;
    return {
      factor: factor,
      equivalent: equivalent,
      difference: equivalent - o.salary,
      pctChange: (factor - 1) * 100,
      monthlyEquivalent: equivalent / 12,
      monthlyCurrent: o.salary / 12,
      realValue: o.salary / factor
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calcInflation: calcInflation };
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
    var salary = num("iSalary");
    var years = num("iYears");
    var rate = num("iRate");
    var modeEl = document.querySelector('input[name="iMode"]:checked');
    var mode = modeEl ? modeEl.value : "past";
    var out = document.getElementById("iResults");
    var err = document.getElementById("iError");
    err.textContent = "";
    if (isNaN(salary) || !(salary > 0)) {
      err.textContent = "Enter a salary above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(years) || !(years > 0) || years > 50) {
      err.textContent = "Enter a number of years above zero and at most 50.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(rate) || rate < -5 || rate > 20) {
      err.textContent = "Enter an average inflation rate between -5% and 20%.";
      out.classList.remove("show");
      return;
    }
    var r = calcInflation({ salary: salary, years: years, rate: rate });
    if (!r) {
      err.textContent = "Check the numbers and try again.";
      out.classList.remove("show");
      return;
    }
    var yrs = years === 1 ? "1 year" : years + " years";
    var dir = r.difference > 0 ? "more" : (r.difference < 0 ? "less" : "the same");
    var pct = Math.abs(r.pctChange).toFixed(2);
    if (mode === "past") {
      document.getElementById("iEyebrow").textContent = "Salary needed today to match it";
      document.getElementById("iBigDelta").textContent =
        "That is " + money0(Math.abs(r.difference)) + " " + dir + " (" + pct + "% " +
        (r.difference >= 0 ? "higher" : "lower") + ") than " + money0(salary) + " " + yrs +
        " ago — prices rose " + pct + "% over that time.";
      document.getElementById("iBuysLabel").textContent =
        "Your " + money0(salary) + " today buys what this bought " + yrs + " ago";
    } else {
      document.getElementById("iEyebrow").textContent = "Salary needed in " + yrs + " to keep pace";
      document.getElementById("iBigDelta").textContent =
        "That is " + money0(Math.abs(r.difference)) + " " + dir + " (" + pct + "% " +
        (r.difference >= 0 ? "higher" : "lower") + ") than " + money0(salary) + " today — prices are expected to rise " +
        pct + "% over " + yrs + ".";
      document.getElementById("iBuysLabel").textContent =
        "Your " + money0(salary) + " in " + yrs + " will buy what this buys today";
    }
    document.getElementById("iBig").textContent = money0(r.equivalent) + " / year";
    document.getElementById("iEquivalent").textContent = money0(r.equivalent);
    document.getElementById("iDifference").textContent =
      (r.difference >= 0 ? "+" : "−") + money0(Math.abs(r.difference));
    document.getElementById("iPct").textContent =
      (r.pctChange >= 0 ? "+" : "−") + Math.abs(r.pctChange).toFixed(2) + "%";
    document.getElementById("iMonthlyNew").textContent = money(r.monthlyEquivalent);
    document.getElementById("iMonthlyCurrent").textContent = money(r.monthlyCurrent);
    document.getElementById("iBuys").textContent = money(r.realValue);
    document.getElementById("iFactor").textContent = "×" + r.factor.toFixed(4);
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcInflationBtn");
    if (btn) btn.addEventListener("click", calc);
  });
})();
