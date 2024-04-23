import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
  Edge,
  Connection,
  NodeChange,
  updateEdge,
  Node,
} from "reactflow"

import "reactflow/dist/style.css"
import "../index.css"
import { v4 } from "uuid"
import DefaultNode from "../components/nodes/DefaultNode"
import { NodeDataType, NodeType, NodesTypes } from "../types/NodeTypes"
import SideBar from "../components/sidebar/SideBar"
import StartNode from "../components/nodes/StartNode"
import { NODES, START_FALLBACK_NODE_FLAGS } from "../consts"
import FallbackNode from "../components/nodes/FallbackNode"
import { useParams } from "react-router-dom"
import { FlowType } from "../types/FlowTypes"
import { flowContext } from "../contexts/flowContext"
import { a, useTransition } from "@react-spring/web"
import LinkNode from "../components/nodes/LinkNode"
import toast from "react-hot-toast"
import LinkModal from "../modals/LinkModal/LinkModal"
import { useDisclosure } from "@nextui-org/react"
import { workspaceContext } from "../contexts/workspaceContext"
import Logs from "./Logs"
import { UndoRedoProvider, undoRedoContext } from "../contexts/undoRedoContext"
import Chat from "../components/chat/Chat"
import NodesLayout from "./NodesLayout"
import FootBar from "../components/footbar/FootBar"
import Settings from "./Settings"

const nodeTypes = {
  default_node: DefaultNode,
  start_node: StartNode,
  fallback_node: FallbackNode,
  link: LinkNode,
}

export default function Flow() {
  const reactFlowWrapper = useRef(null)

  const { flows, updateFlow, saveFlows } = useContext(flowContext)
  const { toggleWorkspaceMode, workspaceMode, nodesLayoutMode, setSelectedNode, selectedNode } =
    useContext(workspaceContext)
  const { takeSnapshot } = useContext(undoRedoContext)

  const { flowId } = useParams()

  const flow = flows.find((flow: FlowType) => flow.name === flowId)

  const [nodes, setNodes, onNodesChange] = useNodesState(flow?.data.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow?.data.edges || [])
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>()

  const {
    isOpen: isLinkModalOpen,
    onOpen: onLinkModalOpen,
    onClose: onLinkModalClose,
  } = useDisclosure()

  useEffect(() => {
    if (flow && reactFlowInstance) {
      flow.data = reactFlowInstance.toObject()
      updateFlow(flow)
      console.log("update flow")
    }
  }, [nodes, edges])

  useEffect(() => {
    if (reactFlowInstance && flow?.name === flowId) {
      setNodes(flow?.data?.nodes ?? [])
      setEdges(flow?.data?.edges ?? [])
      if (flow?.data?.viewport) {
        reactFlowInstance.fitView({ padding: 0.5 })
      } else {
        reactFlowInstance.fitView({ padding: 0.5 })
      }
    }
  }, [flow, flowId, reactFlowInstance, setEdges, setNodes])

  const onInit = useCallback((e: ReactFlowInstance) => {
    setReactFlowInstance(e)
  }, [])

  const onNodesChangeMod = useCallback(
    (nds: NodeChange[]) => {
      if (nds) {
        nds
          .sort((nd1: NodeChange, nd2: NodeChange) => {
            if (nd1.type === 'select' && nd2.type === 'select') {
              return nd1.selected === nd2.selected ? 0 : nd2.selected ? -1 : 1
            } else {
              return 0
            }
          })
          .forEach((nd) => {
            if (nd.type === "select") {
              if (nd.selected) {
                setSelectedNode(nd.id)
              } else {
                setSelectedNode("")
              }
            }
            console.log(selectedNode)
          })
      }
      console.log("nds change", nds)
      onNodesChange(nds)
    },
    [onNodesChange, selectedNode, setSelectedNode]
  )

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      takeSnapshot()
      setEdges((els) => updateEdge(oldEdge, newConnection, els))
    },
    [setEdges]
  )

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      takeSnapshot()
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      takeSnapshot()

      const type: NodesTypes = event.dataTransfer.getData("application/reactflow") as NodesTypes

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type || !reactFlowInstance) {
        return
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const newId = v4()
      const newNode: NodeType = {
        id: newId,
        type,
        position,
        data: {
          id: newId,
          name: NODES[type].name,
          flags: flow?.data.nodes.length ? [] : START_FALLBACK_NODE_FLAGS,
          conditions: NODES[type].conditions,
          global_conditions: [],
          local_conditions: [],
          response: NODES[type].response,
          to: "",
        },
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [takeSnapshot, reactFlowInstance, setNodes, flow]
  )

  useEffect(() => {
    const kbdHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (reactFlowInstance && flow && flow.name === flowId) {
          saveFlows(flows)
          toast.success("Saved!")
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault()
        toggleWorkspaceMode()
        toast.success("Workspace mode: " + (workspaceMode ? "Fixed" : "Free"))
      }
    }

    document.addEventListener("keydown", kbdHandler)

    return () => {
      document.removeEventListener("keydown", kbdHandler)
    }
  }, [flow, flowId, flows, reactFlowInstance, saveFlows, toggleWorkspaceMode, workspaceMode])

  const transitions = useTransition(location.pathname, {
    config: { duration: 300 },
    // delay: 75,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    exitBeforeEnter: true,
  })

  return (
    <div className='w-screen h-screen relative flex items-start bg-background overflow-x-hidden'>
      <SideBar />
      {transitions((style) => (
        <a.div
          ref={reactFlowWrapper}
          style={{ width: "100%", height: "100vh", ...style }}
          className='col-span-6 opacity-0 pb-10'>
          <ReactFlow
            style={{
              background: "var(--background)",
            }}
            onInit={onInit}
            minZoom={0.05}
            maxZoom={2}
            defaultViewport={flow?.data.viewport}
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onMove={() => {
              if (reactFlowInstance && flow && flow.name === flowId) {
                const _node = reactFlowInstance.getNodes()[0]
                if (_node && _node.id === flow.data.nodes[0].id) {
                  flow.data = reactFlowInstance.toObject()
                  updateFlow(flow)
                }
              }
            }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodesChange={onNodesChangeMod}
            onEdgesChange={onEdgesChange}
            onEdgeUpdate={onEdgeUpdate}
            onNodeDragStart={() => takeSnapshot()}
            onConnect={onConnect}
            snapGrid={workspaceMode ? [24, 24] : [96, 96]}
            snapToGrid={!workspaceMode}>
            <Controls
              fitViewOptions={{ padding: 0.25 }}
              className='fill-foreground stroke-foreground text-foreground [&>button]:my-1 [&>button]:rounded [&>button]:bg-bg-secondary [&>button]:border-none hover:[&>button]:bg-border'
            />
            {/* <MiniMap style={{
              background: "var(--background)",
            }} /> */}
            <Background
              className='bg-background'
              variant={BackgroundVariant.Dots}
              color='var(--foreground)'
              gap={workspaceMode ? 24 : 96}
              size={workspaceMode ? 1 : 2}
            />
          </ReactFlow>
        </a.div>
      ))}
      {nodesLayoutMode && <NodesLayout />}
      <Logs />
      <Chat />
      <Settings />
      <FootBar />
    </div>
  )
}
