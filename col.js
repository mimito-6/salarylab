/* SalaryLab — Cost of Living Salary Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     ratio            = indexTo / indexFrom
     equivalent       = salary * ratio
     difference       = equivalent - salary
     pctChange        = (ratio - 1) * 100
     monthlyEquiv     = equivalent / 12
     monthlyCurrent   = salary / 12
     sameSalaryBuys   = salary / ratio   (what the unchanged salary is
                        worth in the new city, in current-city terms)
     Returns null when inputs are out of range: salary and both indices
     must be above zero. The indices only need to share one source and
     one base — their absolute scale does not matter, only the ratio.
  */
  function calcCOL(o) {
    if (!(o.salary > 0) || !(o.indexFrom > 0) || !(o.indexTo > 0)) {
      return null;
    }
    var ratio = o.indexTo / o.indexFrom;
    var equivalent = o.salary * ratio;
    return {
      ratio: ratio,
      equivalent: equivalent,
      difference: equivalent - o.salary,
      pctChange: (ratio - 1) * 100,
      monthlyEquivalent: equivalent / 12,
      monthlyCurrent: o.salary / 12,
      sameSalaryBuys: o.salary / ratio
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calcCOL: calcCOL };
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
    var salary = num("cSalary");
    var from = num("cFrom");
    var to = num("cTo");
    var out = document.getElementById("cResults");
    var err = document.getElementById("cError");
    err.textContent = "";
    if (isNaN(salary) || !(salary > 0)) {
      err.textContent = "Enter a current salary above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(from) || !(from > 0) || isNaN(to) || !(to > 0)) {
      err.textContent = "Enter a cost of living index above zero for both cities.";
      out.classList.remove("show");
      return;
    }
    var r = calcCOL({ salary: salary, indexFrom: from, indexTo: to });
    if (!r) {
      err.textContent = "Check the numbers and try again.";
      out.classList.remove("show");
      return;
    }
    var dir = r.difference > 0 ? "more" : (r.difference < 0 ? "less" : "the same");
    var pct = Math.abs(r.pctChange).toFixed(1);
    document.getElementById("cBig").textContent = money0(r.equivalent) + " / year";
    document.getElementById("cBigDelta").textContent =
      "That is " + money0(Math.abs(r.difference)) + " " + dir + " (" + pct + "% " +
      (r.difference >= 0 ? "higher" : "lower") + ") than your current salary — the same " +
      "basket of goods and services costs " + pct + "% " +
      (r.difference >= 0 ? "more" : "less") + " in the new city.";
    document.getElementById("cEquivalent").textContent = money0(r.equivalent);
    document.getElementById("cDifference").textContent =
      (r.difference >= 0 ? "+" : "−") + money0(Math.abs(r.difference));
    document.getElementById("cPct").textContent =
      (r.pctChange >= 0 ? "+" : "−") + Math.abs(r.pctChange).toFixed(2) + "%";
    document.getElementById("cMonthlyNew").textContent = money(r.monthlyEquivalent);
    document.getElementById("cMonthlyCurrent").textContent = money(r.monthlyCurrent);
    document.getElementById("cBuys").textContent = money(r.sameSalaryBuys);
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcCOLBtn");
    if (btn) btn.addEventListener("click", calc);
  });
})();
