/* eslint-disable react-refresh/only-export-components */
import { IFormData } from '@/components/deliver/BuildForm'
import { IFormState } from '@/components/deliver/StartRunForm'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { FlowType } from '../types/FlowTypes'
import { AppNode } from '../types/NodeTypes'
import { flowContext } from './flowContext'
import { NotificationsContext } from './notificationsContext'

export type PageType = 'edit' | 'deliver' | 'inspect' | 'settings'

type WorkspaceContextType = {
  workspaceMode: boolean
  setWorkspaceMode: React.Dispatch<React.SetStateAction<boolean>>
  toggleWorkspaceMode: () => void
  nodesLayoutMode: boolean
  setNodesLayoutMode: React.Dispatch<React.SetStateAction<boolean>>
  toggleNodesLayoutMode: () => void
  selectedNode: string
  setSelectedNode: React.Dispatch<React.SetStateAction<string>>
  handleNodeFlags: (
    e: React.MouseEvent<HTMLButtonElement>,
    setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>,
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
  currentTab: PageType
  setCurrentTab: React.Dispatch<React.SetStateAction<PageType>>
  startRunFormState: IFormState | null
  setStartRunFormState: React.Dispatch<React.SetStateAction<IFormState | null>>
  buildFormData: IFormData | null
  setBuildFormData: React.Dispatch<React.SetStateAction<IFormData | null>>
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
  selectedNode: '',
  setSelectedNode: () => {},
  handleNodeFlags: () => {},
  mouseOnPane: false,
  setMouseOnPane: () => {},
  onModalClose: () => {},
  onModalOpen: () => {},
  managerMode: false,
  setManagerMode: () => {},
  toggleManagerMode: () => {},
  currentTab: 'edit',
  setCurrentTab: () => {},
  startRunFormState: null,
  setStartRunFormState: () => {},
  buildFormData: null,
  setBuildFormData: () => {},
} as WorkspaceContextType)

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [workspaceMode, setWorkspaceMode] = useState(false)
  const [nodesLayoutMode, setNodesLayoutMode] = useState(false)
  const [managerMode, setManagerMode] = useState(false)
  const [searchParams] = useSearchParams()
  const [selectedNode, setSelectedNode] = useState('')
  const { flows, quietSaveFlows, setFlows } = useContext(flowContext)
  const [mouseOnPane, setMouseOnPane] = useState(true)
  const [modalsOpened, setModalsOpened] = useState(0)
  const [startRunFormState, setStartRunFormState] = useState<IFormState | null>(
    null,
  )
  const [buildFormData, setBuildFormData] = useState<IFormData | null>(null)
  const { notification: n } = useContext(NotificationsContext)

  const pageTypes: PageType[] = ['edit', 'deliver', 'inspect', 'settings']
  const pageType = searchParams.get('page')?.toLowerCase() as PageType
  const [currentTab, setCurrentTab] = useState<PageType>(
    pageTypes.includes(pageType) ? pageType : 'edit',
  )

  /**
   * Count opened modals for correct shortcuts work
   */
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

  const toggleWorkspaceMode = useCallback(() => {
    setWorkspaceMode(() => !workspaceMode)
    n.add({
      message: `Workspace mode is now ${workspaceMode ? 'fixed' : 'free'}.`,
      title: 'Workspace mode changed!',
      type: 'info',
    })
  }, [n, workspaceMode])

  const toggleNodesLayoutMode = useCallback(() => {
    setNodesLayoutMode(() => !nodesLayoutMode)
    n.add({
      message: `Nodes layout mode is now ${!nodesLayoutMode ? 'on' : 'off'}.`,
      title: 'Layout mode changed!',
      type: 'info',
    })
  }, [n, nodesLayoutMode])

  const toggleManagerMode = useCallback(() => {
    setManagerMode(() => !managerMode)
    n.add({
      message: `Manager mode is now ${!managerMode ? 'on' : 'off'}.`,
      title: 'Mode changed!',
      type: 'info',
    })
  }, [managerMode, n])

  const handleNodeFlags = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const nodes = flows.flatMap((flow) => flow.data.nodes)
      const new_nds = nodes.map((nd: AppNode) => {
        if (
          nd.type === 'default_node' &&
          nd.data.flags?.includes(e.currentTarget.name)
        ) {
          nd.data.flags = nd.data.flags.filter(
            (flag) => flag !== e.currentTarget.name,
          )
        }
        if (nd.type === 'default_node' && nd.id === selectedNode) {
          if (nd.data.flags?.includes(e.currentTarget.name)) {
            nd.data.flags = nd.data.flags.filter(
              (flag) => flag !== e.currentTarget.name,
            )
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
            nodes: flow.data.nodes.map((nd: AppNode) => {
              const new_nd = new_nds.find((n) => n.id === nd.id)
              if (new_nd) return new_nd
              else return nd
            }),
          },
        }
      })
      setFlows(() => new_flows)
      // if (flow) {
      //   updateFlow(flow)
      // }
      quietSaveFlows()
    },
    [flows, quietSaveFlows, selectedNode, setFlows],
  )

  const onModalOpen = useCallback((onOpen: () => void) => {
    setMouseOnPane(false)
    onOpen()
  }, [])

  const onModalClose = useCallback((onClose: () => void) => {
    setMouseOnPane(true)
    onClose()
  }, [])

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
        currentTab,
        setCurrentTab,
        startRunFormState,
        setStartRunFormState,
        buildFormData,
        setBuildFormData,
      }}
    >
      {children}
    </workspaceContext.Provider>
  )
}
