# Ops Signal Router

Slack Agent Builder Challenge candidate for the New Slack Agent track.

Ops Signal Router turns scattered operational messages into Slack-native action cards. It is for solo founders and small teams who miss important deadlines because Gmail, Devpost, support tickets, GitHub, and Slack updates arrive in separate places.

## User

Small operators who ship with AI and then have to manage contest deadlines, support requests, billing follow-ups, security alerts, and submission readbacks without an operations team.

## Problem

High-value messages are mixed with newsletters and low-value notifications. Generic bots notify everything, so the user still has to inspect every thread manually. The real job is not notification; it is deciding whether a message requires action, evidence, waiting, or escalation.

## AI Use

The agent extracts:

- who sent the message
- what changed
- whether a deadline or stopline exists
- which evidence link should be kept
- what Slack action should be shown next

It then renders a Slack Block Kit style action card with an audit reason so the user can see why the agent escalated the message.

## Slack Fit

The build targets the New Slack Agent track and uses Slack Agent Builder surfaces inside a developer sandbox:

- Slack `assistant_view` entrypoint
- Slack Bolt event handling for mentions, DMs, and assistant threads
- MCP-enabled agent path when a Slack user token is available
- Slack-native action cards

The product does not claim Slack Marketplace submission yet. The Organizations track is intentionally deferred because it requires Marketplace submission and multiple active workspaces.

## Run

```bash
npm run demo
npm run verify
```

Open `site/index.html` for the judge-facing local demo.

Public demo target after GitHub Pages is enabled:

```text
https://daideguchi.github.io/ops-signal-router/site/
```

Slack app package:

```bash
cd agent
npm test
npm run check
```

Architecture diagram:

```text
submission/architecture-diagram.png
```

## Claim Boundary

- The current build includes the routing core, judge demo, and Slack developer sandbox app.
- Reviewer access is handled through sandbox invitations, not public workspace access.
- No private Gmail or Slack contents are included; sample events are synthetic but based on realistic operations workflows.
- No paid Slack resources are required for this build.
