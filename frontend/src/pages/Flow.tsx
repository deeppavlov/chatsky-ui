import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  NodeChange,
  OnSelectionChangeFunc,
  OnSelectionChangeParams,
  ReactFlowJsonObject,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import React, { useCallback, useContext, useEffect, useRef, useState } from "react"

import { a, useTransition } from "@react-spring/web"
import "@xyflow/react/dist/style.css"
import { useParams } from "react-router-dom"
import { v4 } from "uuid"
import Chat from "../components/chat/Chat"
import CustomEdge from "../components/edges/ButtonEdge/ButtonEdge"
import FootBar from "../components/footbar/FootBar"
import DefaultNode from "../components/nodes/DefaultNode"
import LinkNode from "../components/nodes/LinkNode"
import ReactFlowCustom from "../components/ReactFlowCustom"
import SideBar from "../components/sidebar/SideBar"
import { NODES, NODE_NAMES } from "../consts"
import { CustomReactFlowInstanceType, flowContext } from "../contexts/flowContext"
import { MetaContext } from "../contexts/metaContext"
import { NotificationsContext } from "../contexts/notificationsContext"
import { undoRedoContext } from "../contexts/undoRedoContext"
import { workspaceContext } from "../contexts/workspaceContext"
import "../index.css"
import { FlowType } from "../types/FlowTypes"
import { AppNode, NodesTypes } from "../types/NodeTypes"
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

export default function Flow() {
  const {
    flows,
    updateFlow,
    saveFlows,
    reactFlowInstance,
    setReactFlowInstance,
    validateDeletion,
  } = useContext(flowContext)
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
  const { takeSnapshot, copy, paste, copiedSelection, disableCopyPaste } =
    useContext(undoRedoContext)
  const { flowId } = useParams()
  const flow = flows.find((flow: FlowType) => flow.name === flowId)

  const [nodes, setNodes, onNodesChange] = useNodesState(flow?.data.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow?.data.edges || [])

  const [selection, setSelection] = useState<OnSelectionChangeParams>()
  const [selected, setSelected] = useState<string>()
  const isEdgeUpdateSuccess = useRef(false)
  const { notification: n } = useContext(NotificationsContext)

  /**
   * Function update flow data function translates reactFlowInstanceJSON to flow.data
   * @param {AppNode[]} nodes optional changed nodes
   * @param {Edge[]} edges optional changed edges
   */
  const handleUpdateFlowData = useCallback(
    (nodes?: AppNode[], edges?: Edge[]) => {
      if (reactFlowInstance && flow && flow.name === flowId) {
        flow.data = reactFlowInstance.toObject() as ReactFlowJsonObject<AppNode, Edge>
        if (nodes) {
          flow.data.nodes = flow.data.nodes.map((node) => {
            const curr_node = nodes.find((nd) => nd.id === node.id)
            if (curr_node) {
              return curr_node
            } else {
              return node
            }
          })
        }
        updateFlow(flow)
      }
    },
    [flow, flowId, reactFlowInstance, updateFlow]
  )

  /**
   * Function update flow data function translates reactFlowInstanceJSON to flow.data
   * With additional first node check
   */
  const handleFullUpdateFlowData = useCallback(() => {
    if (reactFlowInstance && flow && flow.name === flowId) {
      const _node = reactFlowInstance.getNodes()[0]
      if (_node && _node.id === flow.data.nodes[0].id) {
        flow.data = reactFlowInstance.toObject() as ReactFlowJsonObject<AppNode, Edge>
        updateFlow(flow)
      }
    }
  }, [flow, flowId, reactFlowInstance, updateFlow])

  /**
   *  update flow.data when edges or nodes.length changed (no check nodes array)
   * */
  useEffect(() => {
    handleUpdateFlowData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges, nodes.length])

  useEffect(() => {
    if (flow && reactFlowInstance && flow.name === flowId) {
      setNodes(flow.data.nodes)
      setEdges(flow.data.edges)
      if (flow.data.viewport) {
        // reactFlowInstance.fitView({ padding: 0.5 })
      } else {
        reactFlowInstance.fitView({ padding: 0.5 })
      }
    }
  }, [flow, flowId, reactFlowInstance, setEdges, setNodes])

  /**
   * Initiate new reactFlowInstance object
   * @param {CustomReactFlowInstanceType} e new reactFlowInstance object value
   */
  const onInit = useCallback(
    (e: CustomReactFlowInstanceType) => {
      setReactFlowInstance(e)
    },
    [setReactFlowInstance]
  )

  const onNodesChangeMod = useCallback(
    (nds: NodeChange<AppNode>[]) => {
      console.log("nds change")
      if (nds) {
        // only calls update flow data function when node change type = "replace" (no call when move)
        if (nds.every((nd) => nd.type === "replace")) {
          handleUpdateFlowData(nds.map((nd) => nd.item))
        }
        nds
          .sort((nd1: NodeChange, nd2: NodeChange) => {
            if (nd1.type === "select" && nd2.type === "select") {
              return nd1.selected === nd2.selected ? 0 : nd2.selected ? -1 : 1
            } else {
              return 0
            }
          })
          .forEach((nd) => {
            console.log(nd)
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
    [handleUpdateFlowData, onNodesChange, setSelectedNode]
  )

  const onEdgeUpdateStart = useCallback(() => {
    takeSnapshot()
  }, [takeSnapshot])

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setEdges]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: AppNode) => {
      const node_ = node as AppNode
      setSelected(node_.id)
      setSelectedNode(node_.id)
    },
    [setSelected, setSelectedNode]
  )

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
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

  const onSelectionChange: OnSelectionChangeFunc = useCallback((params) => {
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
      const type: NodesTypes = event.dataTransfer.getData("application/@xyflow/react") as NodesTypes
      // check if the dropped element is valid
      if (typeof type === "undefined" || !type || !reactFlowInstance) {
        return
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const newId = type + "_" + v4()
      const START_FALLBACK_FLAGS = []
      if (
        !flows.some((flow) =>
          flow.data.nodes.some(
            (node: AppNode) => node.type === "default_node" && node.data.flags?.includes("start")
          )
        )
      ) {
        START_FALLBACK_FLAGS.push("start")
      }
      if (
        !flows.some((flow) =>
          flow.data.nodes.some(
            (node: AppNode) => node.type === "default_node" && node.data.flags?.includes("fallback")
          )
        )
      ) {
        START_FALLBACK_FLAGS.push("fallback")
      }
      let newNode = {} as AppNode
      if (type === "default_node") {
        newNode = {
          id: newId,
          type,
          position,
          dragHandle: NODES[type].dragHandle,
          data: {
            id: newId,
            name:
              NODE_NAMES.find((name) => !nodes.some((node) => node.data.name === name)) ??
              "Empty names array",
            flags: START_FALLBACK_FLAGS,
            conditions: NODES[type].conditions,
            global_conditions: [],
            local_conditions: [],
            response: NODES[type].response as responseType,
          },
        }
      }
      if (type === "link_node") {
        newNode = {
          id: newId,
          type,
          position,
          data: {
            id: newId,
            name: "Link",
            transition: {
              target_flow: "",
              target_node: "",
            },
          },
        }
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [takeSnapshot, reactFlowInstance, flows, setNodes, nodes]
  )

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })


  /**
   * Keyboard shortcuts handlers 
   */
  useEffect(() => {
    const kbdHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !disableCopyPaste) {
        e.preventDefault()
        if (selection) {
          copy(selection)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && !disableCopyPaste) {
        e.preventDefault()
        if (reactFlowInstance && flow && flow.name === flowId && copiedSelection) {
          paste(copiedSelection, { x: mousePos.x, y: mousePos.y })
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
    disableCopyPaste,
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
          style={{ width: "100%", height: "100vh", ...style }}
          className='col-span-6 opacity-0 pb-10'>
          <ReactFlowCustom
            deleteKeyCode={["Backspace", "Delete"]}
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
            onReconnect={onEdgeUpdate}
            onReconnectStart={onEdgeUpdateStart}
            onNodeDragStart={() => takeSnapshot()}
            onNodeDragStop={handleFullUpdateFlowData}
            onConnect={onConnect}
            onBeforeDelete={validateDeletion}
            edgesReconnectable={!managerMode}
            nodesConnectable={!managerMode}
            nodesDraggable={!managerMode}
            nodesFocusable={!managerMode}
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
          </ReactFlowCustom>
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
