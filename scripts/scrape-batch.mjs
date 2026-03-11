/**
 * Inject into the MCP browser to fetch all lesson HTML using the
 * authenticated session, then expose results via a textarea.
 *
 * This script generates the JavaScript payload that should be pasted
 * into the MCP browser via javascript: URL navigation.
 *
 * Or: run as a Playwright script that connects to an authenticated page.
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const urls = JSON.parse(
  readFileSync(join(__dirname, "lesson-urls.json"), "utf-8")
);

console.log(`Total lessons: ${urls.length}`);
console.log("\nLesson slugs:");
urls.forEach((url, i) => {
  const slug = url.split("/lessons/")[1];
  console.log(`  ${String(i + 1).padStart(2, "0")}. ${slug}`);
});
