import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { buildApiStatusType, messengerType } from '@/api/bot'
import { chatContext, messageType } from '@/contexts/chatContext'
import { runContext } from '@/contexts/runContext'
import { useState } from 'react'
import ChatList from './ChatList'

jest.mock('@/env.consts', () => ({
  VITE_BASE_API_URL: 'http://localhost:8000/api/v1',
  DEV: true,
}))

jest.mock('@/api/bot', () => ({
  ...jest.requireActual('@/api/bot'),
  getChatIds: jest
    .fn()
    .mockImplementation(() => Promise.resolve(['1_1', '2_2'])),
}))

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
    name: 'Test Run 1',
    build_name: 'Test Build 1',
    preset: 'default',
    end_status: 'success',
  },
}

const stoppedRun = {
  id: 2,
  build_id: 2,
  status: 'stopped' as buildApiStatusType,
  timestamp: '2024-03-20T12:00:00Z',
  log_path: '/path/to/log',
  port: 8080,
  messenger: 'web' as messengerType,
  type: 'run' as const,
  preset: {
    name: 'Test Run 2',
    build_name: 'Test Build 2',
    preset: 'default',
    end_status: 'success',
  },
}

const mockRunContext = {
  runs: [aliveRun, stoppedRun],
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

const ChatContextMock = ({ children }: { children: React.ReactNode }) => {
  const [chatId, setChatId] = useState(-1)
  const [chatHistory, setChatHistory] = useState<messageType[]>([])

  return (
    <chatContext.Provider
      value={{ chatId, setChatId, chatHistory, setChatHistory }}
    >
      {children}
    </chatContext.Provider>
  )
}

describe('ChatList Component', () => {
  const renderChatList = async (isOpen = true) => {
    return await act(async () =>
      render(
        <ChatContextMock>
          <runContext.Provider value={mockRunContext}>
            <ChatList isOpen={isOpen} />
          </runContext.Provider>
        </ChatContextMock>,
      ),
    )
  }

  it('adjusts width based on isOpen prop', async () => {
    const { rerender } = await renderChatList(true)
    const openContainer = screen.getByRole('complementary')
    expect(openContainer).toHaveClass('w-[240px]')

    await act(async () => {
      rerender(
        <ChatContextMock>
          <runContext.Provider value={mockRunContext}>
            <ChatList isOpen={false} />
          </runContext.Provider>
        </ChatContextMock>,
      )
    })
    const closedContainer = screen.getByRole('complementary')
    expect(closedContainer).toHaveClass('w-0')
  })

  it('changes chatId when chat item is clicked', async () => {
    await renderChatList()

    const chatItems = screen.getAllByRole('button')
    expect(chatItems[0]).toHaveClass('bg-btn-accent')
    expect(chatItems[0]).toHaveTextContent('Test Build 2 / Test Run 2')

    fireEvent.click(chatItems[1])

    expect(chatItems[1].textContent).toMatch(/Test Build 1 \/ Test Run 1/)
    expect(chatItems[1]).toHaveClass('bg-btn-accent')
  })

  it('displays archive icon for non-alive chats', async () => {
    await renderChatList()

    const archiveIcons = screen.getAllByTestId('archive-icon')
    expect(archiveIcons).toHaveLength(1)

    const stoppedChatItem = screen.getByText((text) =>
      text.includes('Test Build 2 / Test Run 2'),
    )
    expect(stoppedChatItem.parentElement).toContainElement(archiveIcons[0])
    const aliveChatItem = screen.getByText((text) =>
      text.includes('Test Build 1 / Test Run 1'),
    )
    expect(aliveChatItem.parentElement).not.toContainElement(archiveIcons[0])
  })
})
