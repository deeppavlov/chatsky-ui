import { BuildProvider } from "./buildContext"
import { ChatProvider } from "./chatContext"
import { FlowProvider } from "./flowContext"
import IdeProvider from "./ideContext"
import MetaProvider from "./metaContext"
import NotificationsProvider from "./notificationsContext"
import { RunProvider } from "./runContext"
import { ThemeProvider } from "./themeContext"
import { WorkspaceProvider } from "./workspaceContext"

export default function ContextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MetaProvider>
      <NotificationsProvider>
        <ThemeProvider>
          <ChatProvider>
            <BuildProvider>
              <RunProvider>
                <FlowProvider>
                  <WorkspaceProvider>
                    <IdeProvider>{children}</IdeProvider>
                  </WorkspaceProvider>
                </FlowProvider>
              </RunProvider>
            </BuildProvider>
          </ChatProvider>
        </ThemeProvider>
      </NotificationsProvider>
    </MetaProvider>
  )
}
