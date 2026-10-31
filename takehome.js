/* SalaryLab — Take-Home Pay Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     tax     = gross * (taxRatePct / 100)   (flat rate supplied by the user;
                                             real income tax is progressive,
                                             so this is an approximation —
                                             see FAQ)
     net     = gross - tax - otherDeductions
     annualNet   = net * checksPerYear
     monthlyNet  = annualNet / 12           (NOT net * 2 for biweekly:
                                             26 checks / 12 months)
     takeHomePct = net / gross * 100
     Returns null when inputs are out of range or deductions exceed gross.
  */
  function calcTakeHome(o) {
    if (!(o.gross > 0) || !(o.checksPerYear > 0) ||
        !(o.taxRatePct >= 0 && o.taxRatePct <= 100) ||
        !(o.other >= 0)) {
      return null;
    }
    var tax = o.gross * o.taxRatePct / 100;
    var net = o.gross - tax - o.other;
    if (net < 0) return null;
    return {
      tax: tax,
      net: net,
      annualNet: net * o.checksPerYear,
      monthlyNet: net * o.checksPerYear / 12,
      annualGross: o.gross * o.checksPerYear,
      takeHomePct: o.gross > 0 ? net / o.gross * 100 : 0
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calcTakeHome: calcTakeHome };
    return;
  }

  function num(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(el.value);
    return isFinite(v) && v >= 0 ? v : NaN;
  }
  function money(x) {
    return "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(x) {
    return "$" + Math.round(x).toLocaleString("en-US");
  }
  function pct(x) {
    return x.toFixed(1) + "%";
  }

  function calc() {
    var gross = num("thGross");
    var freqEl = document.getElementById("thFreq");
    var checks = freqEl ? parseInt(freqEl.value, 10) : 26;
    var rate = num("thRate");
    var other = num("thOther");
    var out = document.getElementById("thResults");
    var err = document.getElementById("thError");
    err.textContent = "";
    if (isNaN(gross) || !(gross > 0)) {
      err.textContent = "Enter a gross pay per paycheck above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(rate) || rate < 0 || rate > 100) {
      err.textContent = "Enter a tax rate between 0 and 100 percent.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(other)) {
      err.textContent = "Enter other deductions of zero or more.";
      out.classList.remove("show");
      return;
    }
    var r = calcTakeHome({ gross: gross, checksPerYear: checks, taxRatePct: rate, other: other });
    if (!r) {
      err.textContent = "Your deductions exceed your gross pay — check the numbers and try again.";
      out.classList.remove("show");
      return;
    }
    document.getElementById("thBig").textContent = money(r.net);
    document.getElementById("thBigDelta").textContent =
      money(gross) + " gross − " + money(r.tax) + " tax (" + rate + "%) − " +
      money(other) + " other deductions = " + money(r.net) + " take-home per paycheck.";
    document.getElementById("thTax").textContent = money(r.tax);
    document.getElementById("thOtherOut").textContent = money(other);
    document.getElementById("thNet").textContent = money(r.net);
    document.getElementById("thAnnualNet").textContent = money0(r.annualNet) + " (" + checks + " paychecks a year)";
    document.getElementById("thMonthlyNet").textContent = money(r.monthlyNet);
    document.getElementById("thTakeHomePct").textContent = pct(r.takeHomePct) + " of gross";
    document.getElementById("thAnnualGross").textContent = money0(r.annualGross);
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcTakeHomeBtn");
    if (btn) btn.addEventListener("click", calc);
  });
})();
