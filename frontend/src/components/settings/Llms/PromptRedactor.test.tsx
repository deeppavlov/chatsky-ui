import { LlmContext } from '@/contexts/llmContext'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { updateLlmConfig } from '@/api/llm'
import PromptRedactor from './PromptRedactor'

jest.mock('@/env.consts', () => ({
  VITE_BASE_API_URL: 'http://localhost:8000/api/v1',
  DEV: true,
}))

jest.mock('@/api/llm', () => ({
  ...jest.requireActual('@/api/llm'),
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

describe('PromptRedactor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders a component without an editable configuration', () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <PromptRedactor />
      </LlmContext.Provider>,
    )

    expect(screen.getByText('Select an item to configure.')).toBeInTheDocument()
  })

  it('renders a component with an editable configuration', async () => {
    render(
      <LlmContext.Provider
        value={{ ...mockProviderValues, editingConfig: mockConfig }}
      >
        <PromptRedactor />
      </LlmContext.Provider>,
    )
    await waitFor(() => {
      expect(screen.getByText(`System prompt`)).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveValue(mockConfig.system_prompt)
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Save prompt' }),
      ).toBeInTheDocument()
    })
  })

  it('calls updateLlmConfig on save', async () => {
    render(
      <LlmContext.Provider
        value={{ ...mockProviderValues, editingConfig: mockConfig }}
      >
        <PromptRedactor />
      </LlmContext.Provider>,
    )

    const saveButton = screen.getByRole('button', { name: 'Save prompt' })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'New prompt' } })
    fireEvent.click(saveButton)
    await waitFor(() => {
      expect(mockProviderValues.setEditingConfig).toHaveBeenCalledWith({
        ...mockConfig,
        system_prompt: 'New prompt',
      })
      expect(updateLlmConfig).toHaveBeenCalledWith(mockConfig.id, {
        system_prompt: 'New prompt',
      })
      expect(mockProviderValues.setLlmConfigs).toHaveBeenCalled()
      const updaterFn = mockProviderValues.setLlmConfigs.mock.calls[0][0]
      const result = updaterFn(mockConfigs)
      expect(result).toEqual({
        ...mockConfigs,
        [mockConfig.id]: {
          ...mockConfig,
          system_prompt: 'New prompt',
        },
      })
    })
  })
})
