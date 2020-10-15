const fs = require("fs");
const path = require("path");
const is = require("unist-util-is");

function getTags(tree) {
  const tagsNodeIndex = tree.children.findIndex(
    (node) =>
      is(node, {
        type: "heading",
        depth: 3,
      }) && is(node.children[0], { value: "tags" })
  );

  if (tagsNodeIndex === -1) return [];

  const followingNode =
    tree.children
      .slice(tagsNodeIndex + 1, tagsNodeIndex + 2)
      .find((node) => is(node, [{ type: "paragraph" }])) || null;

  let tags;
  if (!!followingNode) {
    let tagNode = followingNode.children[0];
    tags = tagNode.type === "heading" ? "" : tagNode.value;
  }

  return tags ? tags.split(",").map((t) => t.trim()) : [];
}

function getTagListContent(linkedNotes) {
  let list = `${linkedNotes.map((note) => `- [[${note.title}]]\n`).join("")}`;
  return list;
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

async function tagMaintenance(notes, baseNotePath) {
  let tags = {};
  Object.keys(notes).map((notePath) => {
    const title = notes[notePath].filename;
    const noteTags = getTags(notes[notePath].parseTree);
    noteTags.forEach((t) => {
      if (!tags[t]) {
        tags[t] = [];
      }
      tags[t].push({ title, path: notePath });
    });
  });

  let orderedTags = {};
  Object.keys(tags)
    .sort()
    .forEach(function (key) {
      orderedTags[key] = tags[key];
    });

  Object.keys(orderedTags).forEach(async (tagName) => {
    const header = `# ${tagName} notes`;
    const tagList = getTagListContent(orderedTags[tagName]);
    const tagIndexContent = `${header}\n\n${tagList}`;
    const filePath = path.join(baseNotePath, "tags", `${tagName}.md`);
    ensureDirectoryExistence(filePath);
    await fs.promises.writeFile(filePath, tagIndexContent, {
      encoding: "utf-8",
    });
  });
}

module.exports = tagMaintenance;
