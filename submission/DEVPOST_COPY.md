# Devpost Copy

## Project Name

```text
Ops Signal Router
```

## Elevator Pitch

```text
Slack agent that routes scattered ops messages into auditable action cards before deadlines slip.
```

## Video

```text
https://youtu.be/U4vhNWddyMQ
```

## Repository

```text
https://github.com/daideguchi/ops-signal-router
```

## Public Demo

```text
https://daideguchi.github.io/ops-signal-router/site/
```

## Devpost Submission

```text
https://devpost.com/software/ops-signal-router
```

Status readback:

```text
SUBMITTED / 5/5 steps done
```

## Slack Developer Sandbox URL

```text
https://ops-signal-router26.enterprise.slack.com/
```

## Architecture Diagram

```text
submission/architecture-diagram.png
```

## Description

Ops Signal Router is a Slack-native operations triage agent for solo founders and small teams who ship deadline-heavy work across many tools.

The user problem is practical: prize paperwork, Devpost organizer messages, official evaluation receipts, support replies, account recovery notices, and cloud/billing warnings arrive in separate places. A normal notification bot only adds more noise. The operator needs a Slack card that says what changed, whether a deadline or stopline exists, what to do next, and which evidence trail explains the escalation.

The project uses Slack Agent Builder surfaces inside a developer sandbox. The app exposes an `assistant_view`, handles Slack mentions, DMs, and assistant threads with Bolt, and returns Slack action cards. The OpenAI Agents SDK wraps the shared `route_ops_signal` tool. Slack MCP is enabled and the agent connects to Slack MCP when a Slack user token is available; a deterministic local routing path keeps the demo reliable for clear classify/triage requests.

The routing core classifies messages into `ACT_NOW`, `WATCH`, `WAITING`, `STOPLINE`, or `HANDLED`, extracts deadlines, detects stoplines such as payment/account recovery/terms/external-send risk, scores urgency, and emits a reason trail. The public demo uses synthetic or redacted operational messages only.

Reviewer access has been prepared through the Slack developer sandbox. The required reviewer accounts were invited as members/coworkers, and the video demonstrates the current proof package: public demo, Slack action-card behavior, architecture, safety boundary, and verification results.

## Built With

```text
Slack Agent Builder
Slack Bolt
Slack Assistant View
Slack MCP
OpenAI Agents SDK
JavaScript
Node.js
GitHub Pages
```

## Safety Boundary

```text
No private Gmail, Slack, billing, account recovery, or prize-payout content is committed to the public repo or used in the public video. Risky actions route to STOPLINE for human approval instead of automatic handling.
```
