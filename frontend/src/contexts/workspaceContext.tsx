/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react"
import { Node } from "reactflow"
import { NodeDataType } from "../types/NodeTypes"
import { flowContext } from "./flowContext"

type WorkspaceContextType = {
  workspaceMode: boolean
  setWorkspaceMode: React.Dispatch<React.SetStateAction<boolean>>
  toggleWorkspaceMode: () => void
  nodesLayoutMode: boolean
  setNodesLayoutMode: React.Dispatch<React.SetStateAction<boolean>>
  toggleNodesLayoutMode: () => void
  settingsPage: boolean
  setSettingsPage: React.Dispatch<React.SetStateAction<boolean>>
  selectedNode: string
  setSelectedNode: React.Dispatch<React.SetStateAction<string>>
  handleNodeFlags: (e: React.MouseEvent<HTMLButtonElement>, setNodes: React.Dispatch<React.SetStateAction<Node<NodeDataType>[]>>) => void
}

export const workspaceContext = createContext<WorkspaceContextType>({
  setWorkspaceMode: () => {},
  toggleWorkspaceMode: () => {},
  workspaceMode: false,
  setNodesLayoutMode: () => {},
  toggleNodesLayoutMode: () => {},
  nodesLayoutMode: false,
  setSettingsPage: () => {},
  settingsPage: false,
  selectedNode: "",
  setSelectedNode: () => {},
  handleNodeFlags: () => {},
} as WorkspaceContextType)

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [workspaceMode, setWorkspaceMode] = useState(false)
  const [nodesLayoutMode, setNodesLayoutMode] = useState(false)
  const [settingsPage, setSettingsPage] = useState(false)
  const [selectedNode, setSelectedNode] = useState("")
  const { updateFlow, flows, tab, quietSaveFlows } = useContext(flowContext)
  const flow = flows.find((flow) => flow.name === tab)

  const toggleWorkspaceMode = () => {
    setWorkspaceMode(() => !workspaceMode)
  }

  const toggleNodesLayoutMode = () => {
    setNodesLayoutMode(() => !nodesLayoutMode)
  }

  const handleNodeFlags = (e: React.MouseEvent<HTMLButtonElement>, setNodes: React.Dispatch<React.SetStateAction<Node<NodeDataType>[]>>) => {
    setNodes((nds) => {
      const new_nds = nds.map((nd: Node<NodeDataType>) => {
        if (nd.data.flags?.includes(e.currentTarget.name)) {
          nd.data.flags = nd.data.flags.filter((flag) => flag !== e.currentTarget.name)
        }
        if (nd.id === selectedNode) {
          if (nd.data.flags?.includes(e.currentTarget.name)) {
            nd.data.flags = nd.data.flags.filter((flag) => flag !== e.currentTarget.name)
          } else {
            if (!nd.data.flags) nd.data.flags = [e.currentTarget.name]
            else nd.data.flags = [...nd.data.flags, e.currentTarget.name]
          }
        }
        return nd
      })
      return new_nds
    })
    if (flow) {
      updateFlow(flow)
    }
    quietSaveFlows()
  }

  return (
    <workspaceContext.Provider
      value={{
        workspaceMode,
        setWorkspaceMode,
        toggleWorkspaceMode,
        nodesLayoutMode,
        setNodesLayoutMode,
        toggleNodesLayoutMode,
        settingsPage,
        setSettingsPage,
        selectedNode,
        setSelectedNode,
        handleNodeFlags,
      }}>
      {children}
    </workspaceContext.Provider>
  )
}
