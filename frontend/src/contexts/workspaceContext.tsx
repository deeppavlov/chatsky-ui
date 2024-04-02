import { createContext, useState } from "react"

type WorkspaceContextType = {
  workspaceMode: boolean
  setWorkspaceMode: React.Dispatch<React.SetStateAction<boolean>>
  toggleWorkspaceMode: () => void
  nodesLayoutMode: boolean
  setNodesLayoutMode: React.Dispatch<React.SetStateAction<boolean>>
  toggleNodesLayoutMode: () => void
}


export const workspaceContext = createContext({
  setWorkspaceMode: () => {},
  toggleWorkspaceMode: () => {},
  workspaceMode: false,
  setNodesLayoutMode: () => {},
  toggleNodesLayoutMode: () => {},
  nodesLayoutMode: false
} as WorkspaceContextType)

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [workspaceMode, setWorkspaceMode] = useState(false)
  const [nodesLayoutMode, setNodesLayoutMode] = useState(false)

  const toggleWorkspaceMode = () => {
    setWorkspaceMode(prev => !workspaceMode)
  }

  const toggleNodesLayoutMode = () => {
    setNodesLayoutMode(prev => !nodesLayoutMode)
  }

  return (
    <workspaceContext.Provider value={{
      workspaceMode,
      setWorkspaceMode,
      toggleWorkspaceMode,
      nodesLayoutMode,
      setNodesLayoutMode,
      toggleNodesLayoutMode
    }}>
      {children}
    </workspaceContext.Provider>
  )
}