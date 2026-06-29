---
title: Onboardings
roles:
  - admin
---

# Onboardings

Car onboarding is a multi-step process that collects vehicle and user details before a car can fully join the platform.

## Preparation

During preparation, the system gathers contact information and car characteristics in separate steps. A preparation status tracks whether the
required input is complete and whether further edits are allowed.

Admins manage preparation in the admin zone under **Onboardings** (list and tabbed detail: owner, user info, car info, insurer, car value,
finalize).

### Owner

Assigns the car onboarding owner and shows whether they have linked their legacy Dégage account (Play connector).

This step is complete when the owner has a Play connector record configured.

### Info session

The owner enrolls in an upcoming Degapp info session during the public onboarding flow.

| Status   | Meaning                                                                |
| -------- | ---------------------------------------------------------------------- |
| Todo     | The owner has not enrolled in an info session yet.                     |
| Enrolled | The owner enrolled in a session; waiting for admin attendance confirm. |
| Done     | An admin confirmed the owner attended the enrolled info session.       |

The owner can enroll in only one session at a time. To choose a different session, they must unenroll first.

Enrolling unlocks the next preparation steps in the public onboarding flow. Admin confirmation of attendance is still required before the info
session step is marked complete and preparation can be finalized.

This step is complete when info session status is **Done**.

### User info

Collects the owner's contact details: street, town, and phone.

This step is complete when street, town, and phone are all filled in.

### Car info

Collects vehicle characteristics: brand, fuel type, car type (or free-text other), mileage, seats, first registration date, van flag, purchased
car flag, new car flag, purchase price, depreciation per km, and registration certificate scans (front and back).

| Property                       | Description                                              |
| ------------------------------ | -------------------------------------------------------- |
| Brand                          | Vehicle brand.                                           |
| Fuel type                      | Fuel or powertrain type.                                 |
| Car type                       | Catalog car type, or free-text other if not in catalog.  |
| Mileage                        | Odometer reading in km.                                  |
| Seats                          | Number of seats.                                         |
| First registered               | Date of first registration.                              |
| Van                            | Whether the vehicle is a van.                            |
| Purchased car                  | Whether the vehicle was purchased (set at creation).     |
| New car                        | Whether the vehicle is new (set at creation).            |
| Purchase price                 | Purchase price.                                          |
| Registration certificate front | Scan or photo of the front of the registration document. |
| Registration certificate back  | Scan or photo of the back of the registration document.  |

This step is complete when brand, fuel type, and car type are all set.

### Insurer

Records the current insurance company and contract start date when the vehicle was not purchased.

| Status         | Meaning                                                              |
| -------------- | -------------------------------------------------------------------- |
| Not applicable | The vehicle was purchased; there is no existing insurance to record. |
| Todo           | The owner must provide the insurer and contract start date.          |
| Ready          | Insurer and contract start date are both filled in.                  |

The system sets insurer status automatically on save. When **Purchased car** is enabled, status becomes **Not applicable** and insurer fields
are cleared.

The owner can submit insurer details (insurer and contract start date) via a partial update while status is **Todo**.

This step is complete when insurer status is not **Todo**.

### Car value

Negotiates the estimated current value of the vehicle between admin and owner.

| Status   | Meaning                                                                       |
| -------- | ----------------------------------------------------------------------------- |
| Todo     | Initial state; waiting for an admin car value proposal.                       |
| Proposal | Admin proposed a car value; the owner may submit a counter proposal or agree. |
| Counter  | Owner submitted a counter proposal; waiting for admin response.               |
| Resolved | Owner agreed to the proposed car value; the car value subprocess is complete. |

When an admin changes the car value while status is **Todo** or **Counter**, the status moves to **Proposal** automatically.

The owner can submit a counter proposal (value and optional message) while status is **Proposal**, which moves status to **Counter**. The owner
can agree while status is **Proposal**, which moves status to **Resolved**.

Admins can overrule the agreement on the car value tab when the owner has explicitly agreed outside the normal in-app flow.

This step is complete when car value status is **Resolved**.

### Finalize

When play connector, info session, user info, car info, insurer, and car value are all complete, the system sets preparation status to **Ready**
automatically on save. An admin can then start the car onboarding on the **Finalize** tab.

| Status | Meaning                                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Open   | Onboarding is in progress; car-info, user-info, insurer, and car value negotiation are not all complete yet.                                                 |
| Ready  | Play connector, info session (Done), car-info, user-info, insurer (not Todo), and car value (Resolved) are all complete. The system sets this automatically. |
| Locked | No further user updates are allowed. Admins can still change the full record. Set by an admin on the **Finalize** tab when preparation is **Ready**.         |

When preparation is **Locked**, users cannot update car-info, user-info, insurer, or car value until an admin unlocks it.

## Creating a record

| Scenario        | Who can create     | Body                                                                                                         |
| --------------- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| From simulation | Any logged-in user | `{ "simulation": { "id": "<uuid>" } }` — car fields are copied from the simulation; the caller becomes owner |
| Empty shell     | Admin only         | `{}` — creates a record with default values and no linked simulation                                         |

## Properties

| Property                 | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| Street                   | User's street address.                                               |
| Town                     | User's town (postal code and locality).                              |
| Phone                    | User's phone number.                                                 |
| Brand                    | Vehicle brand.                                                       |
| Fuel type                | Vehicle fuel type.                                                   |
| Car type                 | Vehicle model/type from the catalog.                                 |
| Car type (other)         | Free-text car type when the catalog entry does not apply.            |
| Purchased car            | Whether the vehicle was purchased (as opposed to other acquisition). |
| Purchase price           | Purchase price of the vehicle.                                       |
| Car value                | Estimated current value of the vehicle (proposed by admin).          |
| Counter proposal         | Owner's proposed alternative car value.                              |
| Counter message          | Optional explanation for the counter proposal.                       |
| Car value status         | Progress of the car value negotiation subprocess.                    |
| Insurer                  | Current insurance company for the vehicle.                           |
| Insurer contract started | Date when the insurance contract started.                            |
| Insurer status           | Progress of the insurer subprocess.                                  |
| Depreciation per km      | Estimated depreciation cost per driven kilometre.                    |
| New car                  | Whether the vehicle is new.                                          |
| Mileage                  | Current mileage (odometer reading).                                  |
| First registered         | Date of first registration.                                          |
| Seats                    | Number of seats.                                                     |
| Van                      | Whether the vehicle is classified as a van.                          |
| Owner                    | Platform user who owns this onboarding record (optional for now).    |
| Owner Play connector     | Whether the owner has a Play connector account linked (Yes/No).      |
| Info session date        | Scheduled date of the enrolled info session.                         |
| Info session PC id       | Play connector identifier for the enrolled info session.             |
| Info session status      | Progress of the info session subprocess.                             |
| Simulation               | Linked simulation run, if any.                                       |
| Preparation status       | Tracks preparation progress: Open, Ready, or Locked.                 |
