# What I would do next

Prioritized as if this were moving from a take-home demo into an actual
product decision, not just a wishlist.

## Priority 1 - would matter within the first real month of use

**Real authentication / SSO.** The role switcher is fine for a demo where
everyone's poking around the same data, but a real deployment needs actual
accounts - almost certainly SSO through whatever identity provider Meridian
already uses, since IT is already issuing company email and accounts before
day one.

**Slack integration.** The single highest-leverage integration for this app:
post a message to HR's Slack (or a dedicated channel) the moment someone
reports a blocker, instead of relying on HR to open the dashboard. This turns
"Needs attention" from a pull-based list into a push-based alert, which
matters a lot with only one HR person watching.

**Google Calendar / Google Meet integration.** Tasks like "Meet your manager"
or "Have your first 1:1" currently just sit on a list with a due date. Real
value would come from creating the actual calendar event and Meet link
automatically when the plan is generated, instead of expecting the manager to
remember to schedule it.

**Notifications for blocked tasks.** Related to the Slack integration, but
broader: an employee whose task has been blocked for, say, three days with no
HR response should probably get a gentle nudge too, not just silently wait.

## Priority 2 - would matter as the company or the tool grows

**Department-specific onboarding templates.** Right now every new hire gets
the same 10 tasks. A Sales hire probably needs CRM access and shadowing a
call; an Engineering hire needs repository access and a dev environment.
The data model already supports this cleanly - `OnboardingTaskTemplate`
would just gain a `department` filter (nullable, so "applies to everyone"
templates keep working).

**A manager dashboard.** Right now managers only appear as contact info.
Once there are enough new hires that a manager has two or three people
onboarding simultaneously, they'd likely want their own lightweight view -
not the full HR dashboard, just "my direct reports' onboarding status."

**Feedback after first week and first month.** A short check-in form (a
scale-based question or two, plus free text) tied to the existing "first
1:1" and "first month check-in" tasks, so HR gets a signal beyond "did the
tasks get done" - whether onboarding actually felt good.

**Analytics for HR.** Once there's more than a handful of employees in the
system at once, HR would benefit from trends: average time-to-unblock, which
task most commonly gets blocked (a strong signal that a process, not a
person, is broken), which department has the slowest onboarding completion.

## Priority 3 - polish, not urgency

**Dark mode.** Straightforward given the app already uses CSS variables for
every color - would mostly be a second `:root` variable set behind a toggle.

**Mobile improvements.** The layout is responsive today (the sidebar
collapses to a horizontal bar under 800px), but it hasn't been tuned for
actually completing tasks comfortably on a phone.

**Search and filters.** Fine to skip with three demo employees; would become
necessary once HR is managing dozens of people onboarding across different
departments and start dates.

**More customization.** Letting HR edit the onboarding templates themselves
through the UI, instead of them living only in seed data / a future admin
route - reasonable once the template system has proven itself with real use.
