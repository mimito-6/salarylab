#!/usr/bin/env python3
"""Verify the SalaryLab math against the spec's test vectors.

Formulas:
  nominal hourly = salary / (hours_per_week * 52)
  commute hours/year = daily commute (round-trip, hours) * days/week * 52
  true hourly = salary / (work hours/year + commute hours/year + unpaid overtime hours/year)
  commute cost/year = commute hours/year * nominal hourly + annual transport cost
"""

WEEKS = 52


def nominal_hourly(salary, hours_per_week):
    return salary / (hours_per_week * WEEKS)


def commute_hours_year(daily_commute_h, days_per_week):
    return daily_commute_h * days_per_week * WEEKS


def true_hourly(salary, hours_per_week, daily_commute_h=0.0, days_per_week=5, unpaid_ot_per_week=0.0):
    total = (hours_per_week * WEEKS
             + commute_hours_year(daily_commute_h, days_per_week)
             + unpaid_ot_per_week * WEEKS)
    return salary / total


def commute_cost_year(daily_commute_h, days_per_week, monthly_transport_cost=0.0,
                      annual_extra_cost=0.0, nominal=None):
    hours = commute_hours_year(daily_commute_h, days_per_week)
    time_cost = hours * nominal if nominal is not None else 0.0
    money_cost = monthly_transport_cost * 12 + annual_extra_cost
    return hours, time_cost, money_cost, time_cost + money_cost


def check(label, got, want, tol=0.01):
    ok = abs(got - want) <= tol
    print(f"  {'PASS' if ok else 'FAIL'}  {label}: got {got:.4f}, want {want:.4f}")
    return ok


all_ok = True

print("== salary -> hourly test vectors ==")
# 1. nominal: $100,000 / (40*52) = $48.0769... -> $48.08
all_ok &= check("nominal $100k, 40h/wk", nominal_hourly(100000, 40), 48.08)

# 2. true with 1h/day commute, 5d/wk: hours = 2080 + 260 = 2340
#    spec's test vector says "2330h" / $42.92 — but 1*5*52 = 260, 2080+260 = 2340,
#    and 100000/2340 = 42.735..., NOT 42.92. The spec vector appears to have an
#    arithmetic slip (2330 would need 250 commute hours = 50 weeks, but the spec
#    mandates the 52-week year). Check both and report.
spec_claimed = 100000 / 2330  # = 42.918...
print(f"  INFO  spec-claimed vector '2330h' would give ${spec_claimed:.2f}/h")
got_true = true_hourly(100000, 40, daily_commute_h=1.0, days_per_week=5)
all_ok &= check("true 1h commute/day, 5d/wk (52-wk year)", got_true, 100000 / 2340)

# 3. true with +5h/week unpaid overtime: hours = 2080 + 260 + 260 = 2600 -> 100000/2600 = 38.4615
#    spec says "2590h -> $38.61" — same 52-week slip (2590 = 2080+250+260).
got_true2 = true_hourly(100000, 40, daily_commute_h=1.0, days_per_week=5, unpaid_ot_per_week=5.0)
print(f"  INFO  spec-claimed vector '2590h' would give ${100000/2590:.2f}/h")
all_ok &= check("true +5h/wk unpaid OT (52-wk year)", got_true2, 100000 / 2600)

print("== commute cost test vector ==")
# 1h/day round-trip, 5d/wk, $200/month transit pass, $600/year fuel+tolls,
# nominal $48.08/h
nom = nominal_hourly(100000, 40)
hours, time_cost, money_cost, total = commute_cost_year(
    1.0, 5, monthly_transport_cost=200.0, annual_extra_cost=600.0, nominal=nom)
all_ok &= check("commute hours/year", hours, 260.0)
all_ok &= check("commute time cost", time_cost, 260.0 * (100000 / 2080))
all_ok &= check("commute money cost", money_cost, 200.0 * 12 + 600.0)
all_ok &= check("commute total cost", total, time_cost + money_cost)
print(f"  INFO  totals: {hours:.0f}h/yr, time cost ${time_cost:,.0f}, money ${money_cost:,.0f}, total ${total:,.0f}")

print("== edge cases ==")
# no commute / no OT -> true == nominal
all_ok &= check("true == nominal when nothing extra", true_hourly(80000, 40), nominal_hourly(80000, 40))
# zero salary -> zero hourly, no crash
all_ok &= check("zero salary", nominal_hourly(0, 40), 0.0)
# part-time: $50k @ 20h/wk -> 50000/1040 = 48.08
all_ok &= check("part-time $50k @20h/wk", nominal_hourly(50000, 20), 48.08)

print()
print("RESULT:", "ALL PASS" if all_ok else "FAILURES PRESENT")
