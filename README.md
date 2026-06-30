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

The public build targets the New Slack Agent track and is designed to plug into Slack through at least one of the challenge technologies:

- MCP server integration for the routing tool
- Slack-native action cards
- optional Real-Time Search API integration after sandbox setup

The product does not claim Slack Marketplace submission yet. The Organizations track is intentionally deferred because it requires Marketplace submission and multiple active workspaces.

## Run

```bash
npm run demo
npm run verify
```

Open `site/index.html` for the judge-facing local demo.

## Claim Boundary

- The current build is the routing core and judge demo.
- Real Slack developer sandbox installation is the next integration step.
- No private Gmail or Slack contents are included; sample events are synthetic but based on realistic operations workflows.
- No paid Slack resources are required for this local build.
