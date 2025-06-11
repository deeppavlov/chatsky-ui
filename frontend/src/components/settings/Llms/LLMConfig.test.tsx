import { LlmContext } from '@/contexts/llmContext'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { createLlmConfig, updateLlmConfig } from '@/api/llm'
import { PopUpContext } from '@/contexts/popUpContext'
import LLMConfig from './LLMConfig'

jest.mock('@/env.consts', () => ({
  VITE_BASE_API_URL: 'http://localhost:8000/api/v1',
  DEV: true,
}))

jest.mock('@/api/llm', () => ({
  ...jest.requireActual('@/api/llm'),
  createLlmConfig: jest.fn().mockResolvedValue('newConfigId'),
  updateLlmConfig: jest.fn().mockResolvedValue({}),
}))

const mockConfig = {
  id: 'config1',
  name: 'Config_1',
  model_name: 'gpt-3.5-turbo',
  token_id: 'token1',
  system_prompt: 'Default prompt',
}
const mockConfigs = {
  config1: mockConfig,
  config2: {
    name: 'Config_2',
    model_name: 'claude-2',
    token_id: 'token2',
    system_prompt: '',
  },
}

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
  llmConfigs: mockConfigs,
  setLlmConfigs: jest.fn(),
  editingConfig: null,
  setEditingConfig: jest.fn(),
  defaultLlmConfig: {
    id: 'config1',
    name: 'Config 1',
    model_name: 'gpt-3.5-turbo',
    token_id: 'token1',
    system_prompt: 'Default prompt',
  },
  setDefaultLlmConfig: jest.fn(),
}

const mockPopUpValues = {
  openPopUp: jest.fn(),
  closePopUp: jest.fn(),
  setCloseEdit: jest.fn(),
  closeEdit: '',
  popUpElements: [],
}

describe('LLMConfig Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with config data', async () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMConfig config={mockConfig} />
      </LlmContext.Provider>,
    )

    expect(screen.getByTestId('llmConfig_name-input')).toHaveValue('Config_1')
    expect(screen.getByTestId('llmConfig_model-select')).toHaveTextContent(
      'gpt-3.5-turbo',
    )
    expect(screen.getByTestId('llmConfig_token-select')).toHaveTextContent(
      'OpenAI_Token',
    )
    expect(screen.getByText('Default prompt')).toBeInTheDocument()
    expect(
      screen.queryByTestId('llmConfig_reset-button'),
    ).not.toBeInTheDocument()

    expect(screen.getByTestId('llmConfig_delete-button')).toBeInTheDocument()
    expect(
      screen.getByTestId('llmConfig_prompt-edit-button'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('llmConfig_prompt-edit-button'),
    ).not.toBeDisabled()
    expect(
      screen.queryByText('Please fill in all fields'),
    ).not.toBeInTheDocument()
  })

  it('renders correctly without config data', async () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMConfig
          config={{
            id: '',
            name: '',
            model_name: '',
            token_id: '',
            system_prompt: '',
          }}
        />
      </LlmContext.Provider>,
    )

    expect(screen.getByTestId('llmConfig_name-input')).toHaveValue('')
    expect(screen.getByTestId('llmConfig_model-select')).toHaveTextContent(
      'Select LLM',
    )
    expect(screen.getByTestId('llmConfig_token-select')).toHaveTextContent(
      'Select token',
    )
    expect(screen.getByText('Enter prompt...')).toBeInTheDocument()
    expect(screen.queryByTestId('llmConfig_reset-button')).toBeInTheDocument()
    expect(screen.queryByTestId('llmConfig_reset-button')).toBeDisabled()
    expect(
      screen.queryByTestId('llmConfig_delete-button'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('llmConfig_prompt-edit-button'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('llmConfig_prompt-edit-button')).toBeDisabled()

    fireEvent.change(screen.getByTestId('llmConfig_name-input'), {
      target: { value: 'New Config' },
    })
    expect(screen.getByTestId('llmConfig_name-input')).toHaveValue('New_Config')

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
    })
    expect(screen.getByTestId('llmConfig_reset-button')).not.toBeDisabled()
    fireEvent.click(screen.getByTestId('llmConfig_reset-button'))
    await waitFor(() => {
      expect(screen.getByTestId('llmConfig_name-input')).toHaveValue('')
      expect(
        screen.queryByText('Please fill in all fields'),
      ).not.toBeInTheDocument()
    })
  })

  it('calls setConfigs when config changed', async () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMConfig config={mockConfig} />
      </LlmContext.Provider>,
    )

    fireEvent.change(screen.getByTestId('llmConfig_name-input'), {
      target: { value: 'New Config' },
    })

    await waitFor(() => {
      expect(updateLlmConfig).toHaveBeenCalled()
      expect(mockProviderValues.setLlmConfigs).toHaveBeenCalled()

      const updaterFn = mockProviderValues.setLlmConfigs.mock.calls[0][0]
      const result = updaterFn(mockConfigs)

      expect(result).toEqual({
        ...mockConfigs,
        [mockConfig.id]: {
          ...mockConfig,
          name: 'New_Config',
        },
      })
    })
  })

  it('creating new config', async () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMConfig
          config={{
            id: '',
            name: '',
            model_name: 'claude-2',
            token_id: 'token2',
            system_prompt: '',
          }}
        />
      </LlmContext.Provider>,
    )

    expect(screen.getByTestId('llmConfig_name-input')).toHaveValue('')
    expect(screen.getByTestId('llmConfig_model-select')).toHaveTextContent(
      'claude-2',
    )
    expect(screen.getByTestId('llmConfig_token-select')).toHaveTextContent(
      'Claude_Token',
    )

    fireEvent.change(screen.getByTestId('llmConfig_name-input'), {
      target: { value: 'New Config' },
    })
    await waitFor(() => {
      expect(createLlmConfig).toHaveBeenCalled()
      const firstCall = (createLlmConfig as jest.Mock).mock.calls[0]
      expect(firstCall[0]).toEqual({
        name: 'New_Config',
        model_name: 'claude-2',
        token_id: 'token2',
        system_prompt: '',
      })

      const apiCallResult = (createLlmConfig as jest.Mock).mock.results[0].value
      expect(apiCallResult).resolves.toBe('newConfigId')

      expect(mockProviderValues.setLlmConfigs).toHaveBeenCalled()
      const updaterFn = mockProviderValues.setLlmConfigs.mock.calls[0][0]
      const setConfigsCallResult = updaterFn(mockConfigs)
      expect(setConfigsCallResult).toEqual({
        ...mockConfigs,
        newConfigId: {
          name: 'New_Config',
          model_name: 'claude-2',
          token_id: 'token2',
          system_prompt: '',
        },
      })
    })
  })

  it('deletes config', async () => {
    render(
      <PopUpContext.Provider value={mockPopUpValues}>
        <LlmContext.Provider value={mockProviderValues}>
          <LLMConfig config={mockConfig} />
        </LlmContext.Provider>
        ,
      </PopUpContext.Provider>,
    )

    const deleteButton = screen.getByTestId('llmConfig_delete-button')
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).not.toBeDisabled()
    fireEvent.click(screen.getByTestId('llmConfig_delete-button'))
    expect(mockPopUpValues.openPopUp).toHaveBeenCalled()
  })

  it('opens prompt redactor', async () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMConfig config={mockConfig} />
      </LlmContext.Provider>,
    )

    const editButton = screen.getByTestId('llmConfig_prompt-edit-button')
    expect(editButton).toBeInTheDocument()
    expect(editButton).not.toBeDisabled()
    fireEvent.click(editButton)
    expect(mockProviderValues.setEditingConfig).toHaveBeenCalledWith(mockConfig)
  })

  it('render invalid config', () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMConfig
          config={{
            id: '',
            name: 'Config_1',
            model_name: 'claude-2',
            token_id: 'token1',
            system_prompt: '',
          }}
        />
      </LlmContext.Provider>,
    )

    expect(screen.getByTestId('llmConfig_name-input')).toHaveValue('Config_1')
    expect(screen.getByTestId('llmConfig_model-select')).toHaveTextContent(
      'claude-2',
    )
    expect(screen.getByTestId('llmConfig_token-select')).toHaveTextContent(
      'OpenAI_Token',
    )
    expect(
      screen.getByText('Token does not match the selected LLM'),
    ).toBeInTheDocument()
  })
})
