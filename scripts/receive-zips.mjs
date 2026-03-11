/**
 * Receives zip file binary data from the browser and saves to lesson-zips/.
 * Expects POST /zip with JSON { filename, data } where data is base64-encoded.
 */
import { createServer } from "http";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ZIP_DIR = join(__dirname, "..", "lesson-zips");
const PORT = 9877;

if (!existsSync(ZIP_DIR)) mkdirSync(ZIP_DIR, { recursive: true });

let received = 0;
let expected = 0;

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/zip") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { filename, data } = JSON.parse(body);
        const buf = Buffer.from(data, "base64");
        writeFileSync(join(ZIP_DIR, filename), buf);
        received++;
        console.log(`  [${received}/${expected}] Saved: ${filename} (${buf.length} bytes)`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, received }));

        if (received >= expected && expected > 0) {
          console.log("\nAll zips saved. Shutting down...");
          setTimeout(() => process.exit(0), 1000);
        }
      } catch (err) {
        console.error("Error:", err.message);
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.method === "POST" && req.url === "/init") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      expected = JSON.parse(body).count;
      console.log(`Expecting ${expected} zip files...\n`);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Zip receiver listening on http://localhost:${PORT}`);
  console.log("Waiting for browser to send zip files...\n");
});
