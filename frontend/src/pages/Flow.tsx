import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  HandleType,
  Node,
  NodeChange,
  OnSelectionChangeParams,
  ReactFlowInstance,
  ReactFlowRefType,
  addEdge,
  updateEdge,
  useEdgesState,
  useNodesState,
} from "reactflow"

import { a, useTransition } from "@react-spring/web"
import { useParams } from "react-router-dom"
import "reactflow/dist/style.css"
import { v4 } from "uuid"
import Chat from "../components/chat/Chat"
import CustomEdge from "../components/edges/ButtonEdge/ButtonEdge"
import FootBar from "../components/footbar/FootBar"
import DefaultNode from "../components/nodes/DefaultNode"
import LinkNode from "../components/nodes/LinkNode"
import SideBar from "../components/sidebar/SideBar"
import { NODES, NODE_NAMES } from "../consts"
import { flowContext } from "../contexts/flowContext"
import { MetaContext } from "../contexts/metaContext"
import { notificationsContext } from "../contexts/notificationsContext"
import { undoRedoContext } from "../contexts/undoRedoContext"
import { workspaceContext } from "../contexts/workspaceContext"
import "../index.css"
import { FlowType } from "../types/FlowTypes"
import { NodeDataType, NodeType, NodesTypes } from "../types/NodeTypes"
import { responseType } from "../types/ResponseTypes"
import { Preloader } from "../UI/Preloader/Preloader"
import Fallback from "./Fallback"
import Logs from "./Logs"
import NodesLayout from "./NodesLayout"
import Settings from "./Settings"

const nodeTypes = {
  default_node: DefaultNode,
  link_node: LinkNode,
}

const edgeTypes = {
  default: CustomEdge,
}

const untrackedFields = ["position", "positionAbsolute", "targetPosition", "sourcePosition"]

// export const addNodeToGraph = (node: NodeType, graph: FlowType[]) => {}

export default function Flow() {
  const reactFlowWrapper = useRef<ReactFlowRefType>(null)

  const { flows, updateFlow, saveFlows, deleteObject, reactFlowInstance, setReactFlowInstance } =
    useContext(flowContext)
  const {
    toggleWorkspaceMode,
    workspaceMode,
    nodesLayoutMode,
    setSelectedNode,
    selectedNode,
    mouseOnPane,
    managerMode,
  } = useContext(workspaceContext)
  const { screenLoading } = useContext(MetaContext)
  const { takeSnapshot, undo, copy, paste, copiedSelection } = useContext(undoRedoContext)

  const { flowId } = useParams()

  const flow = flows.find((flow: FlowType) => flow.name === flowId)

  const [nodes, setNodes, onNodesChange] = useNodesState(flow?.data.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow?.data.edges || [])

  // const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>()
  const [selection, setSelection] = useState<OnSelectionChangeParams>()
  const [selected, setSelected] = useState<string>()
  const isEdgeUpdateSuccess = useRef(false)
  const { notification: n } = useContext(notificationsContext)

  // const {
  //   isOpen: isLinkModalOpen,
  //   onOpen: onLinkModalOpen,
  //   onClose: onLinkModalClose,
  // } = useDisclosure()

  const handleUpdateFlowData = useCallback(() => {
    if (reactFlowInstance && flow && flow.name === flowId) {
      // const _node = reactFlowInstance.getNodes()[0]
      // if (_node && _node.id === flow.data.nodes[0].id) {
      flow.data = reactFlowInstance.toObject()
      updateFlow(flow)
      // }
    }
  }, [flow, flowId, reactFlowInstance, updateFlow])

  const handleFullUpdateFlowData = useCallback(() => {
    if (reactFlowInstance && flow && flow.name === flowId) {
      const _node = reactFlowInstance.getNodes()[0]
      if (_node && _node.id === flow.data.nodes[0].id) {
        flow.data = reactFlowInstance.toObject()
        updateFlow(flow)
        // const links: Node<NodeDataType>[] = flow.data.nodes.filter(
        //   (node) => node.type === "link_node"
        // )
        // links.forEach((link) => {
        //   if (
        //     !flows.find((fl) => link.data.transition.target_flow === fl.name) ||
        //     !flows.find((fl) =>
        //       fl.data.nodes.some((node) => node.id === link.data.transition.target_node)
        //     )
        //   ) {
        //     n.add({
        //       message: `Link ${link.data.id} is broken! Please configure it again.`,
        //       title: "Link error",
        //       type: "error",
        //     })
        //   }
        // })
      }
    }
  }, [flow, flowId, flows, reactFlowInstance, updateFlow])

  const filteredNodes = useMemo(() => {
    return nodes.map((obj) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !untrackedFields.includes(key))
      )
    })
  }, [nodes])

  useEffect(() => {
    handleUpdateFlowData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges, nodes.length])

  useEffect(() => {
    if (reactFlowInstance && flow?.name === flowId) {
      setNodes(flow?.data?.nodes ?? [])
      setEdges(flow?.data?.edges ?? [])
      if (flow?.data?.viewport) {
        // reactFlowInstance.fitView({ padding: 0.5 })
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
            if (nd1.type === "select" && nd2.type === "select") {
              return nd1.selected === nd2.selected ? 0 : nd2.selected ? -1 : 1
            } else {
              return 0
            }
          })
          .forEach((nd) => {
            if (nd.type === "select") {
              if (nd.selected) {
                setSelectedNode(nd.id)
                setSelected(nd.id)
              } else {
                setSelectedNode("")
                setSelected("")
              }
            }
          })
      }
      onNodesChange(nds)
    },
    [onNodesChange, setSelectedNode]
  )

  const onEdgeUpdateStart = useCallback(() => {
    isEdgeUpdateSuccess.current = false
  }, [])

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      takeSnapshot()
      setEdges((els) => updateEdge(oldEdge, newConnection, els))
      isEdgeUpdateSuccess.current = true
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setEdges]
  )

  const onEdgeUpdateEnd = useCallback(
    (event: MouseEvent | TouchEvent, edge: Edge, handleType: HandleType) => {
      takeSnapshot()
      if (!isEdgeUpdateSuccess.current) {
        deleteObject(edge.id)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onEdgeUpdate, deleteObject]
  )

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const node_ = node as NodeType
      setSelected(node_.id)
      setSelectedNode(node_.id)
    },
    [setSelected, setSelectedNode]
  )

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setSelected(edge.id)
    },
    [setSelected]
  )

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      takeSnapshot()
      setEdges((eds) => addEdge({ ...params, type: "default" }, eds))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setEdges]
  )

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelection(params)
  }, [])

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

      const START_FALLBACK_FLAGS = []
      if (
        !flows.some((flow) =>
          flow.data.nodes.some((node: Node<NodeDataType>) => node.data.flags?.includes("start"))
        )
      ) {
        START_FALLBACK_FLAGS.push("start")
      }
      if (
        !flows.some((flow) =>
          flow.data.nodes.some((node: Node<NodeDataType>) => node.data.flags?.includes("fallback"))
        )
      ) {
        START_FALLBACK_FLAGS.push("fallback")
      }

      const newNode: NodeType = {
        id: newId,
        type,
        position,
        dragHandle: NODES[type].dragHandle,
        data: {
          id: newId,
          name:
            type === "default_node"
              ? NODE_NAMES.find((name) => !nodes.some((node) => node.data.name === name)) ??
                "Empty names array"
              : NODES[type].name,
          flags: START_FALLBACK_FLAGS,
          conditions: NODES[type].conditions,
          global_conditions: [],
          local_conditions: [],
          response: NODES[type].response as responseType,
          transition: {
            target_flow: "",
            target_node: "",
          },
        },
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [takeSnapshot, reactFlowInstance, flows, setNodes]
  )

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const kbdHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault()
        if (selection) {
          copy(selection)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault()
        if (
          reactFlowInstance &&
          flow &&
          flow.name === flowId &&
          copiedSelection &&
          reactFlowWrapper.current
        ) {
          const bounds = reactFlowWrapper.current.getBoundingClientRect()
          paste(copiedSelection, { x: mousePos.x - bounds.left, y: mousePos.y - bounds.top })
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (reactFlowInstance && flow && flow.name === flowId) {
          saveFlows(flows)
          n.add({ message: "", title: "Saved!", type: "success" })
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault()
        toggleWorkspaceMode()
      }

      if ((e.key === "Backspace" || e.key === "Delete") && mouseOnPane) {
        e.preventDefault()
        if (selected) {
          takeSnapshot()
          deleteObject(selected)
        }
      }
    }

    const mouseMoveHandler = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    document.addEventListener("keydown", kbdHandler)
    document.addEventListener("mousemove", mouseMoveHandler)

    return () => {
      document.removeEventListener("keydown", kbdHandler)
      document.removeEventListener("mousemove", mouseMoveHandler)
    }
  }, [
    copiedSelection,
    copy,
    deleteObject,
    flow,
    flowId,
    flows,
    mouseOnPane,
    mousePos.x,
    mousePos.y,
    n,
    paste,
    reactFlowInstance,
    saveFlows,
    selected,
    selectedNode,
    selection,
    takeSnapshot,
    toggleWorkspaceMode,
    workspaceMode,
  ])

  const transitions = useTransition(location.pathname, {
    config: { duration: 300 },
    // delay: 75,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    exitBeforeEnter: true,
  })

  if (screenLoading.value) return <Preloader />
  else if (flows.length && !flow && !screenLoading.value) {
    return <Fallback />
  }

  return (
    <div
      data-testid='flow-page'
      className='w-screen h-screen relative flex items-start bg-background overflow-x-hidden'>
      <SideBar />
      {transitions((style) => (
        <a.div
          ref={reactFlowWrapper}
          style={{ width: "100%", height: "100vh", ...style }}
          className='col-span-6 opacity-0 pb-10'>
          <ReactFlow
            deleteKeyCode={""}
            style={{
              background: "var(--background)",
            }}
            onInit={onInit}
            minZoom={0.05}
            maxZoom={2}
            defaultViewport={flow?.data.viewport}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            onMoveStart={handleFullUpdateFlowData}
            onMoveEnd={handleFullUpdateFlowData}
            panOnScroll={true}
            panOnScrollSpeed={1.5}
            onSelectionChange={onSelectionChange}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onNodesChange={onNodesChangeMod}
            onEdgesChange={onEdgesChange}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            onNodeDragStart={() => takeSnapshot()}
            onNodeDragStop={handleFullUpdateFlowData}
            onConnect={onConnect}
            nodesConnectable={!managerMode}
            nodesDraggable={!managerMode}
            nodesFocusable={!managerMode}
            edgesUpdatable={!managerMode}
            edgesFocusable={!managerMode}
            snapGrid={workspaceMode ? [24, 24] : [96, 96]}
            snapToGrid={!workspaceMode}>
            <Background
              className='bg-background'
              variant={BackgroundVariant.Dots}
              color='var(--foreground)'
              gap={workspaceMode ? 24 : 96}
              size={workspaceMode ? 1 : 2}
            />
            <Controls
              fitViewOptions={{ padding: 0.25 }}
              className='bg-transparent shadow-none fill-foreground stroke-foreground text-foreground [&>button]:my-1 [&>button]:rounded [&>button]:bg-bg-secondary [&>button]:border-none hover:[&>button]:bg-border'
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
