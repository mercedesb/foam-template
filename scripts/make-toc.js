/*
Description: For creating an index.md file with a bulleted list of links to the files of a directory, a "table of contents"
Usage: node scripts/make-toc.js path/to/directory
*/

const fs = require("fs");
const path = require("path");

async function makeToc(noteFolderPath) {
  if (noteFolderPath === "node_modules" || noteFolderPath === ".") return;

  const noteDirectoryEntries = await fs.promises.readdir(noteFolderPath, {
    withFileTypes: true,
  });

  const hasMarkdownFiles = noteDirectoryEntries.some((entry) =>
    entry.name.endsWith(".md")
  );

  // don't write an index file if there are no markdown files in the directory
  if (!hasMarkdownFiles) return;

  let indexContent = "";
  await noteDirectoryEntries
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
    .forEach(async (entry) => {
      const entryPath = path.join(noteFolderPath, entry.name);

      if (entry.name.startsWith(".")) return;

      // if you want it to be recursive
      // if (!entry.isFile()) {
      //   makeToc(entryPath);
      if (entry.isFile()) {
        if (!entry.name.endsWith(".md") || entry.name === "index.md") {
          return;
        }
        const filename = path.basename(entryPath, ".md");
        const listItem = `- [[${filename}]]\n`;
        indexContent += listItem;
      }
    });

  let folders = noteFolderPath
    .split(path.sep)
    .map((f) => `${f[0].toUpperCase()}${f.slice(1)}`);

  indexContent = `# ${folders.join(" - ")} - Index\n\n${indexContent}`;

  await fs.promises.writeFile(
    path.join(noteFolderPath, "index.md"),
    indexContent,
    { encoding: "utf-8" }
  );
}

module.exports = makeToc;
