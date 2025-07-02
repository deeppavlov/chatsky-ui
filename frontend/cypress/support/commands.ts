/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('saveFlow', () => {
  cy.get('body').trigger('keydown', {
    code: 'KeyS',
    ctrlKey: true,
    bubbles: true,
  })
  cy.wait(500)
})

Cypress.Commands.add(
  'changeNodeResponse',
  (nodeId: string, responseData: { title: string; response: string }) => {
    const { title, response } = responseData
    cy.get(`#${nodeId}`).find('button[data-testid=response-edit-btn]').click()
    cy.get('[data-testid=response-modal]')
      .should('exist')
      .find('input')
      .first()
      .clear()
      .type(title)
    cy.get('[data-testid=response-modal]')
      .should('exist')
      .find('textarea')
      .clear()
      .type(response)
    cy.get('[data-testid=response-modal]').contains('button', 'Save').click()
  },
)

Cypress.Commands.add('resetFlow', () => {
  cy.fixture('emptyFlow.json').then((flowData) => {
    cy.request('POST', 'http://localhost:8000/api/v1/flows/', flowData)
  })
})
