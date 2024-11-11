describe('kong cp smoke test', () => {
  beforeEach(() => {
    //visit kong cp home page
    cy.visit('http://localhost:8002/workspaces')
  })
             
  it('click default workspace ', () => {
    //find the default workspace link, and click.
    cy.get('.workspace-name').should('have.text', 'default')
    cy.get('.workspace-name').click()

    //check the default page is loaded.
    cy.get('.title').should('have.text','Overview')
    cy.url().should('include', '/default/overview')
  })

})
