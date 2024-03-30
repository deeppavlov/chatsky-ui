import { BuildProvider } from "./buildContext"
import { ChatProvider } from "./chatContext"
import { FlowProvider } from "./flowContext"
import PopUpProvider from "./popUpContext"
import { RunProvider } from "./runContext"
import { ThemeProvider } from "./themeContext"
import { WorkspaceProvider } from "./workspaceContext"

export default function ContextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ChatProvider>
        <BuildProvider>
          <RunProvider>
            <FlowProvider>
              <WorkspaceProvider>
                <PopUpProvider>{children}</PopUpProvider>
              </WorkspaceProvider>
            </FlowProvider>
          </RunProvider>
        </BuildProvider>
      </ChatProvider>
    </ThemeProvider>
  )
}
