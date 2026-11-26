/* SalaryLab — 401(k) Contribution Calculator. Pure client-side, no network calls, no storage. */
(function () {
  "use strict";

  /* 2026 IRS limits (IRS Notice 2025-67): employee elective deferral $24,500
     (under 50; $32,500 with the age-50 catch-up, $35,750 at ages 60-63);
     total annual additions from all sources $72,000. The employer match does
     NOT count toward the $24,500 employee limit. */
  var EMPLOYEE_LIMIT_2026 = 24500;
  var TOTAL_LIMIT_2026 = 72000;

  /* ---------- pure math (node-testable) ----------
     employeeRaw = salary * contribPct / 100
     employee    = min(employeeRaw, 24500)   (2026 deferral limit; capped flag set when raw > limit)
     matchedBase = min(employee, salary * matchCapPct / 100)   (the part of the contribution the employer matches)
     employer    = matchedBase * matchPct / 100
     total       = employee + employer
     missedMatch = max(0, salary * matchCapPct / 100 - employee) * matchPct / 100
                   (match available on the slice up to the cap that was not contributed)
     effectiveRatePct = total / salary * 100
     future value (end-of-year contributions, annual compounding):
       factor = years == 0 ? 0 : (r == 0 ? years : ((1 + r)^years - 1) / r)
       fvTotal = total * factor; fvEmployee = employee * factor; fvEmployer = employer * factor
     Returns null when inputs are out of range.
  */
  function calc401k(o) {
    if (!(o.salary > 0) ||
        !(o.contribPct >= 0) || !(o.contribPct <= 100) ||
        !(o.matchPct >= 0) || !(o.matchPct <= 100) ||
        !(o.matchCapPct >= 0) || !(o.matchCapPct <= 100) ||
        !(o.years >= 0) || !(o.years <= 50) ||
        !(o.returnPct > -100) || !(o.returnPct < 100)) {
      return null;
    }
    var r = o.returnPct / 100;
    var employeeRaw = o.salary * o.contribPct / 100;
    var employee = Math.min(employeeRaw, EMPLOYEE_LIMIT_2026);
    var capped = employeeRaw > EMPLOYEE_LIMIT_2026;
    var capBase = o.salary * o.matchCapPct / 100;
    var matchedBase = Math.min(employee, capBase);
    var employer = matchedBase * o.matchPct / 100;
    var total = employee + employer;
    var missed = Math.max(0, capBase - employee) * o.matchPct / 100;
    var factor = 0;
    if (o.years > 0) {
      factor = (r === 0) ? o.years : (Math.pow(1 + r, o.years) - 1) / r;
    }
    return {
      employeeRaw: employeeRaw,
      employee: employee,
      capped: capped,
      employer: employer,
      total: total,
      missedMatch: missed,
      monthlyEmployee: employee / 12,
      monthlyTotal: total / 12,
      effectiveRatePct: total / o.salary * 100,
      fvTotal: total * factor,
      fvEmployee: employee * factor,
      fvEmployer: employer * factor
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calc401k: calc401k, EMPLOYEE_LIMIT_2026: EMPLOYEE_LIMIT_2026, TOTAL_LIMIT_2026: TOTAL_LIMIT_2026 };
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
  function pct1(x) { return x.toFixed(2) + "%"; }

  function calc() {
    var salary = num("kSalary");
    var contrib = num("kContrib");
    var match = num("kMatch");
    var cap = num("kCap");
    var years = num("kYears");
    var ret = num("kReturn");
    var out = document.getElementById("kResults");
    var err = document.getElementById("kError");
    err.textContent = "";
    if (isNaN(salary) || !(salary > 0)) {
      err.textContent = "Enter an annual salary above zero.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(contrib) || contrib < 0 || contrib > 100) {
      err.textContent = "Enter a contribution rate between 0% and 100% of your salary.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(match) || match < 0 || match > 100) {
      err.textContent = "Enter an employer match rate between 0% and 100%.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(cap) || cap < 0 || cap > 100) {
      err.textContent = "Enter a match cap between 0% and 100% of your salary.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(years) || years < 0 || years > 50) {
      err.textContent = "Enter years until retirement between 0 and 50.";
      out.classList.remove("show");
      return;
    }
    if (isNaN(ret) || !(ret > -100) || !(ret < 100)) {
      err.textContent = "Enter an expected annual return between -100% and 100%.";
      out.classList.remove("show");
      return;
    }
    var k = calc401k({ salary: salary, contribPct: contrib, matchPct: match, matchCapPct: cap, years: years, returnPct: ret });
    if (!k) {
      err.textContent = "Check the numbers and try again.";
      out.classList.remove("show");
      return;
    }
    var verdict = document.getElementById("kVerdict");
    if (k.missedMatch > 0.005) {
      verdict.textContent = "You are leaving " + money(k.missedMatch) + " a year of employer match on the table — free money your plan would pay if you contributed up to the match cap.";
    } else if (k.employer > 0) {
      verdict.textContent = "Full match captured: every dollar of match your plan offers is landing in your account.";
    } else {
      verdict.textContent = "No employer match in this setup — everything in the account is your own contribution.";
    }
    document.getElementById("kBig").textContent = money0(k.total);
    document.getElementById("kBigDelta").textContent =
      "That's " + money0(k.employee) + " from you plus " + money0(k.employer) +
      " from your employer, every year — " + money0(k.monthlyTotal) + " a month going in.";
    document.getElementById("kEmployee").textContent = money(k.employee) + " a year";
    document.getElementById("kEmployer").textContent = money(k.employer) + " a year";
    document.getElementById("kTotal").textContent = money(k.total) + " a year";
    document.getElementById("kMonthlyEmp").textContent = money(k.monthlyEmployee);
    document.getElementById("kMonthlyTotal").textContent = money(k.monthlyTotal);
    document.getElementById("kEffRate").textContent = pct1(k.effectiveRatePct) + " of salary";
    document.getElementById("kMissed").textContent = money(k.missedMatch) + " a year";
    document.getElementById("kFvTotal").textContent = money0(k.fvTotal);
    document.getElementById("kFvEmp").textContent = money0(k.fvEmployee);
    document.getElementById("kFvEr").textContent = money0(k.fvEmployer);
    var note = document.getElementById("kCapNote");
    if (k.capped) {
      note.textContent = "Note: your " + pct1(contrib) + " would be " + money0(k.employeeRaw) +
        " a year, but the 2026 IRS employee deferral limit caps it at $24,500. The excess cannot go into this 401(k) — the employer match is calculated on the capped $24,500.";
      note.style.display = "";
    } else {
      note.textContent = "";
      note.style.display = "none";
    }
    out.classList.add("show");
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("calc401kBtn");
    if (btn) btn.addEventListener("click", calc);
  });
})();
