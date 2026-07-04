# Decisions

## Product decisions

### Why these five pages, and not more

Dashboard, My Onboarding Journey, People, Resources, and HR Dashboard map
directly onto the four questions the brief asked the app to answer ("what
should I do today", "why does it matter", "who can help me", "what if I'm
blocked"), plus the one thing HR needs that a new employee doesn't: visibility
across everyone at once. Every page earns its place by answering one of those
questions - there's no page that exists just because "apps usually have one."

### Why "I'm blocked" is the key feature

Meridian has 200 employees and one HR person. The single biggest risk in
onboarding at that ratio isn't that the plan is unclear - it's that someone
gets stuck and nobody notices for two weeks. A generic task checklist doesn't
solve that; a blocker that HR can see the moment it happens does. Every other
feature in the app (the dashboard, the Needs attention panel, the employee
detail view) exists partly to make this one feature visible and actionable.

### Why no full HR system

The brief asked for something that makes the *first month* less chaotic, not
a replacement for Meridian's actual HR software (payroll, contracts, benefits,
performance reviews). Building any of that would have diluted the one thing
this app is actually good at. Scope was deliberately kept to onboarding
visibility and unblocking - see WHAT_I_WOULD_DO_NEXT.md for what a "phase 2"
would look like instead of guessing at it here.

## Technical decisions

### Why Flask

Flask gives a small, explicit surface: routes are just functions, there's no
hidden magic in how a request becomes a response, and that maps well to a
project meant to be read and explained line by line at an interview. It was
also the framework I already knew well, which meant time went into the
actual features instead of learning a new framework under a deadline.

### Why React

Same reasoning as Flask, on the frontend: a small, well-understood tool
(function components + hooks) rather than reaching for something heavier.
TypeScript was added on top for one concrete reason - the frontend and
backend are two separate codebases talking over JSON, and TypeScript catches
a mismatched field name or wrong type at compile time instead of as a blank
screen at runtime.

### Why SQLite

Three demo employees and a handful of reference tables don't need a database
server. SQLite is a single file, needs no setup, and is trivial to reset
(delete the file, reseed) - exactly what a take-home project and its
evaluator both want. Flask-SQLAlchemy is written to make swapping to
Postgres later a config-line change, not a rewrite, if this ever needed to
scale past a demo.

### Why one onboarding-task-template table instead of hardcoding tasks

Early in planning, the risk was clear: if the demo seed data and the "Add
employee" plan generation each defined their own list of onboarding tasks,
the two would drift apart the first time either one changed. Introducing
`OnboardingTaskTemplate` as a single source of truth, read by both seeding and
plan generation, means the onboarding plan is defined exactly once. This
wasn't in the original assignment sketch - it's a deliberate addition once
that duplication risk became obvious.

### Why no real authentication

The assignment explicitly marks auth as optional, and building even a
minimal login system would have spent time on infrastructure the brief
doesn't ask an evaluator to judge. A "View as New Employee / View as HR"
switcher demonstrates every user-facing flow in the app without that cost,
and makes it faster for someone reviewing this project to see both
perspectives without creating and logging in as two separate accounts.

### Why no external integrations (Slack, Google Calendar, email)

Each of these is a real credential, a real API, and a real failure mode
(expired token, rate limit, wrong workspace) that has nothing to do with
whether the onboarding logic itself is any good. They're listed as the first
priority in WHAT_I_WOULD_DO_NEXT.md precisely because they're the natural
next step, not because they were forgotten.

## UX decisions

### Why the app starts with "what should I do today?"

A brand-new employee's very first moment of doubt is "what am I supposed to
be doing right now?" - not "show me the entire multi-week plan." The
Dashboard leads with today's priorities and only links out to the full
journey when someone wants to see everything. Front-loading the whole plan
would be more complete, but less useful in the first five seconds.

### Why every task includes "why this matters"

A checklist item like "join Slack channels" reads as busywork unless it comes
with a reason. Every onboarding task carries an explicit "why this matters"
field for exactly that reason - it's a small thing, but it's the difference
between a task list and something a new employee actually trusts.

### Why HR gets a "Needs attention" section instead of just a table

A plain table of all employees puts the burden of noticing problems on HR -
scanning every row, every day, hoping nothing's been missed. With one HR
person for 200 employees, that doesn't scale even at a handful of concurrent
new hires. "Needs attention" inverts that: the app decides what's worth
looking at (blocked, overdue, missing manager, missing buddy) and HR reviews
a short, prioritized list instead of doing the triage themselves.

### Why a "waypoint" progress indicator instead of a plain progress bar

The product is named Compass - the visual language leans into that instead
of defaulting to a generic percentage bar. The waypoint track shows *which
stage* someone is in (Before day 1 / Day 1 / First week / First month), which
is information a plain percentage can't communicate on its own: two employees
at "45% done" could be in completely different stages of their onboarding.
