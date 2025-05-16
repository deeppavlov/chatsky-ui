import { LlmContext } from '@/contexts/llmContext'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { responseType } from '@/types/ResponseTypes'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import LLMResponse from './LLMResponse'

jest.mock('@/env.consts', () => ({
  VITE_BASE_API_URL: 'http://localhost:8000/api/v1',
  DEV: true,
}))

const mockLlmResponse: responseType = {
  id: '',
  name: 'LLM_response',
  type: 'llm',
  data: [
    {
      priority: 1,
      llm: {
        context_memory_index: 12,
        prompt: 'Default prompt',
        llm_config_id: 'config1',
      },
    },
  ],
}
const mockResponseStor: { [key: string]: responseType } = {
  llm: {
    id: '',
    name: 'LLM_response',
    type: 'llm',
    data: [
      {
        priority: 1,
        llm: {
          context_memory_index: 12,
          prompt: 'Default prompt',
          llm_config_id: 'config1',
        },
      },
    ],
  },
}
const mockSetData = jest.fn()
const mockSetNameError = jest.fn()
const mockNameError = { isInvalid: false, errorMessage: '' }

const mockProviderValues = {
  llmProviders: {
    openai: ['gpt-3.5-turbo', 'gpt-4'],
    anthropic: ['claude-2', 'claude-instant-1'],
  },
  tokens: {
    token1: { name: 'OpenAI_Token', provider: 'openai' },
    token2: { name: 'Claude_Token', provider: 'anthropic' },
  },
  setTokens: jest.fn(),
  llmConfigs: {
    config1: {
      config_name: 'Config_1',
      model_name: 'gpt-3.5-turbo',
      token_id: 'token1',
      system_prompt: 'Default prompt',
    },
    config2: {
      config_name: 'Config_2',
      model_name: 'claude-2',
      token_id: 'token2',
      system_prompt: '',
    },
  },
  setLlmConfigs: jest.fn(),
  editingConfig: null,
  setEditingConfig: jest.fn(),
  defaultLlmConfig: {
    id: 'config1',
    config_name: 'Config 1',
    model_name: 'gpt-3.5-turbo',
    token_id: 'token1',
    system_prompt: 'Default prompt',
  },
  setDefaultLlmConfig: jest.fn(),
}

describe('LLMResponse Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderResponse = (
    response = mockLlmResponse,
    error = mockNameError,
  ) => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <LlmContext.Provider value={mockProviderValues}>
              <LLMResponse
                response={response}
                responseStor={mockResponseStor}
                nameError={error}
                setNameError={mockSetNameError}
                setData={mockSetData}
              />
            </LlmContext.Provider>
          ),
        },
      ],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)
  }

  it('renders correctly with LLM response data', async () => {
    renderResponse()

    expect(screen.getByTestId('llmResponse-name')).toHaveValue('LLM_response')
    expect(screen.getByTestId('llmResponse-config')).toHaveTextContent(
      'Config_1',
    )
    expect(screen.getByTestId('llmResponse-prompt')).toHaveValue(
      'Default prompt',
    )
    const contextMemoryInput = screen
      .getByRole('textbox', { name: '' })
      .closest('input[name="context_memory_index"]')
    expect(contextMemoryInput).toHaveValue('12')
  })

  it('renders correctly without LLM response data', async () => {
    renderResponse(
      {
        id: '',
        name: '',
        type: 'llm',
        data: [
          {
            priority: 1,
            llm: {
              context_memory_index: 0,
              prompt: '',
              llm_config_id: 'wrong id',
            },
          },
        ],
      },
      { isInvalid: true, errorMessage: 'Please fill every field' },
    )

    const nameInput = screen.getByTestId('llmResponse-name')

    expect(nameInput).toHaveAttribute('placeholder', 'Enter response name')
    expect(screen.getByText('Please fill every field')).toBeInTheDocument()
    expect(screen.getByTestId('llmResponse-config')).toHaveTextContent(
      'Select LLM configuration',
    )
    expect(screen.getByTestId('llmResponse-prompt')).toHaveValue('')
    const contextMemoryInput = screen
      .getByRole('textbox', { name: '' })
      .closest('input[name="context_memory_index"]')
    expect(contextMemoryInput).toHaveValue('0')

    fireEvent.change(nameInput, { target: { value: 'Name' } })

    expect(mockSetNameError).toHaveBeenCalledWith({
      isInvalid: false,
      errorMessage: '',
    })
  })

  it('call setData when parameters are changed', async () => {
    renderResponse()

    const nameInput = screen.getByTestId('llmResponse-name')

    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    expect(mockSetData).toHaveBeenCalled()

    const newResponse = mockSetData.mock.calls[0][0]
    expect(newResponse).toEqual({
      ...mockLlmResponse,
      name: 'New_Name',
    })

    mockSetData.mockClear()

    const promptInput = screen.getByTestId('llmResponse-prompt')

    fireEvent.change(promptInput, { target: { value: 'New prompt' } })
    expect(mockSetData).toHaveBeenCalledTimes(1)

    const updaterFn = mockSetData.mock.calls[0][0]
    const result = updaterFn(mockLlmResponse)
    expect(result).toEqual({
      ...mockLlmResponse,
      data: [
        {
          ...mockLlmResponse.data[0],
          llm: {
            ...mockLlmResponse.data[0].llm,
            prompt: 'New prompt',
          },
        },
      ],
    })
  })
})
