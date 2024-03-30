import { createContext, useState } from "react"

type WorkspaceContextType = {
  workspaceMode: boolean
  setWorkspaceMode: React.Dispatch<React.SetStateAction<boolean>>
  toggleWorkspaceMode: () => void
}


export const workspaceContext = createContext({
  setWorkspaceMode: () => {},
  toggleWorkspaceMode: () => {},
  workspaceMode: false
} as WorkspaceContextType)

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [workspaceMode, setWorkspaceMode] = useState(false)

  const toggleWorkspaceMode = () => {
    setWorkspaceMode(prev => !workspaceMode)
  }

  return (
    <workspaceContext.Provider value={{
      workspaceMode,
      setWorkspaceMode,
      toggleWorkspaceMode
    }}>
      {children}
    </workspaceContext.Provider>
  )
}