# kongcypress
- cypress to automate test kong manager
- Using github Actions to integrate test suites against target servers.

# Quick assignment check:
- visit a public github link (https://github.com/jack-moris/kongcypress/actions)
- Please check the latest Green Result record. it should contain the test result at the bottom.

# design considerations, assumptions, and trade-offs 
- smoke test for two major funcs: service creation and routes setting.
- design more checkpoints: gateway(routes) should work good under different settings, boundary cases(size/length/strings), reg path cases, unique cases,pagination cases, service and routes integrity cases, etc.
- check data persisitence, eg, for an insertion or deletion operation, data should be persistent in DB to prevend from dirty data or data loss.
- to save time, only use chrome browser as frontend e2e testing.
- to save time, record test result using cypress cloud.


***************************************************
Below is the The Assignment

During your first panel interview, you received login credentials for http://localhost:8002/login.

Use these to create an E2E test suite for the Gateway Service.

Information about Gateway Service can be found here:

https://docs.konghq.com/gateway/latest/key-concepts/services.

Information about deploying Gateway with docker can be found here:

https://docs.konghq.com/gateway/latest/install/docker/

Information about Gateway Configuration (if required) can be found here:

https://docs.konghq.com/gateway/3.8.x/reference/configuration/

You have the freedom to choose your toolchain (Cypress with JS or TS).

Setup:
- Download the docker-compose file
- Navigate to the directory where the docker-compose.yml file is located
- Run docker-compose up -d
- Navigate to http://localhost:8002/ in your browser
- Make sure you can access the Kong Gateway UI (Kong Manager)
- 
Basic test actions:
- Complete the flow to create a new Service from scratch using the UI of the application
- Create any additional entities associated with a Service (e.g. Route)
  
Bonus ideas:
- Test Result Reporting
- Continuous integration (run the tests in CI e.g. GitHub Actions)
  
Teardown:
- Run docker-compose down to shut down docker services
  
How to submit the project

You have one week to complete this, but we don't expect you to spend more than a few days on
it.When it's ready, please send your recruiter a link to the source code, preferably in a GitHub
public repo.

Include a README in your project for local setup and execution. 

In this, describe your design considerations, assumptions, and trade-offs made during the exercise


