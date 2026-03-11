/**
 * Temporary HTTP server that receives lesson HTML from the browser
 * and writes individual files + converts to combined markdown.
 */
import { createServer } from "http";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_DIR = join(__dirname, "..", "lesson-html");
const PORT = 9876;

if (!existsSync(HTML_DIR)) mkdirSync(HTML_DIR, { recursive: true });

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/lessons") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const lessons = JSON.parse(body);
        console.log(`Received ${lessons.length} lessons`);

        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i];
          const num = String(i + 1).padStart(2, "0");
          const filename = `${num}-${lesson.slug}.html`;
          writeFileSync(join(HTML_DIR, filename), lesson.html || "", "utf-8");
          console.log(`  Saved: ${filename} (${(lesson.html || "").length} chars)`);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, count: lessons.length }));
        console.log("\nAll files saved. Shutting down server...");
        setTimeout(() => process.exit(0), 500);
      } catch (err) {
        console.error("Parse error:", err.message);
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
  console.log("Waiting for browser to POST lesson data...\n");
});
