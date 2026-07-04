# Assumptions

This document lists the assumptions made about how Meridian operates, since
the assignment deliberately left most of the company's internal process
undefined. Where the real answer could reasonably go either way, the choice
made and the reasoning behind it are noted.

## About the onboarding process

- **HR creates the employee profile before day one.** The "Add employee" form
  is something HR fills in ahead of the start date, not something that happens
  automatically from a hiring system. This matches Sofia Brown's scenario in
  the demo data: her profile exists, her plan is generated, but she hasn't
  started yet.
- **New employees already have basic access before day one.** Getting a laptop
  and company email set up is itself a task in the plan ("Set up laptop and
  accounts"), assigned to IT before the start date - the app assumes this
  happens through Meridian's normal IT process, not through this app.
- **Slack and Google Meet already exist and are already the company's tools.**
  Meridian Compass points people to them (e.g. "Join core Slack channels") but
  doesn't integrate with either. See DECISIONS.md for why.
- **The onboarding plan is the same shape for every department.** All new
  hires get the same 10 tasks (paperwork, laptop setup, meeting people, reading
  the handbook, a first real task, a check-in). A real company would likely
  want department-specific templates - flagged in WHAT_I_WOULD_DO_NEXT.md
  rather than built now, to keep the demo focused.
- **A manager or buddy might not be assigned yet, and that's a normal state,
  not an error.** The app is built to show this clearly (a "Not assigned yet"
  message, and a flag in HR's Needs attention list) rather than crash or hide
  the gap.
- **Once HR resolves a blocker, the task returns to "In progress," not
  "Completed."** Resolving the blocker means the obstacle is gone - it doesn't
  mean the work itself is done. The employee still needs to mark it complete.
- **A task can be both "resolved" (as a blocker) and "overdue" (as a task) at
  the same time.** These track two different things: whether HR has stepped in,
  and whether the due date has passed. A resolved blocker on a task with a
  past due date correctly still shows up as overdue - the confusion is gone,
  but the work is still late.

## About the people involved

- **The new employee uses a laptop**, not a phone, for anything work-related
  in their first weeks - the UI is responsive down to mobile widths, but it's
  designed and tested primarily for desktop use, matching how someone would
  actually do onboarding paperwork and read documentation.
- **Managers and buddies are not users of this app.** They only appear as
  contact information (name, email, Slack handle, what to ask them about).
  This was stated explicitly in the assignment brief and is reflected in the
  data model: `Person` (contact-only) and `Employee` (goes through onboarding)
  are separate, non-overlapping concepts.
- **HR is a single person for the whole company.** The app's contact-role
  resolution (`ContactRole.HR`) picks whichever `Person` is marked as type HR
  in the directory - if Meridian ever had two HR people, the app would need a
  way to choose between them, which isn't built.

## About missing or incomplete data

- **Missing information is expected, not exceptional.** A new employee can
  exist without a manager, without a buddy, or (in theory) without any tasks
  at all - if a template generation ever failed partway. The app shows a clear
  message in each of these cases rather than crashing, and HR's dashboard
  surfaces missing manager/buddy as their own attention categories.
- **The app does not replace Slack, Google Meet, or HR's actual systems**
  (payroll, contracts, benefits). It's a map of what to do and who to ask, not
  a system of record for any of those.
