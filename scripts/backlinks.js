const readAllNotes = require("./read-files");
const backlinkMaintenance = require("./backlink-maintenance");

(async () => {
  try {
    const myArgs = process.argv.slice(2);
    const baseNotePath = myArgs[0];

    if (!baseNotePath || baseNotePath === "--help") {
      console.log("Usage: node scripts/backlinks.js [NOTE_DIRECTORY]");
      return;
    }

    const notes = await readAllNotes(baseNotePath);
    backlinkMaintenance(notes);
  } catch (e) {
    // Catch anything bad that happens
    console.error("We've thrown! Whoops!", e);
  }
})();
