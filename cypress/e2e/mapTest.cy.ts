describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/')
    
  
    cy.get('.ol-zoom-in').click()
    cy.get('.ol-zoom-out').click()
    cy.get('.ol-zoom-out').click()

    cy.get('.ol-viewport').should('exist').and('be.visible')

    cy.get('.ol-zoom-out').click().wait(200);

    if(cy.get('.ol-viewport').should('exist').and('be.visible')) {
    // click on the top right corner of the map
    cy.get('.ol-viewport').click('topRight');
    }       

  })
})
