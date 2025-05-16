import { LlmContext } from '@/contexts/llmContext'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { conditionType } from '@/types/ConditionTypes'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import LLMConditionSection from './LLMConditionSection'

jest.mock('@/env.consts', () => ({
  VITE_BASE_API_URL: 'http://localhost:8000/api/v1',
  DEV: true,
}))

const mockLlmCondition: conditionType = {
  id: 'condition_id',
  name: 'LLM_Condition',
  type: 'llm',
  data: {
    priority: 1,
    transition_type: 'manual',
    llm: {
      prompt: 'Default prompt',
      llm_config_id: 'config1',
    },
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

  const renderCondition = (
    condition = mockLlmCondition,
    error = mockNameError,
  ) => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <LlmContext.Provider value={mockProviderValues}>
              <LLMConditionSection
                condition={condition}
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
    renderCondition()

    expect(screen.getByTestId('llmCondition-name')).toHaveValue('LLM_Condition')
    expect(screen.getByTestId('llmCondition-config')).toHaveTextContent(
      'Config_1',
    )
    expect(screen.getByTestId('llmCondition-prompt')).toHaveValue(
      'Default prompt',
    )
  })

  it('renders correctly without LLM response data', async () => {
    renderCondition(
      {
        id: '',
        name: '',
        type: 'llm',
        data: {
          priority: 1,
          transition_type: 'manual',
          llm: {
            prompt: '',
            llm_config_id: 'wrong_id',
          },
        },
      },
      { isInvalid: true, errorMessage: 'Please fill every field' },
    )

    const nameInput = screen.getByTestId('llmCondition-name')
    expect(nameInput).toHaveAttribute('placeholder', 'Enter condition name')
    expect(screen.getByText('Please fill every field')).toBeInTheDocument()
    expect(screen.getByTestId('llmCondition-config')).toHaveTextContent(
      'Select LLM configuration',
    )
    expect(screen.getByTestId('llmCondition-prompt')).toHaveValue('')

    fireEvent.change(nameInput, { target: { value: 'Name' } })

    expect(mockSetNameError).toHaveBeenCalledWith({
      isInvalid: false,
      errorMessage: '',
    })
  })

  it('call setData when parameters are changed', async () => {
    renderCondition()

    const nameInput = screen.getByTestId('llmCondition-name')

    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    expect(mockSetData).toHaveBeenCalled()

    const newCondition = mockSetData.mock.calls[0][0]
    expect(newCondition).toEqual({
      ...mockLlmCondition,
      name: 'New_Name',
    })

    mockSetData.mockClear()

    const promptInput = screen.getByTestId('llmCondition-prompt')

    fireEvent.change(promptInput, { target: { value: 'New prompt' } })
    expect(mockSetData).toHaveBeenCalledTimes(1)

    const newConditionWithPrompt = mockSetData.mock.calls[0][0]
    expect(newConditionWithPrompt).toEqual({
      ...mockLlmCondition,
      data: {
        ...mockLlmCondition.data,
        llm: {
          ...mockLlmCondition.data.llm,
          prompt: 'New prompt',
        },
      },
    })
  })
})
