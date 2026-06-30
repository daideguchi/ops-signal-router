const events = [
  {
    id: "evt-ogc-eval",
    source: "Gmail",
    sender: "submission@optichallenge.com",
    subject: "OGC 2026 Submission 2026-06-29 23:48:39",
    body: "Official evaluation returned. P1-P6 feasible. Next acceptable submission time is 2026-06-30 11:48 UTC. Keep the objectives and package hash in evidence.",
    receivedAt: "2026-06-30T09:14:00+09:00"
  },
  {
    id: "evt-devpost-message",
    source: "Devpost",
    sender: "organizer@example.com",
    subject: "New message for your submission",
    body: "Please add the working demo video and environment URL before the deadline. Judges cannot verify the submission without it.",
    receivedAt: "2026-06-30T10:05:00+09:00"
  },
  {
    id: "evt-newsletter",
    source: "Devpost",
    sender: "newsletter@devpost.com",
    subject: "New hackathons in AI and automation",
    body: "Slack Agent Builder Challenge has $42,000 in prizes and a July 13 deadline. Backblaze and Arm challenges are also open.",
    receivedAt: "2026-06-30T08:55:00+09:00"
  },
  {
    id: "evt-support-misroute",
    source: "Support",
    sender: "cloud-support@example.com",
    subject: "We need payment records",
    body: "The case appears to be about billing payment. Please send invoices. The real issue is account recovery for a disabled login path.",
    receivedAt: "2026-06-30T07:30:00+09:00"
  },
  {
    id: "evt-winner-paperwork",
    source: "Gmail",
    sender: "prizes@example.com",
    subject: "Action required: prize winner tax form",
    body: "Congratulations. Please complete the W-9 or tax paperwork within 10 business days to claim the prize.",
    receivedAt: "2026-06-30T12:30:00+09:00"
  }
];

const urgent = [/action required/i, /before the deadline/i, /cannot verify/i, /please add/i, /tax/i, /w-9/i, /claim/i, /winner/i, /finalist/i, /infeasible/i, /failed/i, /exception/i];
const watch = [/newsletter/i, /new hackathons/i, /gallery is now open/i, /winners announced/i, /deadline/i, /prizes?/i];
const waiting = [/waiting/i, /received/i, /successfully received/i, /queue/i, /next acceptable submission time/i];
const stopline = [/payment records/i, /billing payment/i, /account recovery/i, /human approval/i, /paid/i, /terms/i];

const routed = events.map((event) => ({ event, route: route(event) })).sort((a, b) => b.route.score - a.route.score);
let currentFilter = "ALL";
let currentId = routed[0].event.id;

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((node) => node.classList.toggle("is-active", node === button));
    renderList();
  });
});

renderSummary();
renderList();
renderDetail(routed[0]);

function route(event) {
  const text = `${event.source} ${event.sender} ${event.subject} ${event.body}`;
  const reasons = [];
  let score = 0;

  for (const pattern of urgent) if (pattern.test(text)) { score += 3; reasons.push(`urgent:${pattern.source}`); }
  for (const pattern of watch) if (pattern.test(text)) { score += 1; reasons.push(`watch:${pattern.source}`); }
  for (const pattern of waiting) if (pattern.test(text)) { score += 1; reasons.push(`waiting:${pattern.source}`); }

  const hasStopline = stopline.some((pattern) => pattern.test(text));
  if (hasStopline) { score += 4; reasons.push("stopline:human_or_policy_boundary"); }

  const deadline = extractDeadline(text);
  if (deadline) { score += 2; reasons.push(`deadline:${deadline}`); }

  const tier = classify(text, score, hasStopline);
  return {
    tier,
    score,
    deadline,
    reasons,
    nextAction: nextAction(tier, text)
  };
}

function classify(text, score, hasStopline) {
  if (hasStopline) return "STOPLINE";
  if (/official evaluation returned|feasible solution found|p1-p6 feasible/i.test(text)) return "ACT_NOW";
  if (/winner|finalist|w-9|tax|claim|cannot verify|please add/i.test(text)) return "ACT_NOW";
  if (/newsletter|new hackathons/i.test(text)) return "WATCH";
  if (/successfully received|queue|waiting|winners announced/i.test(text)) return "WAITING";
  if (score >= 3) return "ACT_NOW";
  if (score >= 1) return "WATCH";
  return "HANDLED";
}

function nextAction(tier, text) {
  if (tier === "STOPLINE") return "Escalate with context and do not send external replies automatically.";
  if (/official evaluation returned|feasible solution found|p1-p6 feasible/i.test(text)) return "Record the official result, preserve objectives and hashes, then decide whether another safe improvement exists.";
  if (/tax|w-9|claim/i.test(text)) return "Open prize paperwork checklist and preserve the sender, deadline, and claim link.";
  if (/cannot verify|please add|demo video|environment url/i.test(text)) return "Fix submission proof, read back the public page, then reply with exact evidence.";
  if (/successfully received|queue/i.test(text)) return "Wait for official evaluation and poll the same thread.";
  if (tier === "WATCH") return "Add to Hackathon/Watch and schedule a deadline/result check.";
  return "Archive as handled after evidence readback.";
}

function extractDeadline(text) {
  const patterns = [/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:,\s+\d{4})?(?:\s+@\s+[\d:apm\s]+[A-Z]{2,3})?/i, /\b20\d{2}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?(?:\s+[A-Z]{2,4})?/, /\b\d{1,2}\s+business\s+days\b/i];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return "";
}

function renderSummary() {
  document.getElementById("count-act").textContent = routed.filter((item) => item.route.tier === "ACT_NOW").length;
  document.getElementById("count-watch").textContent = routed.filter((item) => item.route.tier === "WATCH").length;
  document.getElementById("count-stop").textContent = routed.filter((item) => item.route.tier === "STOPLINE").length;
}

function renderList() {
  const list = document.getElementById("signal-list");
  list.innerHTML = "";
  const visible = currentFilter === "ALL" ? routed : routed.filter((item) => item.route.tier === currentFilter);
  for (const item of visible) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `signal-item ${item.event.id === currentId ? "is-active" : ""}`;
    button.innerHTML = `
      <span class="badge ${item.route.tier}">${item.route.tier}</span>
      <span class="signal-copy">
        <h3>${escapeHtml(item.event.subject)}</h3>
        <p>${escapeHtml(item.route.nextAction)}</p>
      </span>
      <span class="score">${item.route.score}</span>
    `;
    button.addEventListener("click", () => {
      currentId = item.event.id;
      renderList();
      renderDetail(item);
    });
    list.append(button);
  }
}

function renderDetail(item) {
  document.getElementById("detail-title").textContent = item.event.subject;
  const tier = document.getElementById("detail-tier");
  tier.textContent = item.route.tier;
  tier.className = `tier ${item.route.tier}`;
  document.getElementById("detail-action").textContent = item.route.nextAction;
  document.getElementById("detail-source").textContent = item.event.source;
  document.getElementById("detail-sender").textContent = item.event.sender;
  document.getElementById("detail-score").textContent = String(item.route.score);
  document.getElementById("detail-deadline").textContent = item.route.deadline || "None detected";
  document.getElementById("detail-audit").textContent = item.route.reasons.join("\n") || "No escalation signal.";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}
