/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Node } from "reactflow"
import { FlowType } from "../types/FlowTypes"
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
  handleNodeFlags: (
    e: React.MouseEvent<HTMLButtonElement>,
    setNodes: React.Dispatch<React.SetStateAction<Node<NodeDataType>[]>>
  ) => void
  mouseOnPane: boolean
  setMouseOnPane: React.Dispatch<React.SetStateAction<boolean>>
  modalsOpened: number
  setModalsOpened: React.Dispatch<React.SetStateAction<number>>
  onModalClose: (onClose: () => void) => void
  onModalOpen: (onOpen: () => void) => void
  managerMode: boolean
  setManagerMode: React.Dispatch<React.SetStateAction<boolean>>
  toggleManagerMode: () => void
}

export const workspaceContext = createContext<WorkspaceContextType>({
  modalsOpened: 0,
  setModalsOpened: () => {},
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
  mouseOnPane: false,
  setMouseOnPane: () => {},
  onModalClose: () => {},
  onModalOpen: () => {},
  managerMode: false,
  setManagerMode: () => {},
  toggleManagerMode: () => {},
} as WorkspaceContextType)

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [workspaceMode, setWorkspaceMode] = useState(false)
  const [nodesLayoutMode, setNodesLayoutMode] = useState(false)
  const [managerMode, setManagerMode] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [settingsPage, setSettingsPage] = useState(searchParams.get('settings') === 'opened')
  const [selectedNode, setSelectedNode] = useState("")
  const { updateFlow, flows, tab, quietSaveFlows, setFlows } = useContext(flowContext)
  const [mouseOnPane, setMouseOnPane] = useState(true)
  const [modalsOpened, setModalsOpened] = useState(0)

  useEffect(() => {
    console.log(modalsOpened)
  }, [modalsOpened])

  useEffect(() => {
    if (modalsOpened === 0) {
      setMouseOnPane(true)
    } else if (modalsOpened > 0) {
      setMouseOnPane(false)
    }
    if (modalsOpened < 0) {
      setModalsOpened(0)
    }
  }, [modalsOpened])
  
  useEffect(() => console.log(mouseOnPane), [mouseOnPane])

  const flow = flows.find((flow) => flow.name === tab)

  const toggleWorkspaceMode = () => {
    setWorkspaceMode(() => !workspaceMode)
  }

  const toggleNodesLayoutMode = () => {
    setNodesLayoutMode(() => !nodesLayoutMode)
  }

  const toggleManagerMode = () => {
    setManagerMode(() => !managerMode)
  }

  const handleNodeFlags = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nodes = flows.flatMap((flow) => flow.data.nodes)
    console.log(nodes)
    const new_nds = nodes.map((nd: Node<NodeDataType>) => {
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
    const new_flows: FlowType[] = flows.map((flow) => {
      return {
        ...flow,
        data: {
          ...flow.data,
          nodes: flow.data.nodes.map((nd: Node<NodeDataType>) => {
            const new_nd = new_nds.find((n) => n.id === nd.id)
            if (new_nd) return new_nd
            else return nd
          }),
        },
      }
    })
    setFlows(new_flows)

    if (flow) {
      updateFlow(flow)
    }
    quietSaveFlows()
  }

  const onModalOpen = (onOpen: () => void) => {
    setMouseOnPane(false)
    onOpen()
  }

  const onModalClose = (onClose: () => void) => {
    setMouseOnPane(true)
    onClose()
  }

  return (
    <workspaceContext.Provider
      value={{
        modalsOpened,
        setModalsOpened,
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
        mouseOnPane,
        setMouseOnPane,
        onModalClose,
        onModalOpen,
        managerMode,
        setManagerMode,
        toggleManagerMode,
      }}>
      {children}
    </workspaceContext.Provider>
  )
}
