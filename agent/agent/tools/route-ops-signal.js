import { tool } from '@openai/agents';
import { z } from 'zod';

import { routeOpsSignal } from '../../../src/router.mjs';

export const routeOpsSignalTool = tool({
  name: 'route_ops_signal',
  description:
    'Classify an operations signal into ACT_NOW, WATCH, WAITING, STOPLINE, or HANDLED and return a Slack-ready action card with an audit trail.',
  parameters: z.object({
    source: z.string().describe('Where the signal came from, such as Gmail, Devpost, Slack, or an evaluation service.'),
    sender: z.string().describe('Sender or system name.'),
    subject: z.string().describe('Short subject line or message title.'),
    body: z.string().describe('The relevant message body or concise event summary.'),
  }),
  execute: async (event) => {
    const routed = routeOpsSignal({
      id: `slack-agent-${Date.now()}`,
      ...event,
    });

    return JSON.stringify({
      tier: routed.tier,
      score: routed.score,
      confidence: routed.confidence,
      deadline: routed.deadline || null,
      nextAction: routed.nextAction,
      reasonTrail: routed.reasonTrail,
      slackCard: routed.slackCard,
    });
  },
});
