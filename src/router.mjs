const URGENT_PATTERNS = [
  /action required/i,
  /before the deadline/i,
  /cannot verify/i,
  /please add/i,
  /tax/i,
  /w-9/i,
  /claim/i,
  /winner/i,
  /finalist/i,
  /infeasible/i,
  /failed/i,
  /exception/i
];

const WATCH_PATTERNS = [
  /newsletter/i,
  /new hackathons/i,
  /gallery is now open/i,
  /winners announced/i,
  /deadline/i,
  /prizes?/i
];

const WAITING_PATTERNS = [
  /waiting/i,
  /received/i,
  /successfully received/i,
  /queue/i,
  /next acceptable submission time/i
];

const STOPLINE_PATTERNS = [
  /payment records/i,
  /billing payment/i,
  /account recovery/i,
  /human approval/i,
  /paid/i,
  /terms/i
];

/**
 * @typedef {Object} OpsSignalEvent
 * @property {string} [id]
 * @property {string} [source]
 * @property {string} [sender]
 * @property {string} [subject]
 * @property {string} [body]
 */

/**
 * @typedef {Object} OpsRoute
 * @property {string} tier
 * @property {number} score
 * @property {string} deadline
 * @property {string} nextAction
 * @property {string[]} reasons
 */

/**
 * @param {OpsSignalEvent} event
 */
export function routeOpsSignal(event) {
  const text = `${event.source || ""} ${event.sender || ""} ${event.subject || ""} ${event.body || ""}`;
  const reasons = [];
  let score = 0;

  for (const pattern of URGENT_PATTERNS) {
    if (pattern.test(text)) {
      score += 3;
      reasons.push(`urgent:${pattern.source}`);
    }
  }

  for (const pattern of WATCH_PATTERNS) {
    if (pattern.test(text)) {
      score += 1;
      reasons.push(`watch:${pattern.source}`);
    }
  }

  for (const pattern of WAITING_PATTERNS) {
    if (pattern.test(text)) {
      score += 1;
      reasons.push(`waiting:${pattern.source}`);
    }
  }

  const hasStopline = STOPLINE_PATTERNS.some((pattern) => pattern.test(text));
  if (hasStopline) {
    score += 4;
    reasons.push("stopline:human_or_policy_boundary");
  }

  const deadline = extractDeadline(text);
  if (deadline) {
    score += 2;
    reasons.push(`deadline:${deadline}`);
  }

  const tier = classifyTier({ score, hasStopline, text });
  const nextAction = selectNextAction(tier, text);

  return {
    id: event.id,
    tier,
    score,
    confidence: Math.min(0.98, 0.55 + score * 0.07),
    deadline,
    nextAction,
    reasonTrail: reasons,
    slackCard: toSlackCard(event, { tier, score, deadline, nextAction, reasons })
  };
}

/**
 * @param {OpsSignalEvent[]} events
 */
export function routeBatch(events) {
  return events.map((event) => ({
    event,
    route: routeOpsSignal(event)
  })).sort((a, b) => b.route.score - a.route.score);
}

/**
 * @param {{ score: number, hasStopline: boolean, text: string }} input
 */
function classifyTier({ score, hasStopline, text }) {
  if (hasStopline) return "STOPLINE";
  if (/official evaluation returned|feasible solution found|p1-p6 feasible/i.test(text)) return "ACT_NOW";
  if (/winner|finalist|w-9|tax|claim|cannot verify|please add/i.test(text)) return "ACT_NOW";
  if (/newsletter|new hackathons/i.test(text)) return "WATCH";
  if (/successfully received|queue|waiting|winners announced/i.test(text)) return "WAITING";
  if (score >= 3) return "ACT_NOW";
  if (score >= 1) return "WATCH";
  return "HANDLED";
}

/**
 * @param {string} tier
 * @param {string} text
 */
function selectNextAction(tier, text) {
  if (tier === "STOPLINE") return "Escalate with context and do not send external replies automatically.";
  if (/official evaluation returned|feasible solution found|p1-p6 feasible/i.test(text)) return "Record the official result, preserve objectives and hashes, then decide whether another safe improvement exists.";
  if (/tax|w-9|claim/i.test(text)) return "Open prize paperwork checklist and preserve the sender, deadline, and claim link.";
  if (/cannot verify|please add|demo video|environment url/i.test(text)) return "Fix submission proof, read back the public page, then reply with exact evidence.";
  if (/successfully received|queue/i.test(text)) return "Wait for official evaluation and poll the same thread.";
  if (tier === "WATCH") return "Add to Hackathon/Watch and schedule a deadline/result check.";
  return "Archive as handled after evidence readback.";
}

/**
 * @param {string} text
 */
function extractDeadline(text) {
  const patterns = [
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:,\s+\d{4})?(?:\s+@\s+[\d:apm\s]+[A-Z]{2,3})?/i,
    /\b20\d{2}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?(?:\s+[A-Z]{2,4})?/,
    /\b\d{1,2}\s+business\s+days\b/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return "";
}

/**
 * @param {OpsSignalEvent} event
 * @param {OpsRoute} route
 */
function toSlackCard(event, route) {
  const headline = `[${route.tier}] ${event.subject}`;
  const reasonText = route.reasons.length ? route.reasons.slice(0, 4).join(" | ") : "no escalation signal";
  const fields = [
    { type: "mrkdwn", text: `*Source*\n${event.source || "Unknown"}` },
    { type: "mrkdwn", text: `*Sender*\n${event.sender || "Unknown"}` },
    { type: "mrkdwn", text: `*Score*\n${route.score}` },
    { type: "mrkdwn", text: `*Deadline*\n${route.deadline || "None detected"}` }
  ];

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: headline.slice(0, 150)
        }
      },
      {
        type: "section",
        fields
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Next action*\n${route.nextAction}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Audit: ${reasonText}`
          }
        ]
      }
    ]
  };
}
