describe('kong cp smoke test', () => {
  beforeEach(() => {

    //TODO: do some db cleaning job.
    //It is better to use API CALL to clean the job rather than DB operation.

  })
  
  it('CASE1-Check Homepage Loadable: \n\
    \tStep1: Click default workspace from kong cp homepage \n\
    \tStep2: Check the workspace page is good\n', () => {
    
    cy.visit('http://localhost:8002/workspaces')
    //find the default workspace link, and click.
    cy.get('div[class="workspace-name"]').should('have.text', 'default')
    cy.get('div[data-testid="workspace-link-default"]').click()

    //check the default page is loaded.
    cy.get('span[class="title"]').should('have.text','Overview')
    cy.url().should('include', '/default/overview')

  })

  it('CASE2-Check Kong DB Accessible: \n\
      \tStep1: Query record from admins.\n\
      \tStep2: Check field username == kong_admin from the first record\n',()=> {
    //check that at least there is one admin in db. proving that db connects good and works well.
    cy.task('readfromDB','SELECT * FROM admins ;').then((rows)=>{
      expect(rows[0]).to.have.property("username","kong_admin")
          //one example of the record from table admins 
          //[
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
    })

  })

  it('CASE3-Check Key Feature Workable: \n\
      \tStep1: Create a new gateway service and its route, \n\
      \tStep2: Wait 5 seconds, check route should work well, \n\
      \tStep3: Check data(route&service) persistence in Postgres DB\n\
      \tStep4: Check user should be able to remove route successfully\n\
      \tStep5: Wait 5 seconds, check route should not work because of route removal\n\
      \tStep6: Check user should be able to remove service\n\
      \tStep7: Check data in DB is clear after removal of service and route\n', () => {
    const generateRandomString = (length = 8) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    };

    // Generate a random string for name,tags and url for the service form submit.
    const serviceName = generateRandomString()
    const serviceTags= generateRandomString()+','+generateRandomString()+","+generateRandomString()
    const serviceUrl = "https://postman-echo.com/get" // this is a site for testing route.

    cy.visit('http://localhost:8002/workspaces')
    //STEP1: Create a service and its route.
    //find the default workspace link, and click.
    cy.get('div[data-testid="workspace-link-default"]').click()
    //Note: Only when there is 0 serivce, if there are 1 or more services, here shows add a route.
    cy.get('button[data-testid="action-button"]').should('contain.text','Add a Gateway Service')
    cy.get('button[data-testid="action-button"]').click()
    cy.url().should('include','/default/services/create')

    //check the button 'Save' is not enabled.
    cy.get('button[data-testid="service-form-submit"]').should('not.be.enabled')
    cy.get('input[data-testid="gateway-service-name-input"]').type(serviceName)
    cy.get('input[data-testid="gateway-service-tags-input"]').type(serviceTags)
    cy.get('input[data-testid="gateway-service-url-input"]').type(serviceUrl)

    //check the button(to submit the form for service creation) status is correctly activated.
    cy.get('button[data-testid="service-form-submit"]').should('be.enabled')
    cy.get('button[data-testid="service-form-submit"]').click()

    //check after created, the page forwarded should be correct.
    cy.url().should('include','/default/services/')
    
    //check the service should be created succesfully. ID is not empty
    cy.get('div[data-testid="name-plain-text"]').should('contains.text',serviceName)


    // Create a route for this service.
    //check user should be able to create a route for this service.
    cy.get('button').contains('Add a Route').click()
    const routeName = generateRandomString()
    const routeTags = generateRandomString()+','+generateRandomString()+','+generateRandomString()
    const routePaths= '/'+generateRandomString()
    cy.get('button[data-testid="route-form-submit"]').should('not.be.enabled')
    cy.get('input[data-testid="route-form-name"]').type(routeName)
    cy.get('input[data-testid="route-form-tags"').type(routeTags)
    cy.get('input[data-testid="route-form-paths-input-1').type(routePaths)
    cy.get('button[data-testid="route-form-submit"]').should('be.enabled')
    cy.get('button[data-testid="route-form-submit"]').click()

    //check route should be created successfully. There created a record of Route.
    cy.get('span').contains(routeName).click()
    cy.url().should('include','/default/routes')

    //check route should be created successfully with the exact routeName input.
    cy.get('div[data-testid="name-plain-text"]').should('contains.text',routeName)
    
    //STEP2: Check the route is working
    //check this route is working good.
    //Important! first of all, need to wait 5s for route taking effect.
    cy.wait(5000) 
    cy.task('execCurl', 'curl -X GET http://localhost:8000'+routePaths)
    .then((stdout) => {
      expect(stdout).to.contain('postman');//postman is a word in reponse from postman test site.
    });
    
    //STEP3: Check DB persistence
    //check data (route and services) are all stored in DB.
    //Note, because test suite just started, till now, should only have 1 record for each table(routes and services).
    cy.task('readfromDB','SELECT * FROM routes ;').then((rows)=>{
      expect(rows[0]).to.have.property("name",routeName)

    })
    cy.task('readfromDB','SELECT * FROM services ;').then((rows)=>{
      expect(rows[0]).to.have.property("name",serviceName)

    })

    //STEP4: Remove the route.
    //now check to remove the route.
    cy.get('button[data-testid="header-actions"]').click()
    cy.get('span').contains('Delete').click()
    cy.get('input[data-testid="confirmation-input"]').type(routeName)
    cy.get('button[data-testid="modal-action-button"]').click()

    //check it goes to the correct pannel, 
    //and check the panel should be empty, left only a blue "+ New Route" button
    cy.url().should('include','/default/services/')
    cy.get('a').contains('New Route').should('contains.text','New Route')

    //STEP5: Check the route should not work
    //check this route is not working because of removal.
    //Important! first of all, need to wait 5s for route taking effect.
    cy.wait(5000) 
    cy.task('execCurl', 'curl -X GET http://localhost:8000'+routePaths)
    .then((stdout) => {
      expect(stdout).to.contains('no Route')//no Route is a key word from kong proxy.
    });


    //STEP6: Remove the service.
    //Now check to remove service
    //click the drag down list.
    cy.get('button[data-testid="header-actions"]').click()
    cy.get('span').contains('Delete').click()
    cy.get('input[data-testid="confirmation-input"]').type(serviceName)
    cy.get('button[data-testid="modal-action-button"]').click()

    //check it goes to the correct pannel, and the panel should be empty, left only a blue "+ New Gateway Service" button
    cy.url().should('include','/default/services')
    cy.get('a').contains('New Gateway Service').should('contains.text','New Gateway Service')



    
    //STEP7: Check DB persistence
    //check data (route and services) are all stored in DB.
    //Note, because test suite just started, till now, should only have 1 record for each table(routes and services).
    cy.task('readfromDB','SELECT * FROM routes ;').then((rows)=>{
      expect(rows.length).to.be.equal(0)
    })
    cy.task('readfromDB','SELECT * FROM services ;').then((rows)=>{
      expect(rows.length).to.be.equal(0)
    })

    //Ends here. seems all good.
  })


  it('CASE4-Check Route Method Restriction: \n\
    \tStep1: Create a service and its route, the route allows Only Post method \n\
    \tStep2: Check Get method does not work for the route\n\
    \tStep3: Modify the method limit, enable Get method\n\
    \tStep4: Check Get method works good now\n\
    \tStep5: Remove route and service\n', () => {

      const generateRandomString = (length = 8) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      };

      // Generate a random string for name,tags and url for the service form submit.
      const serviceName = generateRandomString()
      const serviceTags= generateRandomString()+','+generateRandomString()+","+generateRandomString()
      const serviceUrl = "https://postman-echo.com/get" // this is a site for testing route.
  
      //STEP1: Create a service and its route.
      //Create a service
      cy.visit('http://localhost:8002/default/services/create')
      cy.get('input[data-testid="gateway-service-name-input"]').type(serviceName)
      cy.get('input[data-testid="gateway-service-tags-input"]').type(serviceTags)
      cy.get('input[data-testid="gateway-service-url-input"]').type(serviceUrl)
      cy.get('button[data-testid="service-form-submit"]').click()

      // Create a route for this service.
      //click service record just created
      cy.get('tr[data-testid=\"'+serviceName+'\"]').click()
      //click to create a route.
      cy.get('button').contains('Add a Route').click()
      const routeName = generateRandomString()
      const routeTags = generateRandomString()+','+generateRandomString()+','+generateRandomString()
      const routePaths= '/'+generateRandomString()
      cy.get('input[data-testid="route-form-name"]').type(routeName)
      cy.get('input[data-testid="route-form-tags"').type(routeTags)
      cy.get('input[data-testid="route-form-paths-input-1').type(routePaths)
      cy.get('label[data-testid="routing-rule-methods"]').click()
      //Only Allow POST Method
      cy.get('input[data-testid="post-method-toggle"]').check({force: true})
      cy.get('button[data-testid="route-form-submit"]').click()
  
      //check route should be created successfully. There created a record of Route.
      cy.get('span').contains(routeName).click()  
      //check route should be created successfully with the exact routeName input.
      cy.get('div[data-testid="name-plain-text"]').should('contains.text',routeName)
      
      //STEP2: Check Get method does not work for the route
      //Important! first of all, need to wait 5s for route taking effect
      cy.wait(5000) 
      cy.task('execCurl', 'curl -X GET http://localhost:8000'+routePaths).then((stdout) => {
        expect(stdout).to.contain('no Route');//should not work for Get method
      });
    
      //STEP3: Edit Route to enable GET method.
      //click Route actions button to find Edit choice drop down.
      cy.get('button[data-testid="header-actions"]').click()
      cy.get('span').contains('Edit configuration').click()
      //Allow GET Method
      cy.get('input[data-testid="get-method-toggle"]').check({force:true})
      cy.get('button[data-testid="route-form-submit"]').click()
    
      //STEP4: Check Get method works good now
      //Important! first of all, need to wait 5s for route taking effect.
      cy.wait(5000) 
      cy.task('execCurl', 'curl -X GET http://localhost:8000'+routePaths).then((stdout) => {
        expect(stdout).to.contain('postman');//should work for Get method
      });

      //STEP5: Remove the route.
      //now check to remove the route.
      cy.get('button[data-testid="header-actions"]').click()
      cy.get('span').contains('Delete').click()
      cy.get('input[data-testid="confirmation-input"]').type(routeName)
      cy.get('button[data-testid="modal-action-button"]').click()
  
      //STEP6: Remove the service.
      //Now check to remove service
      //click the drag down list.
      cy.get('button[data-testid="header-actions"]').click()
      cy.get('span').contains('Delete').click()
      cy.get('input[data-testid="confirmation-input"]').type(serviceName)
      cy.get('button[data-testid="modal-action-button"]').click()
  
      //Ends here. seems all good.
  })

  it('CASE5-Check Multiple Paths for one Route : \n\
    \tStep1: Create a service, and creates 50 paths for one route \n\
    \tStep2: Check any path should work good\n\
    \tStep3: Remove route and service\n', () => {

      const generateRandomString = (length = 8) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      };

      // Generate a random string for name,tags and url for the service form submit.
      const serviceName = generateRandomString()
      const serviceTags= generateRandomString()+','+generateRandomString()+","+generateRandomString()
      const serviceUrl = "https://postman-echo.com/get" // this is a site for testing route.
  
      //STEP1: Create a service and its route with multple paths
      cy.visit('http://localhost:8002/default/services/create')
      cy.get('input[data-testid="gateway-service-name-input"]').type(serviceName)
      cy.get('input[data-testid="gateway-service-tags-input"]').type(serviceTags)
      cy.get('input[data-testid="gateway-service-url-input"]').type(serviceUrl)
      cy.get('button[data-testid="service-form-submit"]').click()

      // Create a route for this service.
      //click service record just created
      cy.get('tr[data-testid=\"'+serviceName+'\"]').click()

      //click to create paths repeatedly for 5 times.
      cy.get('button').contains('Add a Route').click()
      const routeName = generateRandomString()
      const routeTags = generateRandomString()+','+generateRandomString()+','+generateRandomString()
      const routePaths = [];
      routePaths[0]= '/'+generateRandomString()
      
      cy.get('input[data-testid="route-form-name"]').type(routeName)
      cy.get('input[data-testid="route-form-tags"').type(routeTags)

      //repeatedly click to add new Paths
      //Initial operation, input the first path.
      routePaths[0]= '/'+generateRandomString();
      cy.get('input[data-testid="route-form-paths-input-1').type(routePaths[0])
      for(let i=1;i<50;i++){//4 times to input more paths
        cy.get('button[data-testid="add-paths"]:not([disabled])').click()
        routePaths[i]= '/'+generateRandomString();
        cy.get('input[data-testid="route-form-paths-input-'+(i+1)).type(routePaths[i])
        
      }  
      //click the form to submit the route creation
      cy.get('button[data-testid="route-form-submit"]').click()
      //check route should be created successfully. There created a record of Route.
      cy.get('span').contains(routeName).click()  
      //check route should be created successfully with the exact routeName input.
      cy.get('div[data-testid="name-plain-text"]').should('contains.text',routeName)
      
      //STEP2: Check Get method should work for any path of the route
      //Important! first of all, need to wait 5s for route taking effect.
      cy.wait(5000) 
      cy.task('execCurl', 'curl -X GET http://localhost:8000'+routePaths[1])//random choose one path to check
      .then((stdout) => {
        expect(stdout).to.contain('postman');//should work for Get method
      });
            
               
      //STEP5: Remove the route.
      //now check to remove the route.
      cy.get('button[data-testid="header-actions"]').click()
      cy.get('span').contains('Delete').click()
      cy.get('input[data-testid="confirmation-input"]').type(routeName)
      cy.get('button[data-testid="modal-action-button"]').click()
  
      //STEP6: Remove the service.
      //Now check to remove service
      //click the drag down list.
      cy.get('button[data-testid="header-actions"]').click()
      cy.get('span').contains('Delete').click()
      cy.get('input[data-testid="confirmation-input"]').type(serviceName)
      cy.get('button[data-testid="modal-action-button"]').click()
  
      //Ends here. seems all good.

  })


  it('CASE6-[TODO] Check Same Route Name Conflicts on Creation : \n\
    \tStep1: Create a service, and creates 2 routes with same name \n\
    \tStep2: Check the second operation SHOULD FAILE because route name is unique when it is not empty string\n\
    \tStep3: Remove route and service\n', () => {
      //TODO
  })
 
  it('CASE7-[TODO]Check Create 999 Routes Pagination : \n\
    \tStep1: Create a service, and creates 999 routes with different names \n\
    \tStep2: Check pagination of Routes works good\n\
    \tStep3: Remove routes and service\n', () => {
      //TODO
  })

  it('CASE8-[TODO]]Check 999 services creation and pagination: \n\
    \tStep1: Create 999 service with different names \n\
    \tStep2: Check pagination of Services works good\n\
    \tStep3: Remove services\n', () => {
      //TODO
  })  


  it('CASE9-[TODO]Check Service Deletion Must Fail With Existing Route(s) : \n\
    \tStep1: Create a service, and creates one route \n\
    \tStep2: Check if user is able to delete this service directly, should failed, and have tips\n\
    \tStep3: Remove route and service\n', () => {
      //TODO
  })  

  //TO Add more cases here:

})
