/* SalaryLab — Real Raise Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     newNominal   = current * (1 + raisePct / 100)
     standStill   = current * (1 + inflationPct / 100)   (salary that buys the same as today)
     realSalary   = newNominal / (1 + inflationPct / 100)   (new salary in today's dollars)
     realRaisePct = (1 + raisePct / 100) / (1 + inflationPct / 100) - 1, in percent
     ppGain       = realSalary - current   (purchasing-power change, today's dollars)
     nominalSurplus = newNominal - standStill   (same gain, next year's dollars)
     breakEvenPct = inflationPct   (the nominal raise that just keeps pace)
     nominalNeeded(realTargetPct, inflationPct) = (1 + realTargetPct/100)*(1 + inflationPct/100) - 1
     Note: real raise is NOT raise minus inflation (5% - 3% = 2% is wrong);
     the exact figure is (1.05 / 1.03 - 1) = 1.9417%.
     Returns null when inputs are out of range. Inflation may be negative
     (deflation, down to -99%); a raise of 0% is valid.
  */
  function calcRealRaise(o) {
    if (!(o.current > 0) || !(o.raisePct >= 0) ||
        !(o.inflationPct > -100) || !(o.inflationPct < 100)) {
      return null;
    }
    var r = o.raisePct / 100;
    var i = o.inflationPct / 100;
    var newNominal = o.current * (1 + r);
    var standStill = o.current * (1 + i);
    var realSalary = newNominal / (1 + i);
    return {
      newNominal: newNominal,
      standStill: standStill,
      realSalary: realSalary,
      realRaisePct: ((1 + r) / (1 + i) - 1) * 100,
      ppGain: realSalary - o.current,
      nominalSurplus: newNominal - standStill,
      breakEvenPct: o.inflationPct,
      newMonthly: newNominal / 12,
      realMonthly: realSalary / 12,
      currentMonthly: o.current / 12
    };
  }

  function calcNominalNeeded(o) {
    if (!(o.current > 0) || !(o.realTargetPct >= -100) ||
        !(o.inflationPct > -100) || !(o.inflationPct < 100)) {
      return null;
    }
    var nominalPct = (1 + o.realTargetPct / 100) * (1 + o.inflationPct / 100) - 1;
    if (nominalPct < 0) return null; // a real raise target below what deflation alone gives
    return {
      nominalPct: nominalPct * 100,
      newNominal: o.current * (1 + nominalPct)
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calcRealRaise: calcRealRaise, calcNominalNeeded: calcNominalNeeded };
    return;
  }

  function num(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : NaN;
  }
  function money(x) {
    var sign = x < 0 ? "-" : "";
    return sign + "$" + Math.abs(x).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(x) {
    var sign = x < 0 ? "-" : "";
    return sign + "$" + Math.abs(Math.round(x)).toLocaleString("en-US");
  }
  function pct(x) {
    var sign = x > 0 ? "+" : "";
    return sign + x.toFixed(2) + "%";
  }

  function calc() {
    var current = num("rrCurrent");
    var raisePct = num("rrRaise");
    var infl = num("rrInfl");
    var out = document.getElementById("rrResults");
    var err = document.getElementById("rrError");
    err.textContent = "";
    if (isNaN(current) || !(current > 0)) {
      err.textContent = "Enter a current annual salary above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(raisePct) || raisePct < 0) {
      err.textContent = "Enter a raise of 0 percent or more. (A pay cut is a negative raise — this tool prices raises.)";
      out.classList.remove("show");
      return;
    }
    if (isNaN(infl) || !(infl > -100) || !(infl < 100)) {
      err.textContent = "Enter an inflation rate between -100% and 100%. Use a negative number for deflation.";
      out.classList.remove("show");
      return;
    }
    var r = calcRealRaise({ current: current, raisePct: raisePct, inflationPct: infl });
    if (!r) {
      err.textContent = "Check the numbers and try again.";
      out.classList.remove("show");
      return;
    }
    var verdict = document.getElementById("rrVerdict");
    if (r.realRaisePct > 0.005) {
      verdict.textContent = "Real raise: your pay buys more than it did — a genuine " + pct(r.realRaisePct) + " increase in purchasing power.";
    } else if (r.realRaisePct < -0.005) {
      verdict.textContent = "Real pay cut: your pay buys less than it did — " + pct(r.realRaisePct) + " in purchasing power, even though the number went up.";
    } else {
      verdict.textContent = "Break-even: your raise exactly keeps pace with inflation. Same buying power, no more, no less.";
    }
    document.getElementById("rrBig").textContent = money0(r.realSalary);
    document.getElementById("rrBigDelta").textContent =
      "New salary " + money0(r.newNominal) + " is worth " + money0(r.realSalary) +
      " in today's dollars — a real " + pct(r.realRaisePct) + ".";
    document.getElementById("rrRealSalary").textContent = money(r.realSalary);
    document.getElementById("rrRealRaise").textContent = pct(r.realRaisePct);
    document.getElementById("rrPpGain").textContent = money(r.ppGain) + " a year";
    document.getElementById("rrNewNominal").textContent = money0(r.newNominal);
    document.getElementById("rrStandStill").textContent = money0(r.standStill);
    document.getElementById("rrBreakEven").textContent = pct(r.breakEvenPct);
    document.getElementById("rrNominalSurplus").textContent = money(r.nominalSurplus);
    document.getElementById("rrNewMonthly").textContent = money(r.newMonthly);
    document.getElementById("rrRealMonthly").textContent = money(r.realMonthly);
    document.getElementById("rrCurrentMonthly").textContent = money(r.currentMonthly);
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function calcTarget() {
    var current = num("rrCurrent");
    var realTarget = num("tReal");
    var infl = num("rrInfl");
    var out = document.getElementById("tResults");
    var err = document.getElementById("tError");
    err.textContent = "";
    if (isNaN(current) || !(current > 0)) {
      err.textContent = "Enter a current annual salary above zero first (in the calculator above).";
      out.classList.remove("show");
      return;
    }
    if (isNaN(realTarget) || realTarget < 0) {
      err.textContent = "Enter a target real raise of 0 percent or more.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(infl) || !(infl > -100) || !(infl < 100)) {
      err.textContent = "Enter an inflation rate between -100% and 100% first (in the calculator above).";
      out.classList.remove("show");
      return;
    }
    var n = calcNominalNeeded({ current: current, realTargetPct: realTarget, inflationPct: infl });
    if (!n) {
      err.textContent = "That real raise is already beaten by deflation alone — no nominal raise is needed.";
      out.classList.remove("show");
      return;
    }
    document.getElementById("tNeeded").textContent = pct(n.nominalPct);
    document.getElementById("tNewNominal").textContent = money0(n.newNominal);
    document.getElementById("tAnnualGap").textContent = money(n.newNominal - current);
    out.classList.add("show");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcRealBtn");
    if (btn) btn.addEventListener("click", calc);
    var btn2 = document.getElementById("calcTargetBtn");
    if (btn2) btn2.addEventListener("click", calcTarget);
  });
})();
