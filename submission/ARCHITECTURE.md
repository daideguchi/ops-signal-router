# Architecture

```text
Incoming operations message
  |
  v
Normalizer
  - source
  - sender
  - subject
  - body
  - received time
  - links
  |
  v
Routing Core
  - classify urgency
  - extract deadline
  - detect stoplines
  - compute confidence
  - keep reason trail
  |
  v
Slack Agent Surface
  - action card
  - reason summary
  - evidence link
  - next action buttons
  |
  v
Operator Decision
  - handle now
  - mark waiting
  - archive/watch
  - request human approval
```

## Challenge Technology Mapping

Planned primary integration: MCP server integration.

The routing core exposes a clean function that can be wrapped as an MCP tool:

```text
routeOpsSignal(event) -> Slack action card payload
```

The Slack agent can call that tool when a message is forwarded, mentioned, or found through Slack search.

## Data Safety

The public demo uses synthetic messages only. Real Gmail or Slack message content must be redacted before any screenshot or demo video is used in a public submission.
