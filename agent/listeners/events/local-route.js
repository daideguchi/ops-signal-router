import { routeOpsSignal } from '../../../src/router.mjs';

const ROUTE_INTENT = /\b(classify|triage|route|signal|deadline|submission|evaluation|devpost|gmail|billing|account|stopline)\b/i;

/**
 * @param {string} text
 */
export function shouldRouteLocally(text) {
  return ROUTE_INTENT.test(text);
}

/**
 * @param {string} text
 */
export function buildLocalRoute(text) {
  const route = routeOpsSignal({
    id: `slack-local-${Date.now()}`,
    source: 'Slack',
    sender: 'Slack user',
    subject: extractSubject(text),
    body: text,
  });

  return {
    route,
    text: `[${route.tier}] ${route.nextAction}`,
    blocks: route.slackCard.blocks,
  };
}

/**
 * @param {string} text
 */
function extractSubject(text) {
  const cleaned = text.replace(/^classify this signal:\s*/i, '').trim();
  return cleaned.split(/[.!?]/)[0].slice(0, 120) || 'Slack signal';
}
