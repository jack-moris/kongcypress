# kongcypress
- cypress to automate test kong manager
- Using github Actions to integrate test suites against target servers.

# Quick assignment check:
- visit a public github link (https://github.com/jack-moris/kongcypress/actions)
- Please check the latest Green Result record. it should contain the test result at the bottom.

# Local run commands:
```shell
#install the docker-compse
>yum install docker-compose

#fetch the test code
>git clone https://github.com/jack-moris/kongcypress
>cd kongcypress

#start the kong cp servers
>docker-compose -f kong.yml up -d

#install cypress and run
>npm install cypress --save-dev
>npm install pg 
>sudo npx cypress run --browser chrome

#stop the kong cp servers
>docker-compose -f kong.yml down 
```

# design considerations, assumptions, and trade-offs 
- smoke test for two major funcs: service creation and routes setting.
- design more checkpoints: gateway(routes) should work good under different settings, boundary cases(size/length/strings), reg path cases, unique cases,pagination cases, service and routes integrity cases, etc.
- check data persisitence, eg, for an insertion or deletion operation, data should be persistent in DB to prevend from dirty data or data loss.
- to save time, only use chrome browser as frontend e2e testing.
- to save time, record test result using cypress cloud.
- For each case, need to resolve data cleaning task, we can use API call or DB operation, but API call is better.
- Some cy.get selector is not stable, sometimes, it will fail. need to find stable selector and method to do automation.
- Need to add more regression cases for service creation, edit,deletion, check more points on service settings. and so for the routes.
- CASE 6 to CASE 9 are NOT COMPLETE, yet to add real codes.

# Case design
```shell
    ✓ CASE1-Check Homepage Loadable: 
    	Step1: Click default workspace from kong cp homepage 
    	Step2: Check the workspace page is good
 
    ✓ CASE2-Check Kong DB Accessible: 
      	Step1: Query record from admins.
      	Step2: Check field username == kong_admin from the first record

    ✓ CASE3-Check Key Feature Workable: 
      	Step1: Create a new gateway service and its route, 
      	Step2: Wait 5 seconds, check route should work well, 
      	Step3: Check data(route&service) persistence in Postgres DB
      	Step4: Check user should be able to remove route successfully
      	Step5: Wait 5 seconds, check route should not work because of route removal
      	Step6: Check user should be able to remove service
      	Step7: Check data in DB is clear after removal of service and route

    ✓ CASE4-Check Route Method Restriction: 
    	Step1: Create a service and its route, the route allows Only Post method 
    	Step2: Check Get method does not work for the route
    	Step3: Modify the method limit, enable Get method
    	Step4: Check Get method works good now
    	Step5: Remove route and service

    ✓ CASE5-Check Two Paths for one Route : 
    	Step1: Create a service, and creates two paths for one route 
    	Step2: Check any path should work good
    	Step3: Remove route and service

    ✓ CASE6-[TODO] Check Same Route Name Conflicts on Creation : 
    	Step1: Create a service, and creates 2 routes with same name 
    	Step2: Check the second operation SHOULD FAILE because route name is unique when it is not empty string
    	Step3: Remove route and service

    ✓ CASE7-[TODO]Check Create 999 Routes Pagination : 
    	Step1: Create a service, and creates 999 routes with different names 
    	Step2: Check pagination of Routes works good
    	Step3: Remove routes and service

    ✓ CASE8-[TODO]]Check 999 services creation and pagination: 
    	Step1: Create 999 service with different names 
    	Step2: Check pagination of Services works good
    	Step3: Remove services
 
    ✓ CASE9-[TODO]Check Service Deletion Must Fail With Existing Route(s) : 
    	Step1: Create a service, and creates one route 
    	Step2: Check if user is able to delete this service directly, should failed, and have tips
    	Step3: Remove route and service

```
