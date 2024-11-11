const { defineConfig } = require("cypress");
const { Client } = require("pg");
const { exec } = require('child_process');

module.exports = defineConfig({
  projectId: "ijucgi",
  video:true,
  videoCompression: true,
  e2e: {
    setupNodeEvents(on, config) {
      on("task",{
        
        //It is to check if RoutePath works or not in kong gateway using simple curl.
        execCurl(command){
          return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                return reject({ error: error.message, stderr });
              }
              //console.log(stdout);
              // for example, curl -x GET http://localhost:8000/Tec0dyRg
              // in wich Tec0dyRg is a route path. it might reponse like this:
              // we use https://postman-echo.com/get as a target service.
              // {
              //   "args": {},
              //   "headers": {
              //     "host": "postman-echo.com",
              //     "x-request-start": "t=1731330029.357",
              //     "connection": "close",
              //     "x-forwarded-proto": "https",
              //     "x-forwarded-port": "443",
              //     "x-amzn-trace-id": "Root=1-6731ffed-0274d7c2560843c54a1506b6",
              //     "via": "1.1 kong/3.8.0.0-enterprise-edition",
              //     "x-forwarded-host": "localhost",
              //     "x-forwarded-path": "/sHnGrgls",
              //     "x-forwarded-prefix": "/sHnGrgls",
              //     "x-kong-request-id": "eec7840ddb652e316ac0a029be7c1b17",
              //     "user-agent": "curl/7.81.0",
              //     "accept": "*/*"
              //   },
              //   "url": "https://postman-echo.com/get"
              // }
              return resolve(stdout);
            });
        })
      },

        //It is to fetch data from db, the purpose is to check the data is persistent or not.
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
