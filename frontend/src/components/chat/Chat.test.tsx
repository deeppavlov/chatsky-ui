import { chatContext, messageType } from '@/contexts/chatContext'
import { runContext } from '@/contexts/runContext'
import { workspaceContext } from '@/contexts/workspaceContext'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import Chat from './Chat'
import '@testing-library/jest-dom'
import { buildApiStatusType, messengerType } from '@/api/bot'
import axios from 'axios'
import { useState } from 'react'

jest.mock('@/env.consts', () => ({
  VITE_BASE_API_URL: 'http://localhost:8000/api/v1',
  DEV: true,
}))

const mockAxios = axios as jest.Mocked<typeof axios>
jest.mock('axios')

jest.mock('@/api/bot', () => ({
  ...jest.requireActual('@/api/bot'),
  getChatIds: jest.fn().mockImplementation(() => Promise.resolve(['1_2'])),
  send_message: jest.fn().mockResolvedValue({
    response: {
      text: 'Test bot response',
    },
  }),
}))

jest.mock('./ChatList', () => ({
  __esModule: true,
  default: () => <div data-testid='chatList'>ChatList content</div>,
}))
jest.mock('./EmojiPicker', () => ({
  __esModule: true,
  default: () => <div data-testid='emoji-picker'>Emoji picker</div>,
}))

Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
  value: jest.fn(),
  writable: true,
})

const ChatContextMock = ({ children }: { children: React.ReactNode }) => {
  const [chatId, setChatId] = useState(1)
  const [chatHistory, setChatHistory] = useState<messageType[]>([
    { message: 'Hello', type: 'user' },
    { message: 'Hi there!', type: 'bot' },
    { message: 'How are you?', type: 'user' },
    { message: 'I am fine!', type: 'bot' },
  ])

  return (
    <chatContext.Provider
      value={{
        chatId,
        setChatId,
        chatHistory,
        setChatHistory,
      }}
    >
      {children}
    </chatContext.Provider>
  )
}

const aliveRun = {
  id: 1,
  build_id: 1,
  status: 'alive' as buildApiStatusType,
  timestamp: '2024-03-20T12:00:00Z',
  log_path: '/path/to/log',
  port: 8080,
  messenger: 'web' as messengerType,
  type: 'run' as const,
  preset: {
    name: 'Test Run',
    build_name: 'Test Build',
    preset: 'default',
    end_status: 'success',
  },
}

const stoppedRun = {
  id: 1,
  build_id: 1,
  status: 'stopped' as buildApiStatusType,
  timestamp: '2024-03-20T12:00:00Z',
  log_path: '/path/to/log',
  port: 8080,
  messenger: 'web' as messengerType,
  type: 'run' as const,
  preset: {
    name: 'Test Run',
    build_name: 'Test Build',
    preset: 'default',
    end_status: 'success',
  },
}

const mockRunContext = {
  runs: [aliveRun],
  setRuns: jest.fn(),
  runStarting: false,
  setRunStarting: jest.fn(),
  startingRunId: null,
  setStartingRunId: jest.fn(),
  runStopping: false,
  setRunStopping: jest.fn(),
  stoppingRunIds: [],
  setStoppingRunIds: jest.fn(),
  runStart: jest.fn(),
  runStop: jest.fn(),
  stopAllRuns: jest.fn(),
  setRunsHandler: jest.fn(),
}

const mockWorkspaceContext = {
  workspaceMode: false,
  setWorkspaceMode: jest.fn(),
  toggleWorkspaceMode: jest.fn(),
  nodesLayoutMode: false,
  setNodesLayoutMode: jest.fn(),
  toggleNodesLayoutMode: jest.fn(),
  selectedNode: '',
  setSelectedNode: jest.fn(),
  handleNodeFlags: jest.fn(),
  mouseOnPane: false,
  setMouseOnPane: jest.fn(),
  modalsOpened: 0,
  setModalsOpened: jest.fn(),
  onModalClose: jest.fn(),
  onModalOpen: jest.fn(),
  managerMode: false,
  setManagerMode: jest.fn(),
  toggleManagerMode: jest.fn(),
  startRunFormState: null,
  setStartRunFormState: jest.fn(),
  buildFormData: null,
  setBuildFormData: jest.fn(),
}

describe('Chat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Мок для запроса к API эмодзи
    mockAxios.get.mockResolvedValue({
      data: [
        {
          slug: 'grinning-face',
          character: '\ud83d\ude00',
          unicodeName: 'grinning face',
          codePoint: '1F600',
          group: 'smileys-emotion',
          subGroup: 'face-smiling',
        },
        {
          slug: 'grinning-face-with-big-eyes',
          character: '\ud83d\ude03',
          unicodeName: 'grinning face with big eyes',
          codePoint: '1F603',
          group: 'smileys-emotion',
          subGroup: 'face-smiling',
        },
      ],
    })
  })

  const renderChat = async () =>
    await act(async () =>
      render(
        <ChatContextMock>
          <runContext.Provider value={mockRunContext}>
            <workspaceContext.Provider value={mockWorkspaceContext}>
              <Chat />
            </workspaceContext.Provider>
          </runContext.Provider>
        </ChatContextMock>,
      ),
    )

  it('renders correctly', async () => {
    await renderChat()
    expect(screen.getByText('Chat')).toBeInTheDocument()
    const chatTitle = screen.getByText((content) =>
      content.includes('Test Build / Test Run'),
    )
    expect(chatTitle).toBeInTheDocument()
    expect(screen.getAllByTestId('bot-message')).toHaveLength(2)
    expect(screen.getAllByTestId('user-message')).toHaveLength(2)
  })

  it('clears chat history when reset button is clicked', async () => {
    await renderChat()
    const resetButton = screen.getByTestId('chat-reset')
    expect(screen.getAllByTestId('bot-message')).toHaveLength(2)
    expect(screen.getAllByTestId('user-message')).toHaveLength(2)

    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(screen.queryAllByTestId('bot-message')).toHaveLength(0)
      expect(screen.queryAllByTestId('user-message')).toHaveLength(0)
    })
  })

  it('sends message when send button is clicked', async () => {
    await renderChat()
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('chat-send')
    expect(screen.getAllByTestId('user-message')).toHaveLength(2)

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    const messages = screen.getAllByTestId('user-message')
    const lastMessage = messages[messages.length - 1]
    expect(lastMessage).toHaveTextContent('Test message')
    expect(screen.getAllByTestId('user-message')).toHaveLength(3)
  })

  it('sends message when Enter key is pressed', async () => {
    await renderChat()
    const input = screen.getByTestId('chat-input')
    expect(screen.getAllByTestId('user-message')).toHaveLength(2)

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getAllByTestId('user-message')).toHaveLength(3)
  })

  it('does not send empty message', async () => {
    await renderChat()
    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('chat-send')

    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(sendButton)
    expect(screen.getAllByTestId('user-message')).toHaveLength(2)
  })

  it('opens and closes emoji picker', async () => {
    await renderChat()
    const emojiButton = screen.getByTestId('chat-emoji-button')

    fireEvent.click(emojiButton)
    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument()

    fireEvent.click(emojiButton)
    await waitFor(() => {
      expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument()
    })
  })

  it('disables controls when bot is stopped', async () => {
    await act(async () =>
      render(
        <ChatContextMock>
          <runContext.Provider
            value={{ ...mockRunContext, runs: [stoppedRun] }}
          >
            <workspaceContext.Provider value={mockWorkspaceContext}>
              <Chat />
            </workspaceContext.Provider>
          </runContext.Provider>
        </ChatContextMock>,
      ),
    )
    const sendButton = screen.getByTestId('chat-send')
    expect(sendButton).toBeDisabled()
    const input = screen.getByTestId('chat-input')
    expect(input).toBeDisabled()
    const emojiButton = screen.getByTestId('chat-emoji-button')
    expect(emojiButton).toBeDisabled()
    const resetButton = screen.getByTestId('chat-reset')
    expect(resetButton).toBeDisabled()
  })
})
