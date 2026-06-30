import { readFile } from "node:fs/promises";
import { routeBatch } from "../src/router.mjs";

const events = JSON.parse(await readFile(new URL("../data/sample_events.json", import.meta.url), "utf8"));
const routed = routeBatch(events);

for (const item of routed) {
  console.log(`${item.route.tier.padEnd(8)} score=${String(item.route.score).padStart(2)} ${item.event.subject}`);
  console.log(`  next: ${item.route.nextAction}`);
  console.log(`  audit: ${item.route.reasonTrail.join(", ") || "none"}`);
}
