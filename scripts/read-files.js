/*
Description: For recursively reading the contents of each markdown file in a directory. Useful for use in other custom scripts.
*/

const fs = require("fs");
const path = require("path");
const find = require("unist-util-find");
const remark = require("remark");
const processor = require("./markdown-processor");

// Polyfill
Object.fromEntries = (l) => l.reduce((a, [k, v]) => ({ ...a, [k]: v }), {});

const missingTitleSentinel = { type: "missingTitle" };

const headingFinder = processor().use(() => (tree) =>
  find(tree, { type: "heading", depth: 1 }) || missingTitleSentinel
);

async function readNote(notePath) {
  const noteContents = await fs.promises.readFile(notePath, {
    encoding: "utf-8",
  });

  const parseTree = processor.parse(noteContents);
  const headingNode = await headingFinder.run(parseTree);

  let title;
  if (headingNode.type === "missingTitle") {
    console.log(`${notePath} has no title`);
    title = path.basename(notePath);
  } else {
    title = remark()
      .stringify({
        type: "root",
        children: headingNode.children,
      })
      .trimEnd();
  }

  const filename = path.basename(notePath, ".md");
  const directory = path.basename(path.dirname(notePath));

  return { title, directory, filename, parseTree, noteContents };
}

async function recursiveReadAllNotes(noteFolderPath, noteAccumulator) {
  if (noteFolderPath === "node_modules") return noteAccumulator;

  const noteDirectoryEntries = await fs.promises.readdir(noteFolderPath, {
    withFileTypes: true,
  });

  await noteDirectoryEntries.reduce(async (acc, entry) => {
    let accumulator = await acc;
    const entryPath = path.join(noteFolderPath, entry.name);

    if (entry.name.startsWith(".")) return accumulator;

    if (!entry.isFile()) {
      let nestedFiles = await recursiveReadAllNotes(entryPath, accumulator);
      accumulator.concat(nestedFiles);
    } else {
      if (
        !entry.name.endsWith(".md") ||
        entryPath.toLowerCase() === "readme.md"
      ) {
        return accumulator;
      }
      accumulator.push([entryPath, await readNote(entryPath)]);
    }
    return accumulator;
  }, noteAccumulator);

  return noteAccumulator;
}

async function readAllNotes() {
  const myArgs = process.argv.slice(2);
  const noteFolderPath = myArgs[0];
  const noteEntries = await recursiveReadAllNotes(noteFolderPath, []);
  return Object.fromEntries(noteEntries);
}

module.exports = readAllNotes;
