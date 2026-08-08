#!/usr/bin/env node
// Encrypts sheet config with the password from $DASHBOARD_PW and writes index.html.
// Never reads the password from argv or a file — must be passed via env var.

import { webcrypto as crypto } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SHEET_ID = "1BydHQ0DQagXdzhVZ1QD6JPO8dQ0eYZPQ68nipw0B8WE";
const GID = "370823670";
const SECRET = `${SHEET_ID}|${GID}`;

const password = process.env.DASHBOARD_PW;
if (!password || password.length < 4) {
  console.error("ERROR: DASHBOARD_PW env var must be set (min 4 chars).");
  console.error("Use ./deploy.sh instead of calling this script directly.");
  process.exit(1);
}

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv   = crypto.getRandomValues(new Uint8Array(12));

const keyMaterial = await crypto.subtle.importKey(
  "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 300000, hash: "SHA-256" },
  keyMaterial,
  { name: "AES-GCM", length: 256 },
  false, ["encrypt"]
);
const ct = new Uint8Array(
  await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(SECRET))
);

const b64 = (u8) => Buffer.from(u8).toString("base64");

const template = readFileSync(join(HERE, "template.html"), "utf8");
const output = template
  .replace('"__SALT__"',       JSON.stringify(b64(salt)))
  .replace('"__IV__"',         JSON.stringify(b64(iv)))
  .replace('"__CIPHERTEXT__"', JSON.stringify(b64(ct)));

// Sanity check: all placeholders substituted
for (const p of ["__SALT__", "__IV__", "__CIPHERTEXT__"]) {
  if (output.includes(p)) {
    console.error(`ERROR: placeholder ${p} still present in output`);
    process.exit(1);
  }
}

writeFileSync(join(HERE, "index.html"), output);
console.log(`OK  wrote index.html (${output.length.toLocaleString()} bytes)`);
