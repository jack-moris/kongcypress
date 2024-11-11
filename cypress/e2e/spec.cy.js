describe('kong cp smoke test', () => {
  beforeEach(() => {
    //visit home page
    cy.visit('http://localhost:8002/workspaces')
  }
             
  it('click default workspace ', () => {
    cy.get('.workspace-name').should('have.text', 'default')
    cy.get('.workspace-name').click()
  })
})
