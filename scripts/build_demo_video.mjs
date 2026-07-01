import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "submission", "demo-video-build");
const THUMBNAIL_SVG = path.join(ROOT, "submission", "youtube-thumbnail.svg");
const THUMBNAIL_PNG = path.join(ROOT, "submission", "youtube-thumbnail.png");
const VIDEO = path.join(OUT, "ops-signal-router-demo.mp4");
const PUBLIC_DEMO = path.join(ROOT, "evidence", "2026-06-30_ops_signal_router_public_pages.png");
const ARCHITECTURE = path.join(ROOT, "submission", "architecture-diagram.png");
const SLACK_THREAD = path.join(ROOT, "submission", "slack-thread-action-card.png");

const slides = [
  {
    key: "slack-device",
    title: "Slack Device Proof",
    kicker: "The project functioning inside Slack",
    image: SLACK_THREAD,
    bullets: [
      "A Slack user mentions the Ops Signal Router app in #general.",
      "The app replies in the Slack thread with an action card.",
      "The card shows route tier, source, score, deadline, next action, and audit trail."
    ],
    narration:
      "This updated demo opens on the device the project was built for: Slack. A user mentions the Ops Signal Router app inside a Slack channel, and the app replies in the thread with a Slack action card. This is the core functioning surface, not just a slide explanation."
  },
  {
    key: "slack-output",
    title: "Slack Output",
    kicker: "Triage result inside the thread",
    image: SLACK_THREAD,
    bullets: [
      "The incoming message names a Devpost deadline and missing proof.",
      "The agent classifies it as WATCH with a deadline of July 13.",
      "The next action tells the operator to fix submission proof and read back the page."
    ],
    narration:
      "The thread shows the product behavior judges need to see. The input is a deadline-heavy operational signal. The app returns the route tier, source, sender, score, deadline, and next action directly inside Slack, where the operator is already working."
  },
  {
    key: "demo",
    title: "Routing Core",
    kicker: "Synthetic queue, real routing logic",
    image: PUBLIC_DEMO,
    bullets: [
      "ACT_NOW for prize and submission deadlines.",
      "WATCH for new opportunities or result checks.",
      "STOPLINE for account, payment, terms, or approval boundaries."
    ],
    narration:
      "The public demo uses safe synthetic examples to show the same routing core at a larger scale. It separates act-now items from watch items and stoplines. Each card has a tier, score, deadline, next action, and audit reason trail."
  },
  {
    key: "ai",
    title: "How AI Is Used",
    kicker: "Agent plus deterministic routing guardrail",
    bullets: [
      "OpenAI Agents SDK wraps the shared route ops signal tool.",
      "Slack MCP is enabled when a Slack user token is available.",
      "A deterministic local route path keeps the demo reliable if external model credentials are unavailable."
    ],
    narration:
      "The AI role is operational judgment with traceability. The OpenAI Agents SDK wraps the shared route ops signal tool, and the app can connect to Slack MCP when a user token is available. For demo reliability, deterministic routing handles clear classify and triage requests."
  },
  {
    key: "architecture",
    title: "Architecture",
    kicker: "From incoming signal to human decision",
    image: ARCHITECTURE,
    bullets: [
      "Inputs flow through Slack app events into the agent layer.",
      "The routing core classifies tier, deadline, score, and stoplines.",
      "The output is a Slack action card for a human operator."
    ],
    narration:
      "The architecture is intentionally small. Incoming signals enter through Slack app events, then the agent calls the routing core. The core classifies tier, extracts deadlines, detects stoplines, computes score, and returns a Slack action card for human decision."
  },
  {
    key: "safety",
    title: "Safety Boundary",
    kicker: "No unsafe automation",
    bullets: [
      "Public demo content is synthetic or redacted.",
      "Secrets, local credentials, and Slack app cache files are excluded from the public repo.",
      "External send, account recovery, payment, and terms issues route to STOPLINE."
    ],
    narration:
      "The safety boundary is part of the product. Public demo content is synthetic or redacted, and secrets are excluded from the public repository. Payment, account recovery, terms, or external send issues route to stopline instead of automatic handling."
  },
  {
    key: "proof",
    title: "Submission Proof",
    kicker: "Current proof package",
    bullets: [
      "Slack sandbox app was installed and reviewer accounts were invited.",
      "Public repo includes the Slack app, tests, architecture diagram, and README.",
      "Root verify passes; agent tests pass 17/17; type check and dependency audit pass."
    ],
    narration:
      "The proof package is ready for judges. The Slack sandbox app was installed, reviewer accounts were invited, and the public repo includes the Slack app, tests, architecture diagram, and README. Root verify passes, the agent test suite passes seventeen out of seventeen, type checking passes, and dependency audit reports zero vulnerabilities."
  }
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (let index = 0; index < slides.length; index += 1) {
  const slide = slides[index];
  const svgPath = path.join(OUT, `${String(index + 1).padStart(2, "0")}-${slide.key}.svg`);
  const pngPath = path.join(OUT, `${String(index + 1).padStart(2, "0")}-${slide.key}.png`);
  await writeFile(svgPath, await renderSlide(slide), "utf8");
  await run("rsvg-convert", ["-w", "1920", "-h", "1080", svgPath, "-o", pngPath]);
}

await writeFile(THUMBNAIL_SVG, renderThumbnail(), "utf8");
await run("rsvg-convert", ["-w", "1280", "-h", "720", THUMBNAIL_SVG, "-o", THUMBNAIL_PNG]);

const segmentPaths = [];
for (let index = 0; index < slides.length; index += 1) {
  const slideNo = String(index + 1).padStart(2, "0");
  const audioAiff = path.join(OUT, `${slideNo}-${slides[index].key}.aiff`);
  const audioWav = path.join(OUT, `${slideNo}-${slides[index].key}.wav`);
  const pngPath = path.join(OUT, `${slideNo}-${slides[index].key}.png`);
  const segmentPath = path.join(OUT, `${slideNo}-${slides[index].key}.mp4`);
  await run("say", ["-v", "Samantha", "-o", audioAiff, slides[index].narration]);
  await run("ffmpeg", ["-y", "-i", audioAiff, "-ar", "48000", "-ac", "2", audioWav]);
  await run("ffmpeg", [
    "-y",
    "-loop",
    "1",
    "-i",
    pngPath,
    "-i",
    audioWav,
    "-vf",
    "format=yuv420p",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-tune",
    "stillimage",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-shortest",
    segmentPath
  ]);
  segmentPaths.push(segmentPath);
}

const concatFile = path.join(OUT, "concat.txt");
await writeFile(concatFile, segmentPaths.map((segment) => `file '${segment.replaceAll("'", "'\\''")}'`).join("\n") + "\n");
await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatFile, "-c", "copy", VIDEO]);

const duration = await ffprobeDuration(VIDEO);
console.log(JSON.stringify({ ok: true, video: VIDEO, thumbnail: THUMBNAIL_PNG, duration_seconds: duration }, null, 2));

async function renderSlide(slide) {
  const image = slide.image ? await imageData(slide.image) : "";
  const bullets = renderBullets(slide.bullets);
  const media = slide.mockSlack
    ? renderMockSlack(880, 256)
    : image
      ? `<image href="${image}" x="830" y="190" width="950" height="760" preserveAspectRatio="xMidYMid meet" clip-path="url(#mediaClip)"/>`
      : renderActionCards(870, 245);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <clipPath id="mediaClip"><rect x="830" y="190" width="950" height="760" rx="20"/></clipPath>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.18"/></filter>
    <style>
      .bg { fill: #f8fafc; }
      .kicker { font: 700 24px Arial, Helvetica, sans-serif; fill: #516172; letter-spacing: 0; }
      .title { font: 800 70px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
      .bullet { font: 400 34px Arial, Helvetica, sans-serif; fill: #263445; letter-spacing: 0; }
      .label { font: 700 29px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
      .small { font: 400 25px Arial, Helvetica, sans-serif; fill: #334155; letter-spacing: 0; }
      .mono { font: 700 22px Menlo, Consolas, monospace; fill: #111827; letter-spacing: 0; }
      .monoLight { font: 700 22px Menlo, Consolas, monospace; fill: #ffffff; letter-spacing: 0; }
    </style>
  </defs>
  <rect class="bg" width="1920" height="1080"/>
  <rect x="66" y="64" width="1788" height="952" rx="28" fill="#ffffff" stroke="#dbe4ee" stroke-width="2" filter="url(#shadow)"/>
  <text class="kicker" x="102" y="136">${escapeXml(slide.kicker)}</text>
  <text class="title" x="102" y="226">${escapeXml(slide.title)}</text>
  <rect x="102" y="300" width="566" height="322" rx="18" fill="#f1f5f9" stroke="#d8e2ee" stroke-width="2"/>
  <text class="label" x="138" y="360">What the judge should notice</text>
  <text class="small" x="138" y="414">User: deadline-heavy solo operator</text>
  <text class="small" x="138" y="466">AI: triage, deadline extraction, stopline detection</text>
  <text class="small" x="138" y="518">Output: Slack action card with audit trail</text>
  <text class="small" x="138" y="570">Boundary: human approval for risky actions</text>
  ${bullets}
  ${media}
</svg>`;
}

function renderActionCards(x, y) {
  return `
  <g transform="translate(${x} ${y})">
    <rect width="840" height="495" rx="22" fill="#f8fafc" stroke="#d8e2ee" stroke-width="2"/>
    <text class="label" x="36" y="62">Slack Action Card Preview</text>
    <g transform="translate(36 104)">
      <rect width="768" height="92" rx="14" fill="#fff7ed" stroke="#fdba74" stroke-width="2"/>
      <rect x="24" y="25" width="126" height="42" rx="8" fill="#b91c1c"/>
      <text class="monoLight" x="44" y="53">ACT_NOW</text>
      <text class="small" x="178" y="42">Prize paperwork requires a response</text>
      <text class="small" x="178" y="73">Next: preserve sender, deadline, and claim link.</text>
    </g>
    <g transform="translate(36 226)">
      <rect width="768" height="92" rx="14" fill="#fefce8" stroke="#fde047" stroke-width="2"/>
      <rect x="24" y="25" width="112" height="42" rx="8" fill="#b45309"/>
      <text class="monoLight" x="45" y="53">WATCH</text>
      <text class="small" x="178" y="42">New hackathon opportunity</text>
      <text class="small" x="178" y="73">Next: label and schedule a result check.</text>
    </g>
    <g transform="translate(36 348)">
      <rect width="768" height="92" rx="14" fill="#faf5ff" stroke="#c4b5fd" stroke-width="2"/>
      <rect x="24" y="25" width="132" height="42" rx="8" fill="#6d28d9"/>
      <text class="monoLight" x="42" y="53">STOPLINE</text>
      <text class="small" x="178" y="42">Payment or account recovery issue</text>
      <text class="small" x="178" y="73">Next: stop and ask for human approval.</text>
    </g>
  </g>`;
}

function renderMockSlack(x, y) {
  return `
  <g transform="translate(${x} ${y})">
    <rect width="830" height="496" rx="22" fill="#2b1230" filter="url(#shadow)"/>
    <rect x="164" width="666" height="496" rx="0" fill="#f8fafc"/>
    <rect x="186" y="30" width="612" height="66" rx="12" fill="#ffffff" stroke="#dbe4ee"/>
    <text class="label" x="216" y="73"># general - Ops Signal Router</text>
    <text class="small" x="196" y="142">User: Classify this signal: Devpost final submission is due July 13...</text>
    <rect x="196" y="185" width="582" height="232" rx="16" fill="#ffffff" stroke="#dbe4ee"/>
    <text class="label" x="226" y="234">Ops Signal Router</text>
    <rect x="226" y="266" width="104" height="38" rx="8" fill="#b45309"/>
    <text class="monoLight" x="246" y="291">WATCH</text>
  <text class="small" x="226" y="340">Deadline: July 13</text>
    <text class="small" x="226" y="376">Next: finish demo video, sandbox URL, and proof readback.</text>
    <text class="small" x="226" y="456">Audit: deadline: July 13</text>
  </g>`;
}

function renderThumbnail() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.22"/></filter>
    <style>
      .title { font: 800 72px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
      .sub { font: 700 30px Arial, Helvetica, sans-serif; fill: #334155; letter-spacing: 0; }
      .small { font: 700 24px Arial, Helvetica, sans-serif; fill: #ffffff; letter-spacing: 0; }
    </style>
  </defs>
  <rect width="1280" height="720" fill="#f8fafc"/>
  <rect x="70" y="64" width="1140" height="592" rx="30" fill="#ffffff" stroke="#dbe4ee" stroke-width="2" filter="url(#shadow)"/>
  <text class="title" x="112" y="172">Slack Device Demo</text>
  <text class="sub" x="116" y="226">Ops Signal Router functioning inside Slack</text>
  <rect x="118" y="292" width="240" height="72" rx="16" fill="#b91c1c"/>
  <text class="small" x="172" y="338">ACT NOW</text>
  <rect x="394" y="292" width="210" height="72" rx="16" fill="#b45309"/>
  <text class="small" x="454" y="338">WATCH</text>
  <rect x="640" y="292" width="250" height="72" rx="16" fill="#6d28d9"/>
  <text class="small" x="686" y="338">STOPLINE</text>
  <rect x="118" y="424" width="1000" height="108" rx="18" fill="#f1f5f9" stroke="#cbd5e1"/>
  <text class="sub" x="154" y="490">Deadline + next action + audit trail inside Slack</text>
</svg>`;
}

function renderBullets(bullets) {
  let y = 700;
  const rendered = [];
  for (const bullet of bullets) {
    const lines = wrapWords(bullet, 42);
    rendered.push(`<text class="bullet" x="102" y="${y}">- ${escapeXml(lines[0])}</text>`);
    y += 42;
    for (const line of lines.slice(1)) {
      rendered.push(`<text class="bullet" x="130" y="${y}">${escapeXml(line)}</text>`);
      y += 42;
    }
    y += 16;
  }
  return rendered.join("\n");
}

function wrapWords(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function imageData(filePath) {
  const data = await readFile(filePath);
  return `data:image/png;base64,${data.toString("base64")}`;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: ROOT }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${command} failed: ${stderr || error.message}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function ffprobeDuration(filePath) {
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath
  ]);
  return Number(stdout.trim());
}
