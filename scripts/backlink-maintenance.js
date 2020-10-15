/*
Description: For creating a "Backlinks" section at the end of file with links to all files that reference the current file
Usage: node scripts/backlink-maintenance.js path/to/directory
*/

const fs = require("fs");
const visitParents = require("unist-util-visit-parents");
const is = require("unist-util-is");

const processor = require("./markdown-processor");

const blockTypes = [
  "paragraph",
  "heading",
  "thematicBreak",
  "blockquote",
  "list",
  "table",
  "html",
  "code",
];

function isBlockContent(node) {
  return blockTypes.includes(node.type);
}

function getNoteLinks(tree, backlinksInfo) {
  let searchedChildren;
  if (backlinksInfo.isPresent) {
    searchedChildren = tree.children
      .slice(
        0,
        tree.children.findIndex((n) => n === backlinksInfo.start)
      )
      .concat(
        tree.children.slice(
          backlinksInfo.until
            ? tree.children.findIndex((n) => n === backlinksInfo.until)
            : tree.children.length
        )
      );
  } else {
    searchedChildren = tree.children;
  }
  const links = [];
  visitParents(
    { ...tree, children: searchedChildren },
    "wikiLink",
    (node, ancestors) => {
      const closestBlockLevelAncestor = ancestors.reduceRight(
        (result, needle) => result || (isBlockContent(needle) ? needle : null),
        null
      );
      links.push({
        targetTitle: node.data.alias,
        context: closestBlockLevelAncestor,
      });
      return true;
    }
  );
  return links;
}

function isClosingMatterNode(node) {
  return "value" in node && node.value.startsWith("<!--");
}

function getBacklinksBlock(tree) {
  const existingBacklinksNodeIndex = tree.children.findIndex(
    (node) =>
      is(node, {
        type: "heading",
        depth: 2,
      }) && is(node.children[0], { value: "Backlinks" })
  );
  if (existingBacklinksNodeIndex === -1) {
    const insertionPoint =
      tree.children.find((node) => is(node, isClosingMatterNode)) || null;
    return {
      isPresent: false,
      insertionPoint,
    };
  } else {
    const followingNode =
      tree.children
        .slice(existingBacklinksNodeIndex + 1)
        .find((node) => is(node, [{ type: "heading" }, isClosingMatterNode])) ||
      null;
    return {
      isPresent: true,
      start: tree.children[existingBacklinksNodeIndex],
      until: followingNode,
    };
  }
}

function updateBacklinks(noteContents, backlinks, backlinksInfo) {
  let insertionOffset;
  let oldEndOffset = -1;

  if (backlinksInfo.isPresent) {
    insertionOffset = backlinksInfo.start.position.start.offset;
    oldEndOffset = backlinksInfo.until
      ? backlinksInfo.until.position.start.offset
      : noteContents.length;
  } else {
    insertionOffset = backlinksInfo.insertionPoint
      ? backlinksInfo.insertionPoint.position.start.offset
      : noteContents.length;
  }

  if (oldEndOffset === -1) {
    oldEndOffset = insertionOffset;
  }

  let backlinksString = "";
  if (backlinks.length > 0) {
    if (!backlinksInfo.isPresent) {
      backlinksString += "\n\n";
    }

    backlinksString += `## Backlinks\n\n${backlinks
      .map(
        (entry) =>
          `- [[${entry.sourceTitle}]]\n${entry.context
            .map(
              (block) =>
                `\t- ${processor.stringify(block).replace(/\n.+/, "")}\n`
            )
            .join("")}`
      )
      .join("")}\n`;
  }

  const newNoteContents =
    noteContents.slice(0, insertionOffset) +
    backlinksString +
    noteContents.slice(oldEndOffset);
  return newNoteContents;
}

function createLinkMap(notes) {
  // const linkMap: Map<string, Map<string, MDAST.BlockContent[]>> = new Map();
  const linkMap = new Map();
  for (const note of notes) {
    if (note.filename === "index") continue;
    if (note.directory === "tags") continue;

    const backlinksBlock = getBacklinksBlock(note.parseTree);
    const links = getNoteLinks(note.parseTree, backlinksBlock);

    for (const link of links) {
      const targetTitle = link.targetTitle;
      if (targetTitle === "index") continue;

      let backlinkEntryMap = linkMap.get(targetTitle);
      if (!backlinkEntryMap) {
        backlinkEntryMap = new Map();
        linkMap.set(targetTitle, backlinkEntryMap);
      }
      let contextList = backlinkEntryMap.get(note.filename);
      if (!contextList) {
        contextList = [];
        backlinkEntryMap.set(note.filename, contextList);
      }
      if (link.context) {
        contextList.push(link.context);
      }
    }
  }

  return linkMap;
}

async function backlinkMaintenance(notes) {
  const linkMap = createLinkMap(Object.values(notes));

  await Promise.all(
    Object.keys(notes).map(async (notePath) => {
      const backlinksBlock = getBacklinksBlock(notes[notePath].parseTree);
      const backlinks = linkMap.get(notes[notePath].filename);
      let transformedBacklinks = backlinks
        ? [...backlinks.keys()].map((sourceTitle) => ({
            sourceTitle,
            context: backlinks.get(sourceTitle),
          }))
        : [];

      const newContents = updateBacklinks(
        notes[notePath].noteContents,
        transformedBacklinks,
        backlinksBlock
      );

      if (newContents !== notes[notePath].noteContents) {
        await fs.promises.writeFile(notePath, newContents, {
          encoding: "utf-8",
        });
      }
    })
  );
}

module.exports = backlinkMaintenance;
