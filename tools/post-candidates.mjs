#!/usr/bin/env node
/*
  Sends new candidates to the private review queue.

  node tools/post-candidates.mjs candidates.json

  Needs two environment values, which the workflow takes from repository secrets:
    REVIEW_REPO   owner/name of a private repository, for example SiteQ8/asli-review
    REVIEW_TOKEN  a token that can open issues there and nothing else

  Without them this exits quietly and the candidates stay on the runner, because
  an unreviewed name must never reach a public place. See watch/README.md.
*/
import { readFileSync } from "node:fs";
import { loadSeen, markDelivered, saveSeen } from "./ct-watch.mjs";

const repo = process.env.REVIEW_REPO;
const token = process.env.REVIEW_TOKEN;
const file = process.argv[2];

if (!file) {
  console.error("usage: node tools/post-candidates.mjs candidates.json");
  process.exit(2);
}
if (!repo || !token) {
  console.log("No private review queue configured, so nothing was sent.");
  process.exit(0);
}

const { candidates } = JSON.parse(readFileSync(file, "utf8"));
if (!candidates.length) {
  console.log("No new candidates.");
  process.exit(0);
}

function bodyFor(c) {
  return [
    `Score: **${c.score}** out of 100. Brand borrowed from \`${c.body}\`.`,
    "",
    "Why it was picked up:",
    ...c.reasons.map((r) => `- ${r}`),
    "",
    `First certificate: ${c.firstCertificate || "unknown"}`,
    `Issuer: ${c.issuer || "unknown"}`,
    c.crtId ? `Certificate transparency entry: https://crt.sh/?id=${c.crtId}` : "",
    "",
    "---",
    "",
    "This is a candidate, not a finding. Nothing is published until two reviewers",
    "approve it with stored evidence, under the listing policy.",
    "",
    "Reviewer checklist:",
    "",
    "- [ ] Open it in a sandbox and capture the page",
    "- [ ] Confirm it imitates the body rather than belonging to it",
    "- [ ] Record what it asks the visitor for",
    "- [ ] Second reviewer agrees",
    "- [ ] Promote with `node tools/promote-candidate.mjs`, or close as not a scam"
  ].filter((line) => line !== "").join("\n");
}

let posted = 0;
const delivered = [];
for (const c of candidates) {
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      authorization: "Bearer " + token,
      accept: "application/vnd.github+json",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      title: `Candidate: ${c.name} (${c.score})`,
      body: bodyFor(c),
      labels: ["candidate", "unreviewed"]
    })
  });
  if (res.ok) {
    posted++;
    delivered.push(c);
  } else {
    console.error(`Could not open an issue for one candidate: http ${res.status}`);
  }
}

/* Only what the queue actually accepted is marked seen. The rest comes back next run. */
if (delivered.length) saveSeen(markDelivered(loadSeen().hashes || [], delivered));
console.log(`Sent ${posted} of ${candidates.length} candidates to the review queue.`);
