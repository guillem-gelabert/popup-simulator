/**
 * Convert lesson HTML dumps into a single markdown file.
 *
 * Pre-requisite: HTML files in ./lesson-html/ (produced by scrape-batch.mjs)
 * Output:        ./threejs-journey-lessons.md
 */
import TurndownService from "turndown";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_DIR = join(__dirname, "..", "lesson-html");
const OUTPUT_PATH = join(__dirname, "..", "threejs-journey-lessons.md");
const BASE_URL = "https://threejs-journey.com";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

turndown.addRule("fencedCodeBlock", {
  filter(node) {
    return node.nodeName === "PRE" && node.querySelector("code");
  },
  replacement(_content, node) {
    const code = node.querySelector("code");
    const lang = (code.className.match(/language-(\S+)/) || [])[1] || "";
    return `\n\n\`\`\`${lang}\n${code.textContent}\n\`\`\`\n\n`;
  },
});

turndown.addRule("images", {
  filter: "img",
  replacement(_content, node) {
    const alt = node.getAttribute("alt") || "";
    const src = node.getAttribute("src") || "";
    const fullSrc = src.startsWith("/") ? `${BASE_URL}${src}` : src;
    return `![${alt}](${fullSrc})`;
  },
});

turndown.addRule("video", {
  filter(node) {
    return node.nodeName === "VIDEO";
  },
  replacement(_content, node) {
    const src =
      node.getAttribute("src") ||
      node.querySelector("source")?.getAttribute("src") ||
      "";
    const fullSrc = src.startsWith("/") ? `${BASE_URL}${src}` : src;
    return fullSrc ? `[Video](${fullSrc})` : "";
  },
});

turndown.addRule("svgRemove", {
  filter: "svg",
  replacement() {
    return "";
  },
});

const files = readdirSync(HTML_DIR)
  .filter((f) => f.endsWith(".html"))
  .sort((a, b) => {
    const na = parseInt(a.match(/^(\d+)/)?.[1] || "0", 10);
    const nb = parseInt(b.match(/^(\d+)/)?.[1] || "0", 10);
    return na - nb;
  });

console.log(`Found ${files.length} HTML files in ${HTML_DIR}`);

let markdown = "# Three.js Journey — Complete Lessons\n\n";
markdown += `> Scraped on ${new Date().toISOString().split("T")[0]}\n\n`;
markdown += "---\n\n";

for (const file of files) {
  const html = readFileSync(join(HTML_DIR, file), "utf-8");
  const lessonName = file.replace(/\.html$/, "").replace(/^\d+-/, "");
  const num = file.match(/^(\d+)/)?.[1] || "??";

  console.log(`[${num}] Converting: ${lessonName}`);

  try {
    const md = turndown.turndown(html);
    markdown += `## ${num}. ${lessonName.replace(/-/g, " ")}\n\n`;
    markdown += md;
    markdown += "\n\n---\n\n";
  } catch (err) {
    console.error(`  Error converting ${file}: ${err.message}`);
    markdown += `## ${num}. ${lessonName}\n\n*Error converting this lesson.*\n\n---\n\n`;
  }
}

writeFileSync(OUTPUT_PATH, markdown, "utf-8");
console.log(`\nDone! ${files.length} lessons → ${OUTPUT_PATH}`);
