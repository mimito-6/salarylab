/* SalaryLab — pure client-side calculators. No network calls, no storage. */
(function () {
  "use strict";
  var WEEKS = 52;

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

  /* ---------- index.html: salary -> hourly ---------- */
  function calcSalary() {
    var salary = num("salary");
    var hpw = num("hoursPerWeek");
    var commuteH = num("commuteHours");      // round-trip hours per day
    var daysWk = num("commuteDays");         // days per week
    var otWk = num("overtime");               // unpaid overtime hours per week

    var out = document.getElementById("salaryResults");
    var err = document.getElementById("salaryError");
    err.textContent = "";
    if (salary <= 0 || hpw <= 0) {
      err.textContent = "Enter an annual salary and weekly hours greater than zero.";
      out.classList.remove("show");
      return;
    }

    var workH = hpw * WEEKS;
    var commuteHYear = commuteH * daysWk * WEEKS;
    var otHYear = otWk * WEEKS;
    var totalH = workH + commuteHYear + otHYear;

    var nominal = salary / workH;
    var trueH = salary / totalH;
    var gap = nominal - trueH;

    document.getElementById("nominalValue").textContent = money(nominal) + "/hr";
    document.getElementById("trueValue").textContent = money(trueH) + "/hr";
    var delta = document.getElementById("trueDelta");
    delta.textContent = gap > 0.005
      ? "That's " + money(gap) + "/hr lower than your nominal rate — a " +
        Math.round((gap / nominal) * 100) + "% hidden pay cut."
      : "No commute or unpaid overtime entered, so both rates match.";
    document.getElementById("lineWork").textContent = hoursStr(workH) + " (" + hpw + "h × " + WEEKS + " weeks)";
    document.getElementById("lineCommute").textContent = hoursStr(commuteHYear);
    document.getElementById("lineOT").textContent = hoursStr(otHYear);
    document.getElementById("lineTotal").textContent = hoursStr(totalH);

    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- commute-cost page ---------- */
  function calcCommute() {
    var commuteH = num("cCommuteHours");       // round-trip hours per day
    var daysWk = num("cDays");                 // days per week
    var monthly = num("cMonthlyCost");         // monthly transport cost
    var annual = num("cAnnualCost");           // extra annual cost (fuel, tolls, parking, ...)
    var salary = num("cSalary");               // optional: for time-cost valuation
    var hpw = num("cHoursPerWeek") || 40;

    var out = document.getElementById("commuteResults");
    var err = document.getElementById("commuteError");
    err.textContent = "";
    if (commuteH <= 0) {
      err.textContent = "Enter a daily commute time greater than zero.";
      out.classList.remove("show");
      return;
    }

    var hoursYear = commuteH * daysWk * WEEKS;
    var moneyCost = monthly * 12 + annual;
    var nominal = salary > 0 ? salary / (hpw * WEEKS) : 0;
    var timeCost = nominal > 0 ? hoursYear * nominal : 0;
    var total = moneyCost + timeCost;

    document.getElementById("ccHours").textContent = hoursStr(hoursYear);
    document.getElementById("ccDays").textContent =
      (hoursYear / 24).toFixed(1) + " full days";
    document.getElementById("ccWeeks").textContent =
      (hoursYear / hpw).toFixed(1) + " work weeks";
    document.getElementById("ccMoney").textContent = money0(moneyCost);
    var timeRow = document.getElementById("rowTimeCost");
    if (nominal > 0) {
      timeRow.style.display = "";
      document.getElementById("ccTime").textContent = money0(timeCost) +
        " (" + money(nominal) + "/hr × " + hoursStr(hoursYear) + ")";
    } else {
      timeRow.style.display = "none";
    }
    document.getElementById("ccTotal").textContent =
      (nominal > 0 ? money0(total) + " (money + time)" : money0(moneyCost));
    document.getElementById("ccDelta").textContent =
      "That's " + hoursStr(hoursYear) + " of your life every year spent getting to work and back.";

    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var b1 = document.getElementById("calcSalaryBtn");
    if (b1) b1.addEventListener("click", calcSalary);
    var b2 = document.getElementById("calcCommuteBtn");
    if (b2) b2.addEventListener("click", calcCommute);
  });
})();
