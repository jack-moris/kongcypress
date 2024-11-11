describe('kong cp smoke test', () => {
  beforeEach(() => {
    //visit kong cp home page
    cy.visit('http://localhost:8002/workspaces')
  })
             
  it('Check: click default workspace from kong cp homepage ', () => {
    //find the default workspace link, and click.
    cy.get('div[class="workspace-name"]').should('have.text', 'default')
    cy.get('div[data-testid="workspace-link-default"]').click()

    //check the default page is loaded.
    cy.get('span[class="title"]').should('have.text','Overview')
    cy.url().should('include', '/default/overview')

  })

  it('Check: kong db queries well.',()=> {
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

  it('Check: create a new gateway service and a route of it, then check route works well', () => {
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

    //find the default workspace link, and click.
    cy.get('div[data-testid="workspace-link-default"]').click()
    //Note: Only when there is 0 serivce, if there are 1 or more services, here shows add a route.
    cy.get('button[data-testid="action-button"]').should('contain.text','Add a Gateway Service')
    cy.get('button[data-testid="action-button"]').click()
    cy.url().should('include','/default/services/create')

    //check the butt 'Save' is not enabled.
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
    const serviceID = cy.get('div[class="copy-text monospace"]')
    expect(serviceID).to.not.be.empty

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

    //check route should be created successfully. ID is not empty.
    const routeID = cy.get('div[class="copy-text monospace"]')
    expect(serviceID).to.not.be.empty
    
    //check this route is working good.
    //Important! first of all, need to wait 15s for route taking effect.
    cy.wait(15000) 
    cy.task('execCurl', 'curl -X GET http://localhost:8000'+routePaths)
    .then((stdout) => {
      expect(stdout).to.contain('postman');//postman is a word in reponse from postman test site.
    });
    
    //now check to remove the route.
    cy.get('button[data-testid="header-actions"]').click()
    cy.get('span').contains('Delete').click()
    cy.get('input[data-testid="confirmation-input"]').type(routeName)
    cy.get('button[data-testid="modal-action-button"]').click()

    //check it goes to the correct pannel, 
    //and check the panel should be empty, left only a blue "+ New Route" button
    cy.url().should('include','/default/services/')
    cy.get('a').contains('New Route').should('contains.text','New Route')

    //Now check to remove service
    //click the drag down list.
    cy.get('button[data-testid="header-actions"]').click()
    cy.get('span').contains('Delete').click()
    cy.get('input[data-testid="confirmation-input"]').type(serviceName)
    cy.get('button[data-testid="modal-action-button"]').click()

    //check it goes to the correct pannel, and the panel should be empty, left only a blue "+ New Gateway Service" button
    cy.url().should('include','/default/services')
    cy.get('a').contains('New Gateway Service').should('contains.text','New Gateway Service')

  })

})
