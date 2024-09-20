describe('template spec', () => {
  it('passes', () => {
    cy.visit(' http://localhost:5173/')
    // check zoom in and out buttons
    cy.get('.ol-zoom-in').click()
    cy.get('.ol-zoom-out').click()
    cy.get('.ol-zoom-out').click()

    // get the map from canvas
    cy.get('.ol-viewport').should('exist')
    cy.get('.ol-viewport').should('be.visible')
  
    // now click the coordinates inside the map, get the coordinates from the console canvasXCoordinate, canvasYCoordinate
   
    cy.get('canvas').click(100, 100)
  })
  
  
})