import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as llmApi from '@/api/llm'
import { LlmContext } from '@/contexts/llmContext'
import Llms from './Llms'

jest.mock('@/env.consts', () => ({
  VITE_BASE_API_URL: 'http://localhost:8000/api/v1',
  DEV: true,
}))

// Мок для API вызовов
jest.mock('@/api/llm', () => ({
  setDefaultConfigId: jest.fn().mockResolvedValue({}),
  getDefaultConfigId: jest.fn().mockResolvedValue('config1'),
  getLlmConfigs: jest.fn().mockResolvedValue({
    config1: {
      config_name: 'Config 1',
      model_name: 'model1',
      token_id: 'token1',
    },
    config2: {
      config_name: 'Config 2',
      model_name: 'model2',
      token_id: 'token2',
    },
  }),
  getLlmProviders: jest.fn().mockResolvedValue({
    openai: ['gpt-3.5-turbo', 'gpt-4'],
    anthropic: ['claude-2', 'claude-instant-1'],
  }),
  getLLMTokens: jest.fn().mockResolvedValue({
    token1: { name: 'OpenAI_Token', provider: 'openai', value: 'xxx' },
    token2: { name: 'Claude_Token', provider: 'anthropic', value: 'yyy' },
  }),
  createLLMToken: jest.fn().mockResolvedValue('new-token-id'),
  updateLLMToken: jest.fn().mockResolvedValue({}),
  deleteLLMToken: jest.fn().mockResolvedValue({}),
  createLlmConfig: jest.fn().mockResolvedValue('new-config-id'),
  updateLlmConfig: jest.fn().mockResolvedValue({}),
  deleteLlmConfig: jest.fn().mockResolvedValue({}),
}))

// Мок для ScrolledContainer
jest.mock('@/UI/ScrolledContainer/ScrolledContainer', () => ({
  __esModule: true,
  default: ({
    children,
    className,
  }: {
    children: never
    className: string
  }) => (
    <div data-testid='scrolled-container' className={className}>
      {children}
    </div>
  ),
}))

const mockProviderValues = {
  llmProviders: {
    openai: ['gpt-3.5-turbo', 'gpt-4'],
    anthropic: ['claude-2', 'claude-instant-1'],
  },
  tokens: {
    token1: { name: 'OpenAI_Token', provider: 'openai', value: 'xxx' },
    token2: { name: 'Claude_Token', provider: 'anthropic', value: 'yyy' },
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

describe('Llms Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderLlmsComponent = async () => {
    await act(async () =>
      render(
        <LlmContext.Provider value={mockProviderValues}>
          <Llms />
        </LlmContext.Provider>,
      ),
    )
  }

  it('renders correctly with all sections', async () => {
    await renderLlmsComponent()

    // Проверяем заголовки секций
    expect(screen.getByText('LLM access tokens')).toBeInTheDocument()
    expect(screen.getByText('Your LLM configurations')).toBeInTheDocument()
    expect(screen.getByText('Default LLM configurations')).toBeInTheDocument()

    // Проверяем таблицы с заголовками колонок
    expect(screen.getByText('Service')).toBeInTheDocument()
    expect(screen.getByText('Access token name')).toBeInTheDocument()
    expect(screen.getByText('Access token')).toBeInTheDocument()
    expect(screen.getByText('Configuration name')).toBeInTheDocument()
    expect(screen.getByText('LLM')).toBeInTheDocument()
    expect(screen.getByText('LLM access token')).toBeInTheDocument()
    expect(screen.getByText('System prompt')).toBeInTheDocument()

    // Проверяем наличие токенов и конфигураций
    expect(screen.getByTestId('llm-token-token1')).toBeInTheDocument()
    expect(screen.getByTestId('llm-token-token2')).toBeInTheDocument()
    expect(screen.getByTestId('llm-config-config1')).toBeInTheDocument()
    expect(screen.getByTestId('llm-config-config2')).toBeInTheDocument()
  })

  it('renders PromptRedactor component', async () => {
    await renderLlmsComponent()
    // Проверяем наличие компонента редактора промптов
    const promptRedactor = screen.getByTestId('prompt-redactor')
    expect(promptRedactor).toBeInTheDocument()
  })

  it('shows default LLM configuration in select', async () => {
    await renderLlmsComponent()

    // Находим селект для дефолтной конфигурации
    const select = screen.getByTestId('default-llm-select')
    expect(select).toBeInTheDocument()
    await act(() => {
      select.click()
    })
    waitFor(() => {
      expect(
        screen.getByText('config1', { selector: 'li' }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('config2', { selector: 'li' }),
      ).toBeInTheDocument()
    })
  })

  it('calls setDefaultConfigId when default LLM config is changed', async () => {
    await renderLlmsComponent()

    const spy = jest.spyOn(llmApi, 'setDefaultConfigId')
    const select = screen.getByTestId('default-llm-select')
    fireEvent.click(select)

    waitFor(() => {
      // Находим элемент с текстом 'config2' и кликаем по нему
      const option = screen.getByText('config2', { selector: 'li' })
      fireEvent.click(option)

      expect(spy).toHaveBeenCalledWith('config2')
      expect(mockProviderValues.setDefaultLlmConfig).toHaveBeenCalled()
    })
  })
})
