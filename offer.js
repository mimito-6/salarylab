/* SalaryLab — Job Offer Comparison Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     scheduledHours = hoursPerWeek * weeksPerYear
     hoursPerDay    = hoursPerWeek / 5            (a 5-day week)
     ptoHours       = ptoDays * hoursPerDay        (paid days off are paid,
                                                    so they shrink working
                                                    hours, not pay)
     workingHours   = scheduledHours - ptoHours    (must stay > 0)
     totalComp      = salary + bonus + benefits - commuteMonthly * 12
     effectiveHourly = totalComp / workingHours
     monthlyPay     = totalComp / 12
     nominalHourly  = salary / scheduledHours      (the headline rate, before
                                                    hours, PTO and commute)
     Returns null when inputs are out of range.
     compareOffers(a, b) takes two calcOffer results and reports which side
     wins on effective hourly rate and on total compensation. The two
     verdicts can split — a higher salary can still lose on hourly rate
     when it demands many more hours.
  */
  function calcOffer(o) {
    if (!(o.salary > 0) || !(o.hoursPerWeek > 0) || !(o.weeksPerYear > 0) ||
        !(o.ptoDays >= 0) || !(o.bonus >= 0) || !(o.benefits >= 0) ||
        !(o.commuteMonthly >= 0)) {
      return null;
    }
    var scheduledHours = o.hoursPerWeek * o.weeksPerYear;
    var ptoHours = o.ptoDays * (o.hoursPerWeek / 5);
    var workingHours = scheduledHours - ptoHours;
    if (!(workingHours > 0)) {
      return null;
    }
    var totalComp = o.salary + o.bonus + o.benefits - o.commuteMonthly * 12;
    return {
      scheduledHours: scheduledHours,
      ptoHours: ptoHours,
      workingHours: workingHours,
      totalComp: totalComp,
      effectiveHourly: totalComp / workingHours,
      monthlyPay: totalComp / 12,
      nominalHourly: o.salary / scheduledHours
    };
  }

  function compareOffers(a, b) {
    if (!a || !b) {
      return null;
    }
    var eps = 1e-9;
    function verdict(x, y) {
      if (Math.abs(x - y) <= eps) return "tie";
      return x > y ? "A" : "B";
    }
    return {
      hourlyWinner: verdict(a.effectiveHourly, b.effectiveHourly),
      compWinner: verdict(a.totalComp, b.totalComp),
      hourlyDiff: Math.abs(a.effectiveHourly - b.effectiveHourly),
      compDiff: Math.abs(a.totalComp - b.totalComp)
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calcOffer: calcOffer, compareOffers: compareOffers };
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
  function label(prefix) {
    var el = document.getElementById(prefix + "Name");
    var v = el ? el.value.trim() : "";
    return v || (prefix === "a" ? "Offer A" : "Offer B");
  }

  function readOffer(prefix) {
    return {
      salary: num(prefix + "Salary"),
      hoursPerWeek: num(prefix + "Hours"),
      weeksPerYear: num(prefix + "Weeks"),
      ptoDays: num(prefix + "Pto"),
      bonus: num(prefix + "Bonus"),
      benefits: num(prefix + "Benefits"),
      commuteMonthly: num(prefix + "Commute")
    };
  }

  function validate(o, name) {
    if (isNaN(o.salary) || !(o.salary > 0)) return name + ": enter an annual salary above zero.";
    if (isNaN(o.hoursPerWeek) || !(o.hoursPerWeek > 0)) return name + ": enter hours per week above zero.";
    if (isNaN(o.weeksPerYear) || !(o.weeksPerYear > 0)) return name + ": enter weeks per year above zero.";
    if (isNaN(o.ptoDays) || o.ptoDays < 0) return name + ": enter paid time off of 0 days or more.";
    if (isNaN(o.bonus) || o.bonus < 0) return name + ": enter a bonus of $0 or more.";
    if (isNaN(o.benefits) || o.benefits < 0) return name + ": enter other benefits of $0 or more.";
    if (isNaN(o.commuteMonthly) || o.commuteMonthly < 0) return name + ": enter a monthly commute cost of $0 or more.";
    return null;
  }

  function render(prefix, r) {
    document.getElementById(prefix + "Eff").textContent = money(r.effectiveHourly);
    document.getElementById(prefix + "Total").textContent = money0(r.totalComp);
    document.getElementById(prefix + "Monthly").textContent = money(r.monthlyPay);
    document.getElementById(prefix + "Nominal").textContent = money(r.nominalHourly);
    document.getElementById(prefix + "Working").textContent =
      Math.round(r.workingHours).toLocaleString("en-US") + " hrs";
    document.getElementById(prefix + "Sched").textContent =
      Math.round(r.scheduledHours).toLocaleString("en-US") + " hrs";
  }

  function calc() {
    var nameA = label("a");
    var nameB = label("b");
    var oa = readOffer("a");
    var ob = readOffer("b");
    var err = document.getElementById("cError");
    var out = document.getElementById("cResults");
    err.textContent = "";
    var bad = validate(oa, nameA) || validate(ob, nameB);
    if (bad) {
      err.textContent = bad;
      out.classList.remove("show");
      return;
    }
    var ra = calcOffer(oa);
    var rb = calcOffer(ob);
    if (!ra || !rb) {
      err.textContent = "Paid time off cannot cover the whole year — check the PTO days against the schedule.";
      out.classList.remove("show");
      return;
    }
    render("a", ra);
    render("b", rb);
    document.getElementById("aTitle").textContent = nameA;
    document.getElementById("bTitle").textContent = nameB;
    var cmp = compareOffers(ra, rb);
    var tagA = document.getElementById("aWinner");
    var tagB = document.getElementById("bWinner");
    tagA.textContent = "";
    tagB.textContent = "";
    var verdict = document.getElementById("cVerdict");
    var hourlyLine, compLine;
    if (cmp.hourlyWinner === "tie") {
      hourlyLine = "Both offers pay the same effective hourly rate (" + money(ra.effectiveHourly) + ").";
    } else {
      var hw = cmp.hourlyWinner === "A" ? nameA : nameB;
      var hwRate = cmp.hourlyWinner === "A" ? ra.effectiveHourly : rb.effectiveHourly;
      var lwRate = cmp.hourlyWinner === "A" ? rb.effectiveHourly : ra.effectiveHourly;
      hourlyLine = hw + " wins on effective hourly rate: " + money(hwRate) + " vs " + money(lwRate) +
        " (+" + money(cmp.hourlyDiff) + " an hour).";
      (cmp.hourlyWinner === "A" ? tagA : tagB).textContent = "Best hourly rate";
    }
    if (cmp.compWinner === "tie") {
      compLine = "Both offers pay the same total compensation (" + money0(ra.totalComp) + " a year).";
    } else {
      var cw = cmp.compWinner === "A" ? nameA : nameB;
      var cwTotal = cmp.compWinner === "A" ? ra.totalComp : rb.totalComp;
      var lwTotal = cmp.compWinner === "A" ? rb.totalComp : ra.totalComp;
      compLine = cw + " wins on total compensation: " + money0(cwTotal) + " vs " + money0(lwTotal) +
        " a year (+" + money0(cmp.compDiff) + ").";
    }
    var split = cmp.hourlyWinner !== "tie" && cmp.compWinner !== "tie" &&
      cmp.hourlyWinner !== cmp.compWinner;
    verdict.textContent = hourlyLine + " " + compLine +
      (split ? " The verdict splits — one offer pays more in total, the other pays more per hour. That is a time-versus-money choice, not a math error." : "");
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calcCompareBtn");
    if (btn) btn.addEventListener("click", calc);
  });
})();
