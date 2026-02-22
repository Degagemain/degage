# Simulation — functional overview

This document describes the **simulation** feature from a functional point of view: what it does, what data it uses, and how results are determined. It is aimed at administrators and others who need to understand the process without reading code.

---

## Purpose

The simulation checks **whether a car can be admitted to the car sharing system**. Someone (e.g. a back-office user) enters the car’s details; the system applies a fixed set of rules and returns a **result** plus a list of **steps** that explain what was checked and what the outcome was.

Simulation is currently available only in the **admin zone** (Admin → Simulations → New). A consumer-oriented simulation flow is planned.

---

## Input: what the user provides

To run a simulation, the following must be supplied:

| Field                       | Description                                   | Notes                                                                |
| --------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| **Brand**                   | The car’s brand (from a list).                | Required.                                                            |
| **Fuel type**               | Petrol, diesel, electric, etc. (from a list). | Required.                                                            |
| **Car type**                | Type of vehicle (from a list, or “Other”).    | Required. If “Other” is chosen, a short description must be entered. |
| **Car type (other)**        | Free-text description of the car type.        | Required only when car type is “Other”.                              |
| **Mileage**                 | Current odometer reading in kilometres.       | Required, must be 0 or more.                                         |
| **First registration date** | Date the car was first registered.            | Required.                                                            |
| **Is van**                  | Whether the vehicle is a van.                 | Yes/No.                                                              |

---

## How the simulation runs

The system evaluates the car in a fixed order. Each evaluation is recorded as a **step** with a short message and a status (e.g. checkmark, cross, or info). As soon as a rule **fails**, the simulation stops and the overall result is **Not OK**. If all rules pass, the simulation continues to an informational step and then returns **Manual review**.

### Step 1 — Mileage limit

- **Rule:** The car’s mileage must not exceed the **maximum km** limit (configurable via **system parameters**; default 250,000 km).
- **If mileage ≤ limit:** The step is marked as passed (OK). The system continues.
- **If mileage > limit:** The step is marked as not passed (Not OK). The simulation **stops** and the overall result is **Not OK**.

### Step 2 — Age limit

- **Rule:** The car must not be older than the **maximum age in years** (configurable via **system parameters**; default 15 years, calculated from the first registration date).
- **If the car is within the age limit:** The step is marked as passed (OK). The system continues.
- **If the car is older than the limit:** The step is marked as not passed (Not OK). The simulation **stops** and the overall result is **Not OK**.

Admins can change these limits at runtime in **Admin → System parameters**. See [system-parameters.md](./system-parameters.md).

### Step 3 — Price estimate (informational)

- The system estimates a value range for the car (e.g. for internal use or future rules). This is **informational only**: it does not change the result.
- A step is added with the estimated price (or a summary of it).
- The simulation then finishes with the overall result **Manual review**.

So in practice:

- **Not OK** — The car did not meet the mileage rule and/or the age rule. The list of steps shows which check(s) failed.
- **Manual review** — The car passed both the mileage and age rules. An estimated price is shown. A person must still decide whether to admit the car (the system does not auto-approve).

---

## Result codes

The simulation can end with one of these overall results:

| Code                                              | Meaning (typical use)                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Not OK**                                        | The car does not meet the automatic rules (mileage and/or age). It is not admitted by the system.     |
| **Manual review**                                 | The car passed the automatic rules. A staff member should review and decide.                          |
| **Category A** / **Category B** / **Higher rate** | Reserved for future use (e.g. automatic categorisation or pricing). Not yet set by the current rules. |

Today, the engine only assigns **Not OK** or **Manual review**.

---

## Step statuses

Each step has a status that indicates how that check turned out:

- **OK** — The rule was satisfied (e.g. mileage under limit, car within age limit).
- **Not OK** — The rule was not satisfied; this step caused the simulation to stop with result **Not OK**.
- **Info** — Informational only (e.g. the price estimate); does not represent a pass/fail.

---

## Summary

1. User enters brand, fuel type, car type (or “Other” with description), mileage, first registration date, and whether it’s a van.
2. The system checks, in order: mileage ≤ 250,000 km, then car age ≤ 15 years. If either fails, the result is **Not OK** and the steps show what failed.
3. If both pass, the system adds an informational price-estimate step and returns **Manual review**.
4. A human can then use the result and the step list to decide whether to admit the car to the car sharing system.
