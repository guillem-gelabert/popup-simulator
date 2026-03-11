import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_DIR = join(__dirname, "..", "lesson-html");

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.7;
  color: #e0e0e8;
  background: #1a1a2e;
  padding: 2rem;
}

.content {
  max-width: 52rem;
  margin: 0 auto;
}

header.details {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #2a2a4a;
}

header.details .side.aside { display: none; }

header.details .side.informations {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

header.details .sibling { display: none; }

header.details .current-lesson .label {
  font-size: 0.85rem;
  color: #8888aa;
  font-weight: 600;
  letter-spacing: 0.05em;
}

header.details .current-lesson .title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0.25rem 0 0.5rem;
}

header.details .difficulty {
  font-size: 0.85rem;
  color: #8888aa;
}

header.details .difficulty .value {
  color: #a78bfa;
  font-weight: 600;
}

h2.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 2.5rem 0 1rem;
  padding-top: 1rem;
  border-top: 1px solid #2a2a4a;
}

h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: #d0d0e0;
  margin: 2rem 0 0.75rem;
}

p {
  margin: 0.75rem 0;
  color: #c0c0d4;
}

a {
  color: #a78bfa;
  text-decoration: none;
}
a:hover { text-decoration: underline; }

strong, b { color: #fff; font-weight: 600; }
em, i { color: #c8b8e8; }

code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.88em;
  background: #12122a;
  color: #e8d0ff;
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

pre {
  background: #12122a;
  border: 1px solid #2a2a4a;
  border-radius: 8px;
  padding: 1.25rem;
  margin: 1.25rem 0;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #d0d0e8;
}

ul, ol {
  margin: 0.75rem 0 0.75rem 1.5rem;
  color: #c0c0d4;
}

li { margin: 0.35rem 0; }

img, video {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid #2a2a4a;
}

.video-jump {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #8888aa;
  font-size: 0.8rem;
}
.video-jump .play { display: none; }
.video-jump .time {
  background: #2a2a4a;
  padding: 0.1em 0.5em;
  border-radius: 4px;
  font-family: monospace;
}

.anchor .link { display: none; }

svg { display: none; }

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}
th, td {
  border: 1px solid #2a2a4a;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
th { background: #12122a; color: #fff; }

blockquote {
  border-left: 3px solid #a78bfa;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  color: #b0b0c8;
  background: #12122a;
  border-radius: 0 6px 6px 0;
}

hr {
  border: none;
  border-top: 1px solid #2a2a4a;
  margin: 2rem 0;
}

section.text { margin-bottom: 3rem; }
`;

const files = readdirSync(HTML_DIR).filter((f) => f.endsWith(".html")).sort();

for (const file of files) {
  const raw = readFileSync(join(HTML_DIR, file), "utf-8");
  const num = file.match(/^(\d+)/)?.[1] || "";
  const name = file
    .replace(/\.html$/, "")
    .replace(/^\d+-/, "")
    .replace(/-/g, " ");

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${num}. ${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>${CSS}</style>
</head>
<body>
  <div class="content">
    ${raw}
  </div>
</body>
</html>`;

  writeFileSync(join(HTML_DIR, file), doc, "utf-8");
  console.log(`Styled: ${file}`);
}

console.log(`\nDone! ${files.length} files styled.`);
