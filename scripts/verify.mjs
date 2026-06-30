import { readFile, stat } from "node:fs/promises";
import { routeBatch, routeOpsSignal } from "../src/router.mjs";

const events = JSON.parse(await readFile(new URL("../data/sample_events.json", import.meta.url), "utf8"));
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const siteHtml = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
const architecturePng = await stat(new URL("../submission/architecture-diagram.png", import.meta.url));
const routed = routeBatch(events);

assert(events.length >= 5, "expected at least five sample events");
assert(readme.includes("https://daideguchi.github.io/ops-signal-router/site/"), "README must name the public demo target");
assert(indexHtml.includes("./site/"), "root index must redirect to the site demo");
assert(siteHtml.includes("Ops Signal Router"), "site page must render the product name");
assert(architecturePng.size > 100000, "architecture diagram PNG must be present and non-trivial");
assert(routed[0].route.tier === "ACT_NOW" || routed[0].route.tier === "STOPLINE", "top event must require action or stopline handling");

const prize = events.find((event) => event.id === "evt-winner-paperwork");
assert(routeOpsSignal(prize).tier === "ACT_NOW", "winner paperwork must be ACT_NOW");

const support = events.find((event) => event.id === "evt-support-misroute");
assert(routeOpsSignal(support).tier === "STOPLINE", "account/payment misroute must be STOPLINE");

const newsletter = events.find((event) => event.id === "evt-newsletter");
assert(routeOpsSignal(newsletter).tier === "WATCH", "newsletter should be WATCH");

for (const item of routed) {
  assert(item.route.slackCard.blocks.length >= 4, `missing Slack card blocks for ${item.event.id}`);
  assert(item.route.nextAction.length > 12, `missing next action for ${item.event.id}`);
}

console.log("ops_signal_router_verify_ok", JSON.stringify({
  events: events.length,
  topTier: routed[0].route.tier,
  topSubject: routed[0].event.subject
}));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
