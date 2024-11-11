const { defineConfig } = require("cypress");
const { Client } = require("pg");

module.exports = defineConfig({
  projectId: "ijucgi",
  video:true,
  videoCompression: true,
  e2e: {
    setupNodeEvents(on, config) {
      on("task",{
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
          //console.log(res.rows);
          // will log message like this:
          // [
          //   {
          //     id: '90a831c4-582d-443b-a6cc-51ef9529c579',
          //     created_at: 2024-11-10T03:37:40.000Z,
          //     updated_at: 2024-11-10T03:37:40.000Z,
          //     consumer_id: '0a387feb-3eef-4e00-bfd4-c1ec985c273b',
          //     rbac_user_id: 'adf10c51-e0fd-4006-83e6-d9a3281961ae',
          //     rbac_token_enabled: true,
          //     email: null,
          //     status: null,
          //     username: 'kong_admin',
          //     custom_id: null,
          //     username_lower: 'kong_admin'
          //   }
          // ]
          return res.rows; // Return the result rows
        },
      });
    },
  },
});
