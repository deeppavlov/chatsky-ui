declare namespace Cypress {
  interface Chainable {
    saveFlow(): Chainable<void>
    resetFlow(): Chainable<void>
    changeNodeResponse(
      nodeId: string,
      responseData: { title: string; response: string },
    ): Chainable<void>
  }
}
