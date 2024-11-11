describe('kong cp smoke test', () => {
  beforeEach(() => {
    //visit kong cp home page
    cy.visit('http://localhost:8002/workspaces')
  })
             
  it('Check: click default workspace from kong cp homepage ', () => {
    //find the default workspace link, and click.
    cy.get('.workspace-name').should('have.text', 'default')
    cy.get('.workspace-name').click()

    //check the default page is loaded.
    cy.get('.title').should('have.text','Overview')
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

})
