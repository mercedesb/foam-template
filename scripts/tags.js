const readAllNotes = require("./read-files");
const tagMaintenance = require("./tag-maintenance");

(async () => {
  try {
    const myArgs = process.argv.slice(2);
    const baseNotePath = myArgs[0];

    if (!baseNotePath || baseNotePath === "--help") {
      console.log("Usage: node scripts/tags.js [NOTE_DIRECTORY]");
      return;
    }

    const notes = await readAllNotes(baseNotePath);
    tagMaintenance(notes, baseNotePath);
  } catch (e) {
    // Catch anything bad that happens
    console.error("We've thrown! Whoops!", e);
  }
})();
