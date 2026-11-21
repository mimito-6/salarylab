/* SalaryLab — Contractor vs Employee Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* ---------- pure math (node-testable) ----------
     Employee side:
       ptoWeeks       = ptoDays / 5   (5 working days per week)
       empWorkHours   = empHours * (52 - ptoWeeks)   (PTO is paid, so it shrinks hours, not pay)
       empTotal       = salary + benefits
       empEff         = empTotal / empWorkHours   (effective hourly rate)
     Contractor side:
       billHoursYear  = billHours * billWeeks
       gross          = rate * billHoursYear
       seFactor       = 0.9235 * (seRatePct / 100)   (US rule: only 92.35% of net
                        earnings are subject to self-employment tax; at 15.3%
                        the effective rate on gross is 0.9235 * 0.153 = 14.1296%)
       seTax          = gross * seFactor
       net            = gross - seTax
       conEff         = net / billHoursYear   (rate after self-employment tax)
     Break-even contractor rate (net equals employee total compensation):
       breakEven      = empTotal / (1 - seFactor) / billHoursYear
     Returns null when inputs are out of range. SE rate 0% is allowed
     (net = gross). PTO covering the whole year, or billable weeks over 52,
     return null.
  */
  function calcContractor(o) {
    if (!(o.salary > 0) || !(o.benefits >= 0) ||
        !(o.empHours > 0) || !(o.ptoDays >= 0) ||
        !(o.rate > 0) || !(o.billHours > 0) || !(o.billWeeks > 0) ||
        !(o.seRatePct >= 0) || !(o.seRatePct <= 100)) {
      return null;
    }
    var ptoWeeks = o.ptoDays / 5;
    if (ptoWeeks >= 52) return null;
    if (o.billWeeks > 52) return null;
    var empWorkHours = o.empHours * (52 - ptoWeeks);
    if (!(empWorkHours > 0)) return null;
    var billHoursYear = o.billHours * o.billWeeks;
    if (!(billHoursYear > 0)) return null;
    var empTotal = o.salary + o.benefits;
    var seFactor = 0.9235 * (o.seRatePct / 100);
    var gross = o.rate * billHoursYear;
    var seTax = gross * seFactor;
    var net = gross - seTax;
    return {
      empTotal: empTotal,
      empWorkHours: empWorkHours,
      empEff: empTotal / empWorkHours,
      billHoursYear: billHoursYear,
      gross: gross,
      seFactor: seFactor,
      seTax: seTax,
      net: net,
      conEff: net / billHoursYear,
      breakEven: empTotal / (1 - seFactor) / billHoursYear
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calcContractor: calcContractor };
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
  function hours(x) {
    return Math.round(x).toLocaleString("en-US") + " hours";
  }

  function calc() {
    var salary = num("ceSalary");
    var benefits = num("ceBenefits");
    var empHours = num("ceEmpHours");
    var ptoDays = num("cePto");
    var rate = num("ceRate");
    var billHours = num("ceBillHours");
    var billWeeks = num("ceBillWeeks");
    var seRate = num("ceSeRate");
    var out = document.getElementById("ceResults");
    var err = document.getElementById("ceError");
    err.textContent = "";
    if (isNaN(salary) || !(salary > 0)) {
      err.textContent = "Enter an employee salary above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(benefits) || benefits < 0) {
      err.textContent = "Enter benefits of $0 or more — $0 if you do not know the value.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(empHours) || !(empHours > 0)) {
      err.textContent = "Enter employee hours per week above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(ptoDays) || ptoDays < 0 || ptoDays >= 260) {
      err.textContent = "Enter paid time off between 0 and 259 days a year.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(rate) || !(rate > 0)) {
      err.textContent = "Enter a contractor hourly rate above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(billHours) || !(billHours > 0)) {
      err.textContent = "Enter billable hours per week above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(billWeeks) || !(billWeeks > 0) || billWeeks > 52) {
      err.textContent = "Enter billable weeks per year between 0 and 52.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(seRate) || seRate < 0 || seRate > 100) {
      err.textContent = "Enter a self-employment tax rate between 0% and 100%.";
      out.classList.remove("show");
      return;
    }
    var r = calcContractor({
      salary: salary, benefits: benefits, empHours: empHours, ptoDays: ptoDays,
      rate: rate, billHours: billHours, billWeeks: billWeeks, seRatePct: seRate
    });
    if (!r) {
      err.textContent = "Check the numbers and try again.";
      out.classList.remove("show");
      return;
    }
    var hourDiff = r.conEff - r.empEff;
    var totalDiff = r.net - r.empTotal;
    var verdict = document.getElementById("ceVerdict");
    var verdictTotal = document.getElementById("ceVerdictTotal");
    if (hourDiff > 0.005) {
      verdict.textContent = "Per hour, the contractor offer pays more: " + money(r.conEff) +
        "/h after self-employment tax, vs " + money(r.empEff) + "/h for the employee — a lead of " +
        money(hourDiff) + "/h.";
    } else if (hourDiff < -0.005) {
      verdict.textContent = "Per hour, the employee offer pays more: " + money(r.empEff) +
        "/h, vs " + money(r.conEff) + "/h for the contractor after self-employment tax — a lead of " +
        money(-hourDiff) + "/h.";
    } else {
      verdict.textContent = "Per hour, the two offers are effectively tied: " + money(r.empEff) +
        "/h for the employee vs " + money(r.conEff) + "/h for the contractor after self-employment tax.";
    }
    if (totalDiff > 0.005) {
      verdictTotal.textContent = "In total over the year, the contractor offer pays more: " + money0(r.net) +
        " after self-employment tax, vs " + money0(r.empTotal) + " in employee total compensation.";
    } else if (totalDiff < -0.005) {
      verdictTotal.textContent = "In total over the year, the employee offer pays more: " + money0(r.empTotal) +
        " in total compensation, vs " + money0(r.net) + " for the contractor after self-employment tax.";
    } else {
      verdictTotal.textContent = "In total over the year, the two offers pay the same: " + money0(r.empTotal) + ".";
    }
    if ((hourDiff > 0.005 && totalDiff < -0.005) || (hourDiff < -0.005 && totalDiff > 0.005)) {
      verdictTotal.textContent += " The two winners split — this is a time-vs-money choice, not a clear winner.";
    }
    document.getElementById("ceBig").textContent = money(r.breakEven) + "/h";
    document.getElementById("ceBigDelta").textContent =
      "At " + hours(r.billHoursYear) + " billable a year, a contractor needs " + money(r.breakEven) +
      "/h to match the employee package of " + money0(r.empTotal) + " after self-employment tax.";
    document.getElementById("ceEmpTotal").textContent = money0(r.empTotal);
    document.getElementById("ceEmpHoursYear").textContent = hours(r.empWorkHours);
    document.getElementById("ceEmpEff").textContent = money(r.empEff) + "/h";
    document.getElementById("ceConGross").textContent = money0(r.gross);
    document.getElementById("ceSeTax").textContent = money(r.seTax) +
      " (" + (r.seFactor * 100).toFixed(2) + "% of gross)";
    document.getElementById("ceConNet").textContent = money0(r.net);
    document.getElementById("ceConHours").textContent = hours(r.billHoursYear);
    document.getElementById("ceConEff").textContent = money(r.conEff) + "/h";
    document.getElementById("ceBreakEven").textContent = money(r.breakEven) + "/h";
    document.getElementById("ceHourWinner").textContent =
      hourDiff > 0.005 ? "Contractor (" + money(r.conEff) + "/h)" :
      hourDiff < -0.005 ? "Employee (" + money(r.empEff) + "/h)" : "Tie";
    document.getElementById("ceTotalWinner").textContent =
      totalDiff > 0.005 ? "Contractor (" + money0(r.net) + ")" :
      totalDiff < -0.005 ? "Employee (" + money0(r.empTotal) + ")" : "Tie";
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("ceCalcBtn");
    if (btn) btn.addEventListener("click", calc);
  });
})();
