const { defineConfig } = require("cypress");
const { Client } = require("pg");

module.exports = defineConfig({
  projectId: "ijucgi",
  video:true,
  videoCompression: true,
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        async readfromDB(query) {
          const client = new Client({
            user: "kong",
            host: "localhost",
            database: "kong",
            password: "kong",
            port: 5432,
          });

          await client.connect(); // Establish connection to the database
          const res = await client.query(query); // Execute the query
          await client.end(); // Close the connection
          return res.rows; // Return the result rows
        });
    },
  },
});
