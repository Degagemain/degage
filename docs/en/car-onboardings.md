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

Admins manage preparation in the admin zone under **Onboardings** (list and tabbed detail: owner, user info, car info, insurer, road assistance
plan, car value, share start date, finalize).

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
car flag, new car flag, purchase price, depreciation per km, registration certificate scans (front and back), inspection certificate, and pink
form.

| Property                       | Description                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| Brand                          | Vehicle brand.                                                          |
| Fuel type                      | Fuel or powertrain type.                                                |
| Car type                       | Catalog car type, or free-text other if not in catalog.                 |
| Mileage                        | Odometer reading in km.                                                 |
| Seats                          | Number of seats.                                                        |
| First registered               | Date of first registration.                                             |
| Van                            | Whether the vehicle is a van.                                           |
| Purchased car                  | Whether the vehicle was purchased (set at creation).                    |
| New car                        | Whether the vehicle is new (set at creation).                           |
| Purchase price                 | Purchase price.                                                         |
| Registration certificate front | Scan or photo of the front of the registration document.                |
| Registration certificate back  | Scan or photo of the back of the registration document.                 |
| Inspection certificate         | Valid vehicle inspection report (required for cars older than 4 years). |
| Pink form                      | Vehicle transfer form (pink form) for purchased used cars.              |

Uploaded document images are checked automatically before they are saved. If a photo is unclear or does not match the expected document type,
the upload is rejected and the user is asked to upload a clear photo. The registration certificate front can also prefill VIN, licence plate,
and first registration date when those fields are still empty.

This step is complete when brand, fuel type, and car type are all set, and all required documents for the car situation are uploaded:
registration certificate front and back when the car was not purchased; inspection certificate additionally when the car is older than four
years; pink form when the car was purchased and is not new; no documents when the car was purchased and is new.

### Insurer

Records whether the car already has an insurance contract and, when applicable, the current insurance company and contract start date.

| Property                        | Description                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Has insurance contract          | Whether the owner already has an insurance contract for this car.                                        |
| Insurer                         | Current insurance company (shown when has insurance contract is enabled).                                |
| Insurer contract start          | Date the current insurance contract started (when has insurance contract is enabled).                    |
| Insurer announced rate increase | Whether the insurer announced a premium increase (shown when the contract started within the last year). |

| Status         | Meaning                                                                                |
| -------------- | -------------------------------------------------------------------------------------- |
| Not applicable | The car has no existing insurance contract to record; insurer fields are not required. |
| Todo           | Has insurance contract is enabled; insurer details can be filled in later.             |
| Ready          | Has insurance contract is enabled and insurer details are filled in.                   |

The system sets insurer status automatically on save. When **Has insurance contract** is off, status becomes **Not applicable** and insurer
fields are cleared.

The owner can update insurer details via a partial update while status is **Todo**. Insurer details are not required in the same submission as
the has insurance contract flag.

This step is complete when insurer status is not **Todo**.

### Road assistance plan

Records whether the car already has road assistance coverage and which plan the owner wants with Dégage.

| Property                               | Description                                                                                                           |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Has existing road assistance plan      | Whether the car already has road assistance coverage (for new purchased cars, this may be included with the vehicle). |
| Existing road assistance plan end date | End date of the current road assistance plan (when has existing road assistance plan is enabled).                     |
| Road assistance plan                   | Desired road assistance plan from the catalog.                                                                        |

| Status | Meaning                                                                          |
| ------ | -------------------------------------------------------------------------------- |
| Todo   | Required fields are missing (desired plan and/or existing plan end date).        |
| Ready  | Desired plan is selected and existing plan details are complete when applicable. |

The system sets road assistance plan status automatically on save. When **Has existing road assistance plan** is off, the end date is cleared.

The owner can update road assistance plan details via a partial update while status is **Todo**.

This step is complete when road assistance plan status is not **Todo**.

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

### Car stickers

The owner can choose extra sticker designs from the catalog during the public onboarding flow. Extra stickers are optional. Always-included
stickers are shown as pre-selected and cannot be removed; they are not stored on the onboarding record.

| Property     | Description                                            |
| ------------ | ------------------------------------------------------ |
| Car stickers | Extra sticker designs selected by the owner and saved. |

This step is always complete; extra stickers are optional.

### Share start date

Chooses when the car becomes available for sharing. This is the last preparation step. The date is always the first of a month. The earliest
allowed month depends on the insurance details (or the first of the current month when there is no existing insurance contract). The latest
allowed month is 18 months from today.

| Property         | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| Share start date | First day of the month when car sharing is planned to start. |

This step unlocks only after the insurer step is complete. Changing insurance details that affect the earliest date clears the chosen share
start date so the owner must pick again.

This step is complete when a share start date is set.

### Finalize

When play connector, info session, user info, car info, insurer, road assistance plan, car value, car stickers, and share start date are all
complete, the system sets preparation status to **Ready** automatically on save. An admin can then start the car onboarding on the **Finalize**
tab.

| Status | Meaning                                                                                                                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open   | Onboarding is in progress; car-info, user-info, insurer, and car value negotiation are not all complete yet.                                                                                 |
| Ready  | Play connector, info session (Done), car-info, user-info, insurer (not Todo), car value (Resolved), car stickers, and share start date are all complete. The system sets this automatically. |
| Locked | No further user updates are allowed. Admins can still change the full record. Set by an admin on the **Finalize** tab when preparation is **Ready**.                                         |

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
