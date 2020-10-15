const readAllNotes = require("./read-files");
const backlinkMaintenance = require("./backlink-maintenance");
const tagMaintenance = require("./tag-maintenance");
const makeToc = require("./make-toc");

(async () => {
  try {
    const myArgs = process.argv.slice(2);
    const baseNotePath = myArgs[0];

    if (!baseNotePath || baseNotePath === "--help") {
      console.log("Usage: node scripts/link-notes.js [NOTE_DIRECTORY]");
      return;
    }

    const notes = await readAllNotes(baseNotePath);
    backlinkMaintenance(notes);
    tagMaintenance(notes, baseNotePath);

    makeToc("tags");
  } catch (e) {
    // Catch anything bad that happens
    console.error("We've thrown! Whoops!", e);
  }
})();
