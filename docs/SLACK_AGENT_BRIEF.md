# Slack Agent Builder Brief

## Official Fit

Challenge: Slack Agent Builder Challenge  
URL: https://slackhack.devpost.com/  
Deadline: 2026-07-13 17:00 PDT  
Prize pool: USD 42,000 cash  
Winners announced: 2026-08-11 14:00 PDT

Official requirements visible on the Devpost page:

- Use at least one of: Slack AI capabilities, MCP server integration, Real-Time Search API.
- Submit a text description of project features and functionality.
- Submit an approximately 3-minute demo video showing the working project.
- Submit an architecture diagram.
- Submit a Slack developer sandbox URL and grant access to the required judge accounts.

## Track Choice

Primary target: New Slack Agent.

Reason:

- It does not require Marketplace submission.
- It fits the current short timeline.
- The existing HQ Slack/Gmail/Devpost proof assets naturally support an operations-routing agent.

Deferred target: Slack Agent for Organizations.

Reason:

- The Organizations track requires Marketplace submission before the deadline.
- Marketplace apps in that track must be deployed in production and installed in 5 active workspaces.
- That is too heavy for a short-window prize sprint unless the sandbox setup proves unusually smooth.

## Product

Working name: Ops Signal Router.

One-sentence pitch:

Ops Signal Router is a Slack agent that turns scattered operational messages into auditable Slack action cards so a solo founder knows what must be handled now, what can wait, and what evidence was preserved.

## Who

Solo founders, small AI teams, and operator-builders who ship many projects and must keep track of contest deadlines, support cases, customer replies, payout forms, cloud notices, and submission receipts.

## Problem

Important operational messages arrive across Gmail, Devpost, GitHub, Slack, support portals, and calendars. Plain notifications create more noise. The user needs triage, action extraction, evidence preservation, and escalation in the place they already work.

## AI Role

The agent classifies incoming messages into operational states:

- Act now
- Waiting on external party
- Watch only
- Handled
- Stopline

It also extracts deadline, source, accountable party, evidence link, and next Slack action.

## Current Acceptance

- Deterministic local routing core passes tests.
- Browser demo shows realistic operations queue and Slack action-card preview.
- Public README explains user, problem, AI use, Slack fit, and claim boundary.
- Architecture diagram is present as `submission/architecture-diagram.png`.
- Slack Developer Program sandbox exists and the app is installed.
- Required reviewer accounts have been invited to the sandbox.
- Live Slack action-card proof has been captured.
- YouTube demo is uploaded on PETOPIA AI: `https://youtu.be/XtZnvCphRXg`.
- No private user data or secrets are in the public repo.

## Remaining Submission Work

1. Fill Devpost details, additional info, gallery, sandbox URL, repo, YouTube demo, and architecture diagram.
2. Final Submit only after the project page reads back coherently.
