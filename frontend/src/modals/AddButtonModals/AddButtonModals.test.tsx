import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { BrowserRouter } from 'react-router-dom'
import AddButtonModals from './AddButtonModals'

jest.mock('@/env.consts', () => ({
  VITE_BASE_API_URL: 'http://localhost:8000/api/v1',
  DEV: true,
}))

describe('test 1', () => {
  const node = {
    id: 'test',
    data: {
      id: 'test',
      name: 'test',
      buttonsData: {
        rows: 2,
        columns: 2,
        buttons: [],
      },
      response: { id: '1', name: 'test', type: 'text' as const, data: [] },
      conditions: [],
      flags: [],
    },
    position: { x: 0, y: 0 },
  }

  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <ReactFlowProvider defaultNodes={[node]}>
          <AddButtonModals data={node.data} isOpen={true} onClose={() => {}} />
        </ReactFlowProvider>
      </BrowserRouter>,
    )
    expect(screen.getByText('Add buttons')).toBeInTheDocument()
  })

  it('changing columns and rows', async () => {
    render(
      <BrowserRouter>
        <ReactFlowProvider defaultNodes={[node]}>
          <AddButtonModals data={node.data} isOpen={true} onClose={() => {}} />
        </ReactFlowProvider>
      </BrowserRouter>,
    )

    // Выбираем тип кнопок
    const inlineKeyboardRadio = screen.getByTestId('exactMatch')
    await act(async () => {
      fireEvent.click(inlineKeyboardRadio)
    })

    // Изменяем количество колонок
    const columnsInput = screen.getByTestId('columns')
    await act(async () => {
      fireEvent.change(columnsInput, { target: { value: '3' } })
    })

    // Изменяем количество строк
    const rowsInput = screen.getByTestId('rows')
    await act(async () => {
      fireEvent.change(rowsInput, { target: { value: '2' } })
    })

    // Проверяем, что значения изменились
    expect(columnsInput).toHaveValue(3)
    expect(rowsInput).toHaveValue(2)
  })

  it('edit text buttons with exact match', async () => {
    const node = {
      id: 'test',
      data: {
        id: 'test',
        name: 'test',
        buttonsData: {
          rows: 2,
          columns: 2,
          buttons: [],
        },
        response: { id: '1', name: 'test', type: 'text' as const, data: [] },
        conditions: [],
        flags: [],
      },
      position: { x: 0, y: 0 },
    }

    render(
      <BrowserRouter>
        <ReactFlowProvider defaultNodes={[node]}>
          <AddButtonModals data={node.data} isOpen={true} onClose={() => {}} />
        </ReactFlowProvider>
      </BrowserRouter>,
    )

    // Выбираем тип кнопок
    const inlineKeyboardRadio = screen.getByTestId('exactMatch')
    await act(async () => {
      fireEvent.click(inlineKeyboardRadio)
    })

    // Изменяем количество колонок
    const columnsInput = screen.getByTestId('columns')
    await act(async () => {
      fireEvent.change(columnsInput, { target: { value: '2' } })
    })

    // Изменяем количество строк
    const rowsInput = screen.getByTestId('rows')
    await act(async () => {
      fireEvent.change(rowsInput, { target: { value: '2' } })
    })

    const inputButton1 = screen.getByTestId('button-exactMatch-row-0-0')
    await act(async () => {
      fireEvent.change(inputButton1, { target: { value: 'test1' } })
    })

    const inputButton2 = screen.getByTestId('button-exactMatch-row-0-1')
    await act(async () => {
      fireEvent.change(inputButton2, { target: { value: 'test2' } })
    })

    const inputButton3 = screen.getByTestId('button-exactMatch-row-1-0')
    await act(async () => {
      fireEvent.change(inputButton3, { target: { value: 'test3' } })
    })

    const buttonText1 = screen.getByTestId('button-preview-0-0')
    expect(buttonText1).toHaveTextContent('test1')

    const buttonText2 = screen.getByTestId('button-preview-0-1')
    expect(buttonText2).toHaveTextContent('test2')

    const buttonText3 = screen.getByTestId('button-preview-1-0')
    expect(buttonText3).toHaveTextContent('test3')
  })

  it('change button type', async () => {
    render(
      <BrowserRouter>
        <ReactFlowProvider defaultNodes={[node]}>
          <AddButtonModals data={node.data} isOpen={true} onClose={() => {}} />
        </ReactFlowProvider>
      </BrowserRouter>,
    )

    // Выбираем тип кнопок
    const inlineKeyboardRadio = screen.getByTestId('hasCallback')
    await act(async () => {
      fireEvent.click(inlineKeyboardRadio)
    })

    // Изменяем количество колонок
    const columnsInput = screen.getByTestId('columns')
    await act(async () => {
      fireEvent.change(columnsInput, { target: { value: '2' } })
    })

    // Изменяем количество строк
    const rowsInput = screen.getByTestId('rows')
    await act(async () => {
      fireEvent.change(rowsInput, { target: { value: '2' } })
    })

    const inputButton1 = screen.getByTestId('button-hasCallback-row-0-0')
    await act(async () => {
      fireEvent.change(inputButton1, { target: { value: 'test1' } })
    })

    const inputButton2 = screen.getByTestId('button-hasCallback-row-0-1')
    await act(async () => {
      fireEvent.change(inputButton2, { target: { value: 'test2' } })
    })

    const inputButton3 = screen.getByTestId('button-hasCallback-row-1-0')
    await act(async () => {
      fireEvent.change(inputButton3, { target: { value: 'test3' } })
    })

    const buttonText1 = screen.getByTestId('button-preview-0-0')
    expect(buttonText1).toHaveTextContent('button 1')

    const buttonText2 = screen.getByTestId('button-preview-0-1')
    expect(buttonText2).toHaveTextContent('button 2')

    const buttonText3 = screen.getByTestId('button-preview-1-0')
    expect(buttonText3).toHaveTextContent('button 3')
  })
})

describe('test 2', () => {
  const node = {
    id: 'test',
    data: {
      id: 'test',
      name: 'test',
      buttonsData: {
        rows: 2,
        columns: 2,
        buttons: [
          [
            { text: 'test 1', id: '1', type: 'exactMatch' },
            { text: 'test 2', id: '2', type: 'exactMatch' },
          ],
          [
            { text: 'test 3', id: '3', type: 'exactMatch' },
            { text: 'test 4', id: '4', type: 'exactMatch' },
          ],
        ],
      },
      response: { id: '1', name: 'test', type: 'text' as const, data: [] },
      conditions: [],
      flags: [],
    },
    position: { x: 0, y: 0 },
  }

  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <ReactFlowProvider defaultNodes={[node]}>
          <AddButtonModals data={node.data} isOpen={true} onClose={() => {}} />
        </ReactFlowProvider>
      </BrowserRouter>,
    )
    expect(screen.getByText('Add buttons')).toBeInTheDocument()
  })

  it('Correct display of data from the server', async () => {
    render(
      <BrowserRouter>
        <ReactFlowProvider defaultNodes={[node]}>
          <AddButtonModals data={node.data} isOpen={true} onClose={() => {}} />
        </ReactFlowProvider>
      </BrowserRouter>,
    )

    const exactMatchRadio = screen.getByTestId('exactMatch')
    expect(exactMatchRadio).toHaveAttribute('data-selected', 'true')

    const inputButton1 = screen.getByTestId('button-exactMatch-row-0-0')
    expect(inputButton1).toHaveValue('test 1')

    const inputButton2 = screen.getByTestId('button-exactMatch-row-0-1')
    expect(inputButton2).toHaveValue('test 2')

    const inputButton3 = screen.getByTestId('button-exactMatch-row-1-0')
    expect(inputButton3).toHaveValue('test 3')

    const inputButton4 = screen.getByTestId('button-exactMatch-row-1-1')
    expect(inputButton4).toHaveValue('test 4')
  })
})

describe('test 3', () => {
  const node = {
    id: 'test',
    data: {
      id: 'test',
      name: 'test',
      buttonsData: {
        rows: 2,
        columns: 2,
        buttons: [
          [
            { text: 'test 1', id: '1', type: 'exactMatch' },
            { text: 'test 2', id: '2', type: 'exactMatch' },
          ],
          [
            { text: 'test 3', id: '3', type: 'exactMatch' },
            { text: 'test 4', id: '4', type: 'exactMatch' },
          ],
        ],
      },
      response: { id: '1', name: 'test', type: 'text' as const, data: [] },
      conditions: [],
      flags: [],
    },
    position: { x: 0, y: 0 },
  }

  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <ReactFlowProvider defaultNodes={[node]}>
          <AddButtonModals data={node.data} isOpen={true} onClose={() => {}} />
        </ReactFlowProvider>
      </BrowserRouter>,
    )
    expect(screen.getByText('Add buttons')).toBeInTheDocument()
  })

  it('add response data', async () => {
    render(
      <BrowserRouter>
        <ReactFlowProvider defaultNodes={[node]}>
          <AddButtonModals data={node.data} isOpen={true} onClose={() => {}} />
        </ReactFlowProvider>
      </BrowserRouter>,
    )

    const addConditionsButton = screen.getByTestId('addConditions')
    await act(async () => {
      fireEvent.click(addConditionsButton)
    })
  })
})
