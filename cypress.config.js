const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "ijucgi",
  video:true,
  videoCompression: true,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
