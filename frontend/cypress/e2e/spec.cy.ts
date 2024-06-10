/* eslint-disable @typescript-eslint/no-explicit-any */
describe("check run and edit flow", () => {
  it("add run edit flow", () => {
    cy.visit("http://localhost:8000/app/home")
    cy.location("pathname").should("eq", "/app/home")
    cy.get("[data-testid=create-flow-btn]").should("exist")
    cy.get("[data-testid=create-flow-btn]").click({ force: true })
    cy.get("[data-testid=flow-name-input]").should("exist")
    cy.get("[data-testid=flow-name-input]").click({ force: true }).type("flow1")
    cy.get("[data-testid=flow-color-FFCC00]").should("exist")
    cy.get("[data-testid=flow-color-FFCC00]").click({ force: true })
    cy.wait(100)
    cy.get("[data-testid=flow-save-btn").should("exist")
    cy.get("[data-testid=flow-save-btn").click({ force: true })
    cy.get("[data-testid=flow1-edit-btn]").should("exist")
    cy.get("[data-testid=flow1-edit-btn]").click({ force: true })
    cy.location("pathname").should("eq", "/app/flow/flow1")
    cy.get("[data-testid=flow-page]").should("exist")
    cy.get("[data-testid=nodes-collapse-btn]").click({ force: true })
    cy.wait(500)
    cy.get("[data-testid=default_node-item]").should("exist")
    let nodes: any[] = []
    cy.request("http://localhost:8000/api/v1/flows").then((response) => {
      nodes = response.body.data.flows.find((flow) => flow.name === "flow1").data.nodes
      console.log(nodes)
    })
    const dataTransfer = new DataTransfer()
    cy.get("[data-testid=default_node-item]").trigger("dragstart", { dataTransfer })
    cy.get("[data-testid=rf__wrapper]").trigger("drop", { dataTransfer })
    cy.get("[data-testid=defaultnode-add-condition-btn]").should("exist")
    cy.get("[data-testid=defaultnode-add-condition-btn]").click({ force: true })
    cy.wait(300)
    cy.get("[data-testid=python-condition-editor]").should("exist")
    cy.get("[data-testid=python-condition-editor]").type('if False: print("hello")')
    cy.get("[data-testid=save-condition-button]").should("exist").click({ force: true })
    cy.get("[data-testid=rf__wrapper]").trigger("keydown", { ctrlKey: true, key: "s" })
    cy.wait(500)
    cy.get("[data-testid=build-btn]").should("exist")
    cy.get("[data-testid=build-btn]").click()
    cy.wait(4000)
    cy.get("[data-testid=build-menu-open-btn]").should("exist")
    cy.get("[data-testid=build-menu-open-btn]").click()
    cy.wait(300)
    cy.get("[data-testid=run-btn]").should("exist")
    cy.get("[data-testid=run-btn]").click()
    cy.wait(1000)
    cy.get("[data-testid=chat-btn]").should("exist")
    cy.get("[data-testid=chat-btn]").click()
    cy.get("[data-testid=chat-input]").should("exist")
    cy.get("[data-testid=chat-input]").click()
    cy.get("[data-testid=chat-input]").type("hello")
    cy.get("[data-testid=chat-send]").should("exist")
    cy.get("[data-testid=chat-send]").click()
    cy.wait(300)
    cy.get("[data-testid=bot-message]").should("exist")
    cy.wrap(null).then(() => {
      let currNodes: any[] = []
      cy.request("http://localhost:8000/api/v1/flows").then((response) => {
        currNodes = response.body.data.flows.find((flow) => flow.name === "flow1").data.nodes
        expect(currNodes.length - 1).to.eq(nodes.length)
        const node = cy.get(`#${currNodes[currNodes.length - 1].id}`)
        node.should("exist")
        node.click({ force: true })
        const deletebtn = cy.get("[data-testid=header-button-delete-node]")
        deletebtn.should("exist")
        deletebtn.click()
        cy.request("http://localhost:8000/api/v1/flows").then((response) => {
          currNodes = response.body.data.flows.find((flow) => flow.name === "flow1").data.nodes
          expect(currNodes.length).to.eq(nodes.length)
        })
        cy.visit("http://localhost:8000/app/home")
        cy.get("[data-testid=flow1-delete-btn]").should("exist")
        cy.get("[data-testid=flow1-delete-btn]").click({ force: true })
        cy.get("[data-testid=flow1-edit-btn]").should("not.exist")
      })
    })
  })
})
