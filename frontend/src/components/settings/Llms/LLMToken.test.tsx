import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { createLLMToken, updateLLMToken } from '@/api/llm'
import { LlmContext } from '@/contexts/llmContext'
import { PopUpContext } from '@/contexts/popUpContext'
import LLMToken from './LLMToken'

jest.mock('@/env.consts', () => ({
  VITE_BASE_API_URL: 'http://localhost:8000/api/v1',
  DEV: true,
}))

jest.mock('@/api/llm', () => ({
  ...jest.requireActual('@/api/llm'),
  createLLMToken: jest.fn().mockResolvedValue('newTokenId'),
  deleteLLMToken: jest.fn().mockResolvedValue({}),
  updateLLMToken: jest.fn().mockResolvedValue({}),
}))

const mockToken = {
  id: 'token1',
  name: 'OpenAI_Token',
  value: 'xxx',
  provider: 'openai',
}
const mockTokens = {
  token1: mockToken,
  token2: { name: 'Claude_Token', provider: 'anthropic', value: 'yyy' },
}

const mockProviderValues = {
  llmProviders: {
    openai: ['gpt-3.5-turbo', 'gpt-4'],
    anthropic: ['claude-2', 'claude-instant-1'],
  },
  tokens: mockTokens,
  setTokens: jest.fn(),
  llmConfigs: {},
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

const mockPopUpValues = {
  openPopUp: jest.fn(),
  closePopUp: jest.fn(),
  setCloseEdit: jest.fn(),
  closeEdit: '',
  popUpElements: [],
}

describe('LLMToken Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  function testTokensUpdateCall<T>(expectedState: T, callIndex = 0) {
    expect(mockProviderValues.setTokens).toHaveBeenCalled()
    const updaterFn = mockProviderValues.setTokens.mock.calls[callIndex][0]
    const result = updaterFn(mockTokens)

    expect(result).toEqual(expectedState)
  }

  it('renders correctly with token data', () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMToken token={mockToken} />,
      </LlmContext.Provider>,
    )

    expect(screen.getByTestId('llmToken_provider-select')).toHaveTextContent(
      'openai',
    )
    expect(screen.getByTestId('llmToken_name-input')).toHaveValue(
      'OpenAI_Token',
    )
    expect(screen.getByTestId('llmToken_value-input')).toHaveValue('xxx')
    expect(screen.getByTestId('llmToken_delete-btn')).toBeInTheDocument()
    expect(screen.queryByTestId('llmToken_reset-btn')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Please fill in all fields'),
    ).not.toBeInTheDocument()
  })

  it('renders correctly without token data', async () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMToken
          token={{
            id: '',
            name: '',
            value: '',
            provider: '',
          }}
        />
        ,
      </LlmContext.Provider>,
    )

    expect(screen.getByTestId('llmToken_provider-select')).toHaveTextContent(
      'Select LLM service',
    )
    expect(screen.getByTestId('llmToken_name-input')).toHaveValue('')
    expect(screen.getByTestId('llmToken_value-input')).toHaveValue('')
    expect(screen.queryByTestId('llmToken_delete-btn')).not.toBeInTheDocument()
    expect(screen.getByTestId('llmToken_reset-btn')).toBeInTheDocument()
    expect(screen.getByTestId('llmToken_reset-btn')).toBeDisabled()

    fireEvent.change(screen.getByTestId('llmToken_name-input'), {
      target: { value: 'name' },
    })
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
    })
    expect(screen.getByTestId('llmToken_name-input')).toHaveValue('name')
    expect(screen.getByTestId('llmToken_reset-btn')).not.toBeDisabled()

    fireEvent.click(screen.getByTestId('llmToken_reset-btn'))
    await waitFor(() => {
      expect(screen.getByTestId('llmToken_name-input')).toHaveValue('')
      expect(
        screen.queryByText('Please fill in all fields'),
      ).not.toBeInTheDocument()
    })
  })

  it('calls setTokens when token changed', async () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMToken token={mockToken} />
      </LlmContext.Provider>,
    )

    const nameInput = screen.getByTestId('llmToken_name-input')
    fireEvent.change(nameInput, { target: { value: 'Updated Token Name' } })
    await waitFor(() => {
      expect(updateLLMToken).toHaveBeenCalled()

      testTokensUpdateCall({
        ...mockTokens,
        [mockToken.id]: {
          ...mockToken,
          name: 'Updated_Token_Name',
        },
      })
    })

    const value = screen.getByTestId('llmToken_value-input')
    fireEvent.change(value, { target: { value: 'new-value' } })
    await waitFor(() => {
      expect(updateLLMToken).toHaveBeenCalled()

      testTokensUpdateCall(
        {
          ...mockTokens,
          [mockToken.id]: {
            ...mockToken,
            value: 'new-value',
          },
        },
        1,
      )
    })
  })

  it('creating new token', async () => {
    render(
      <LlmContext.Provider value={mockProviderValues}>
        <LLMToken
          token={{
            id: '',
            name: '',
            value: 'tokenValue',
            provider: 'openai',
          }}
        />
      </LlmContext.Provider>,
    )

    expect(screen.getByTestId('llmToken_provider-select')).toHaveTextContent(
      'openai',
    )
    expect(screen.getByTestId('llmToken_name-input')).toHaveValue('')
    expect(screen.getByTestId('llmToken_value-input')).toHaveValue('tokenValue')

    fireEvent.change(screen.getByTestId('llmToken_name-input'), {
      target: { value: 'New Token' },
    })
    await waitFor(() => {
      expect(createLLMToken).toHaveBeenCalled()
      const firstCall = (createLLMToken as jest.Mock).mock.calls[0]
      expect(firstCall[0]).toEqual({
        name: 'New_Token',
        provider: 'openai',
        value: 'tokenValue',
      })

      const apiCallResult = (createLLMToken as jest.Mock).mock.results[0].value
      expect(apiCallResult).resolves.toBe('newTokenId')
      testTokensUpdateCall({
        ...mockTokens,
        newTokenId: {
          name: 'New_Token',
          provider: 'openai',
          value: 'tokenValue',
        },
      })
    })
  })

  it('token deleting', async () => {
    render(
      <PopUpContext.Provider value={mockPopUpValues}>
        <LlmContext.Provider value={mockProviderValues}>
          <LLMToken token={mockToken} />
        </LlmContext.Provider>
      </PopUpContext.Provider>,
    )
    const deleteButton = screen.getByTestId('llmToken_delete-btn')
    fireEvent.click(deleteButton)
    expect(mockPopUpValues.openPopUp).toHaveBeenCalled()
  })
})
