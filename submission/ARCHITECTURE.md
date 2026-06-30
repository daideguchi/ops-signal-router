# Architecture

## System Flow

```text
Slack mention / DM
Devpost or Gmail excerpt
Official receipt / evaluation result
        |
        v
Slack App Surface
  - Bolt event listeners
  - assistant_view
  - Socket Mode
        |
        v
Agent Orchestrator
  - OpenAI Agents SDK
  - route_ops_signal tool
  - Slack MCP server when a user token is available
        |
        v
Routing Core
  - classify tier: ACT_NOW / WATCH / WAITING / STOPLINE / HANDLED
  - extract deadline
  - detect payment, account, terms, and external-send stoplines
  - compute score and reason trail
        |
        v
Slack Action Card
  - tier headline
  - deadline
  - next action
  - audit trail
        |
        v
Human Operator
  - act now
  - mark waiting
  - keep watch
  - stop for approval
  - archive handled evidence
```

## Challenge Technology Mapping

Ops Signal Router uses Slack Agent Builder surfaces and a Slack app installed in a developer sandbox:

- `assistant_view` provides the Slack-native agent entrypoint.
- Slack Bolt event listeners handle mentions, DMs, and assistant thread events.
- The OpenAI Agents SDK wraps the routing core as the `route_ops_signal` tool.
- The app is configured with Slack MCP enabled and the agent connects to `https://mcp.slack.com/mcp` when a Slack user token is available.
- A deterministic local routing path is included for demo reliability and for cases where LLM or MCP credentials are unavailable.

## Data Safety

The public demo and demo video must use synthetic or redacted messages only. Real Gmail, Slack, account recovery, billing, and prize-payout content is not committed to the public repo.

Stopline behavior is part of the product: account recovery, payment, external send, terms, or human-approval messages are routed to `STOPLINE` instead of being automatically handled.

## Diagram Asset

Devpost gallery/upload asset:

- `submission/architecture-diagram.png`

Source asset:

- `submission/architecture-diagram.svg`
