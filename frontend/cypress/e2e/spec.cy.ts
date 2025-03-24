const flow1NodeResponses = [
  { title: 'testFlow1_node_1_response', response: 'starting node response' },
  {
    title: 'testFlow1_node_2_response',
    response: 'slots condition is successful',
  },
  { title: 'testFlow1_node_3_response', response: 'priority doesnt work' },
  {
    title: 'testFlow1_node_4_response',
    response: 'priority condition is successful',
  },
  {
    title: 'testFlow1_node_5_response',
    response: 'all of condition is successful',
  },
]
const flow2NodeResponses = [
  {
    title: 'testFlow2_node_1_response',
    response: "'any of' condition and link to testFlow2 is successful",
  },
  { title: 'testFlow2_node_2_response', response: 'exact match is successful' },
  {
    title: 'testFlow2_node_3_response',
    response: 'regular expression is successful',
  },
  { title: 'testFlow2_node_4_response', response: 'not has is successful' },
  { title: 'testFlow2_node_5_response', response: 'python is successful' },
]

const testText1 = 'test_text_1'
const testText2 = 'another_test_text'

describe('Flow creation and editing process', () => {
  before(() => {
    cy.resetFlow()
  })

  const dataTransfer = new DataTransfer()

  it('creates two flows', () => {
    cy.visit('/home')
    cy.location('pathname').should('eq', '/app/home')
    cy.get('[data-testid=create-flow-btn]')
      .should('exist')
      .click({ force: true })
    cy.get('[data-testid=flow-name-input]')
      .should('exist')
      .click({ force: true })
      .type('testFlow1')
    cy.get('[data-testid=flow-color-3300FF]')
      .should('exist')
      .click({ force: true })
    cy.get('[data-testid=flow-create-btn')
      .should('exist')
      .click({ force: true })
    cy.get('[data-testid=create-flow-btn]').click({ force: true })
    cy.get('[data-testid=flow-name-input]')
      .click({ force: true })
      .type('testFlow2')
    cy.get('[data-testid=flow-color-FF3366]')
      .should('exist')
      .click({ force: true })
    cy.get('[data-testid=flow-create-btn')
      .should('exist')
      .click({ force: true })
    cy.get('[data-testid=flow-card').should('have.length', 3)
  })

  it('adds nodes to the created flows', () => {
    cy.visit('/home')
    // переход в флоу testFlow1, добавляем ноды
    cy.get('[data-testid=testFlow1-edit-btn]')
      .should('exist')
      .click({ force: true })
    cy.location('pathname').should('eq', '/app/flow/testFlow1')
    cy.get('[data-testid=nodes-collapse-btn]').click({ force: true })

    // default nodes
    Cypress._.times(5, (index) => {
      cy.get('[data-testid=default_node-item]').trigger('dragstart', {
        dataTransfer,
      })
      cy.get('[data-testid=rf__wrapper]').trigger('drop', {
        x: 96 + index * 480,
        y: 384,
        dataTransfer,
        force: true,
      })
    })

    //slots node
    cy.get('[data-testid=slots_node-item]').trigger('dragstart', {
      dataTransfer,
    })
    cy.get('[data-testid=rf__wrapper]').trigger('drop', {
      dataTransfer,
      x: 96,
      y: 96,
    })

    // переходим в testFlow2, добавляем ноды
    cy.get('[data-testid=flowItem-testFlow2]').should('exist').click()
    cy.location('pathname').should('eq', '/app/flow/testFlow2')
    cy.get('[data-testid=flow-page]').should('exist')
    cy.get('[data-testid=default_node-item]').should('exist')
    Cypress._.times(5, (index) => {
      cy.get('[data-testid=default_node-item]').trigger('dragstart', {
        dataTransfer,
      })
      cy.get('[data-testid=rf__wrapper]').trigger('drop', {
        x: 96 + index * 480,
        y: 384,
        dataTransfer,
        force: true,
      })
    })

    // возвращаемся в testFlow1 и добавляем link node
    cy.get('[data-testid=flowItem-testFlow1]').should('exist').click()
    cy.location('pathname').should('eq', '/app/flow/testFlow1')

    cy.get('[data-testid=links-collapse-btn]').click({ force: true })
    cy.get('[data-testid=link_node-item]')
      .should('exist')
      .trigger('dragstart', {
        dataTransfer,
      })
    cy.get('[data-testid=rf__wrapper]').trigger('drop', {
      x: 2496,
      y: 384,
      dataTransfer,
      force: true,
    })
    // привязываем Link к testFlow2
    cy.get('[data-testid=linkNode-flowSelect]').click()
    cy.get('ul[data-slot="listbox"]').find('li').contains('testFlow2').click()
    cy.get('[data-testid=linkNode-nodeSelect]').click()
    cy.get('ul[data-slot="listbox"]').find('li').first().click()
    cy.get('[data-testid="linkNodeModal"]')
      .find('button')
      .contains('Save')
      .click()

    cy.saveFlow()
  })

  it('edits nodes in testFlow1', () => {
    cy.visit('/home')
    cy.get('[data-testid=testFlow1-edit-btn]').click({ force: true })

    cy.request('http://localhost:8000/api/v1/flows').then((response) => {
      const flow1NodeIds: string[] = response.body.data.flows
        .find((flow) => flow.name === 'testFlow1')
        .data.nodes.map((node) => node.id)

      const defaultNodesIds = [...flow1NodeIds].filter((id) =>
        id.includes('default_node'),
      )
      const slotsNodeId = [...flow1NodeIds].find((id) =>
        id.includes('slots_node'),
      )

      // добавляем slots group
      cy.get(`[data-testid=${slotsNodeId}]`)
        .should('exist')
        .find('button[data-testid=slots-add-group-btn]')
        .click()
      cy.get('input[data-testid=slots-group-name]').clear().type('Test group')
      cy.get('input[data-testid=slot-name]').clear().type('Test slot 1')
      cy.get('textarea[data-testid=slot-value]').type('^[A-Za-z]+$')
      cy.get('[data-testid=slots-group-modal]')
        .contains('button', 'Save')
        .click()

      // node 1
      cy.changeNodeResponse(defaultNodesIds[0], flow1NodeResponses[0])
      // добавляем кондишен
      cy.get(`#${defaultNodesIds[0]}`)
        .find('button[data-testid=add-condition-btn]')
        .click()
      cy.get('[data-testid=condition-modal]')
        .find('[data-testid=tab-slot]')
        .click()
      cy.get('input[data-testid=condition-name]')
        .clear()
        .type('Test_slots_condition')
      cy.get('[data-testid=slot-search] input').type('Test slot 1')
      cy.get('[data-testid=slot-search]').contains('div', 'Test slot 1').click()
      cy.get('[data-testid=condition-modal]').contains('button', 'Save').click()

      // node 2
      cy.changeNodeResponse(defaultNodesIds[1], flow1NodeResponses[1])
      // добавляем кондишен
      cy.get(`#${defaultNodesIds[1]}`)
        .should('exist')
        .find('button[data-testid=add-condition-btn]')
        .click()
      cy.get('[data-testid=condition-modal]')
        .find('[data-testid=tab-basic]')
        .click()
      cy.get('input[data-testid=condition-name]')
        .clear()
        .type('Basic_condition_P-1')
      cy.get('input[data-testid=condition-priority]').clear().type('1')
      cy.get('[data-testid=structure-select]').click()
      cy.get('[data-testid=selectItem-include-text]').click()
      cy.get('[data-testid=basic-condition-text]').type(testText1)
      cy.get('[data-testid=condition-modal]').contains('button', 'Save').click()

      cy.get(`#${defaultNodesIds[1]}`)
        .should('exist')
        .find('button[data-testid=add-condition-btn]')
        .click()
      cy.get('[data-testid=condition-modal]')
        .find('[data-testid=tab-basic]')
        .click()
      cy.get('input[data-testid=condition-name]')
        .clear()
        .type('Basic_condition_P-2')
      cy.get('input[data-testid=condition-priority]').clear().type('2')
      cy.get('[data-testid=structure-select]').click()
      cy.get('[data-testid=selectItem-include-text]').click()
      cy.get('[data-testid=basic-condition-text]').type(testText1)
      cy.get('[data-testid=condition-modal]').contains('button', 'Save').click()

      // node 3
      cy.changeNodeResponse(defaultNodesIds[2], flow1NodeResponses[2])

      // node 4
      cy.changeNodeResponse(defaultNodesIds[3], flow1NodeResponses[3])
      // добавляем кондишен
      cy.get(`#${defaultNodesIds[3]}`)
        .should('exist')
        .find('button[data-testid=add-condition-btn]')
        .click()
      cy.get('[data-testid=condition-modal]')
        .find('[data-testid=tab-basic]')
        .click()
      cy.get('input[data-testid=condition-name]')
        .clear()
        .type('All_of_condition')
      cy.get('[data-testid=structure-select]').click()
      cy.get('[data-testid=selectItem-all-of]').click()

      cy.get('[data-testid=condition-modal]')
        .contains('button', 'Add condition')
        .click()
      cy.get('[data-testid=substructure-select]').click()
      cy.get('[data-testid=selectItem-include-text]').click()
      cy.get('[data-testid=basic-condition-text]').type(testText1)

      cy.get('[data-testid=condition-modal]')
        .contains('button', 'Add condition')
        .click()
      cy.get('[data-testid=substructure-select]').click()
      cy.get('[data-testid=selectItem-include-text]').click()
      cy.get('[data-testid=basic-condition-text]').eq(1).type(testText2)
      cy.get('[data-testid=condition-modal]').contains('button', 'Save').click()

      // node 5
      cy.changeNodeResponse(defaultNodesIds[4], flow1NodeResponses[4])
      // добавляем кондишен
      cy.get(`#${defaultNodesIds[4]}`)
        .should('exist')
        .find('button[data-testid=add-condition-btn]')
        .click()
      cy.get('[data-testid=condition-modal]')
        .find('[data-testid=tab-basic]')
        .click()
      cy.get('input[data-testid=condition-name]')
        .clear()
        .type('Any_of_condition')
      cy.get('[data-testid=structure-select]').click()
      cy.get('[data-testid=selectItem-any-of]').click()

      cy.get('[data-testid=condition-modal]')
        .contains('button', 'Add condition')
        .click()
      cy.get('[data-testid=substructure-select]').click()
      cy.get('[data-testid=selectItem-include-text]').click()
      cy.get('[data-testid=basic-condition-text]').type(testText1)

      cy.get('[data-testid=condition-modal]')
        .contains('button', 'Add condition')
        .click()
      cy.get('[data-testid=substructure-select]').click()
      cy.get('[data-testid=selectItem-include-text]').click()
      cy.get('[data-testid=basic-condition-text]').eq(1).type(testText2)
      cy.get('[data-testid=condition-modal]').contains('button', 'Save').click()
    })

    cy.saveFlow()
  })

  it('edits nodes in testFlow2', () => {
    cy.visit('/home')
    cy.get('[data-testid=testFlow2-edit-btn]').click({ force: true })

    cy.request('http://localhost:8000/api/v1/flows').then((response) => {
      const flow2NodeIds: string[] = response.body.data.flows
        .find((flow) => flow.name === 'testFlow2')
        .data.nodes.map((node) => node.id)

      // node 1
      cy.changeNodeResponse(flow2NodeIds[0], flow2NodeResponses[0])
      // добавляем кондишен
      cy.get(`#${flow2NodeIds[0]}`)
        .should('exist')
        .find('button[data-testid=add-condition-btn]')
        .click()
      cy.get('[data-testid=condition-modal]')
        .find('[data-testid=tab-basic]')
        .click()
      cy.get('input[data-testid=condition-name]')
        .clear()
        .type('Exact_match_condition')
      cy.get('[data-testid=structure-select]').click()
      cy.get('[data-testid=selectItem-exact-match]').click()
      cy.get('[data-testid=basic-condition-text]').type(testText1)
      cy.get('[data-testid=condition-modal]').contains('button', 'Save').click()

      // node 2
      cy.changeNodeResponse(flow2NodeIds[1], flow2NodeResponses[1])
      // добавляем кондишен
      cy.get(`#${flow2NodeIds[1]}`)
        .should('exist')
        .find('button[data-testid=add-condition-btn]')
        .click()
      cy.get('[data-testid=condition-modal]')
        .find('[data-testid=tab-basic]')
        .click()
      cy.get('input[data-testid=condition-name]')
        .clear()
        .type('Regular_expression_condition')
      cy.get('[data-testid=structure-select]').click()
      cy.get('[data-testid=selectItem-regular-expression]').click()
      cy.get('[data-testid=regexp-pattern]').type(`${testText1}`)
      cy.get('[data-testid=condition-modal]').contains('button', 'Save').click()

      // node 3
      cy.changeNodeResponse(flow2NodeIds[2], flow2NodeResponses[2])
      // добавляем кондишен
      cy.get(`#${flow2NodeIds[2]}`)
        .should('exist')
        .find('button[data-testid=add-condition-btn]')
        .click()
      cy.get('[data-testid=condition-modal]')
        .find('[data-testid=tab-basic]')
        .click()
      cy.get('input[data-testid=condition-name]')
        .clear()
        .type('Not_has_text_condition')
      cy.get('[data-testid=structure-select]').click()
      cy.get('[data-testid=selectItem-not]').click()
      cy.get('[data-testid=substructure-select]').click()
      cy.get('[data-testid=selectItem-include-text]').click()
      cy.get('[data-testid=basic-condition-text]').type(testText1)
      cy.get('[data-testid=condition-modal]').contains('button', 'Save').click()

      // node 4
      cy.changeNodeResponse(flow2NodeIds[3], flow2NodeResponses[3])
      // добавляем кондишен
      cy.get(`#${flow2NodeIds[3]}`)
        .should('exist')
        .find('button[data-testid=add-condition-btn]')
        .click()
      cy.get('input[data-testid=condition-name]')
        .clear()
        .type('Python_condition')
      cy.get('[data-testid=python-condition-editor]')
        .should('exist')
        .clear()
        .type('{home}{downarrow}{downarrow}')
        .type('        return len(ctx.last_request.text) > 10')
        .should('contain', 'return len(ctx.last_request.text) > 10')
      cy.get('[data-testid=condition-modal]').contains('button', 'Save').click()

      // node 5
      cy.changeNodeResponse(flow2NodeIds[4], flow2NodeResponses[4])
    })
    cy.saveFlow()
  })

  it('links the nodes', () => {
    cy.visit('/home')
    cy.get('[data-testid=testFlow1-edit-btn]').click({ force: true })

    cy.request('http://localhost:8000/api/v1/flows').then((response) => {
      const flow1NodesWithEdges = response.body.data.flows
        .find((flow) => flow.name === 'testFlow1')
        .data.nodes.filter((n) => !n.id.includes('slots_node'))

      const flow1EdgePairs: Array<[string, string]> =
        flow1NodesWithEdges.reduce((acc, node, i, nodes) => {
          if (
            node.id.includes('link_node') ||
            i === nodes.length - 1 ||
            i === 2 // тупиковая нода
          ) {
            return acc
          }
          if (node.data.conditions.length === 2) {
            const from1 = node.data.conditions.at(0).id
            const from2 = node.data.conditions.at(1).id
            const to1 = nodes.at(i + 1).id
            const to2 = nodes.at(i + 2).id
            return [...acc, [from1, to1], [from2, to2]]
          }
          const from = node.data.conditions.at(0).id
          const to = nodes.at(i + 1).id
          return [...acc, [from, to]]
        }, [])

      const flow2Nodes = response.body.data.flows.find(
        (flow) => flow.name === 'testFlow2',
      ).data.nodes

      const flow2EdgePairs: Array<[string, string]> = flow2Nodes.reduce(
        (acc, node, i, nodes) => {
          if (i === nodes.length - 1) {
            return acc
          }
          const from = node.data.conditions.at(0).id
          const to = nodes.at(i + 1).id
          return [...acc, [from, to]]
        },
        [],
      )

      flow1EdgePairs.forEach(([from, to]) => {
        cy.get(`[data-testid=${from}-output-handle]`).click({ force: true })
        cy.get(`[data-testid=${to}-input-handle]`).click({ force: true })
      })

      cy.get('[data-testid=flowItem-testFlow2]').should('exist').click()
      flow2EdgePairs.forEach(([from, to]) => {
        cy.get(`[data-testid=${from}-output-handle]`).click({ force: true })
        cy.get(`[data-testid=${to}-input-handle]`).click({ force: true })
      })

      cy.saveFlow()
    })
  })
})

describe('build and run', () => {
  before(() => {
    cy.request('http://localhost:8000/api/v1/bot/run/stop_all')
  })
  it('builds and runs the flow', () => {
    cy.visit('/flow/testFlow2?page=deliver')
    cy.wait(500)
    cy.get('[data-testid=alive-run]').should('not.exist')
    cy.get('[data-testid=build-and-run-btn]').should('exist').click()
    cy.get('[data-testid=alive-run]', { timeout: 15000 }).should('exist')
    cy.wait(1000) // ждём для того, чтобы обновился бэкенд и эндпоинт /bot/runs в следующем тесте возвращал ран со статусом alive
  })
})

describe('chat', () => {
  after(() => {
    cy.visit('/home')
    cy.request('http://localhost:8000/api/v1/bot/run/stop_all')
    cy.resetFlow()
  })

  it('checks bot responses correctness', () => {
    cy.visit('/flow/testFlow1?page=inspect')
    cy.get('[data-testid=bot-message]').should('not.exist')

    const messages = [
      'wrong text!!!',
      'slots',
      `test "include" condition and priority: ${testText1}`,
      `test "all of" condition: ${testText1} and ${testText2}`,
      `test "any of" condition: ${testText1}`,
      `${testText1}`,
      `test "regexp" condition: ${testText1}`,
      'test "not has" condition',
      'test "python" condition (length > 10)',
      'wrong text',
    ]
    const responses = [...flow1NodeResponses, ...flow2NodeResponses].map(
      (r) => r.response,
    )

    const checkMessage = (message, response) => {
      cy.get('[data-testid=chat-input]')
        .should('not.be.disabled')
        .type(`${message}{enter}`)
      cy.get('[data-testid=bot-message]').contains(response)
    }

    checkMessage(messages[0], responses[0])
    checkMessage(messages[1], responses[1])
    checkMessage(messages[2], responses[3])
    checkMessage(messages[3], responses[4])
    checkMessage(messages[4], responses[5])
    checkMessage(messages[5], responses[6])
    checkMessage(messages[6], responses[7])
    checkMessage(messages[7], responses[8])
    checkMessage(messages[8], responses[9])
    checkMessage(messages[9], responses[0])
  })
})
