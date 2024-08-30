/* eslint-disable react-refresh/only-export-components */
import { Edge, OnBeforeDelete, ReactFlowInstance } from "@xyflow/react"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { v4 } from "uuid"
import { get_flows, save_flows } from "../api/flows"
import { FLOW_COLORS } from "../consts"
import { FlowType } from "../types/FlowTypes"
import { AppNode } from "../types/NodeTypes"
import { MetaContext } from "./metaContext"
import { NotificationsContext } from "./notificationsContext"
// import { v4 } from "uuid"

const globalFlow: FlowType = {
  id: "GLOBAL",
  name: "Global",
  description: "This is Global Flow",
  color: FLOW_COLORS[5],
  data: {
    nodes: [
      {
        id: v4(),
        type: "default_node",
        data: {
          id: "GLOBAL_NODE",
          flags: [],
          conditions: [],
          global_conditions: [],
          local_conditions: [],
          name: "Global node",
          response: {
            id: "GLOBAL_NODE_RESPONSE",
            name: "global_response",
            type: "text",
            data: [{ text: "Global node response", priority: 1 }],
          },
        },
        position: {
          x: 0,
          y: 0,
        },
      },
    ],
    edges: [],
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
  },
}

export type CustomReactFlowInstanceType = ReactFlowInstance<AppNode, Edge>

type TabContextType = {
  reactFlowInstance: CustomReactFlowInstanceType | null
  setReactFlowInstance: React.Dispatch<React.SetStateAction<CustomReactFlowInstanceType | null>>
  tab: string
  setTab: React.Dispatch<React.SetStateAction<string>>
  flows: FlowType[]
  setFlows: React.Dispatch<React.SetStateAction<FlowType[]>>
  deleteFlow: (flow: FlowType) => void
  saveFlows: (flows: FlowType[]) => void
  quietSaveFlows: () => void
  updateFlow: (flow: FlowType) => void
  getLocaleFlows: () => FlowType[]
  getFlows: () => void
  deleteNode: (id: string) => void
  deleteEdge: (id: string) => void
  deleteObject: (id: string) => void
  validateDeletion: OnBeforeDelete<AppNode, Edge>
  validateNodeDeletion: (node: AppNode) => boolean
}

const initialValue: TabContextType = {
  reactFlowInstance: null,
  setReactFlowInstance: () => {},
  tab: "",
  setTab: () => {},
  flows: [],
  setFlows: () => {},
  deleteFlow: () => {},
  saveFlows: () => {},
  quietSaveFlows: () => {},
  updateFlow: () => {},
  getLocaleFlows: () => {
    return []
  },
  getFlows: async () => {},
  deleteNode: () => {},
  deleteEdge: () => {},
  deleteObject: () => {},
  validateDeletion: () =>
    new Promise(() => {
      return false
    }),
  validateNodeDeletion: () => false,
}

export const flowContext = createContext(initialValue)

export const FlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    AppNode,
    Edge
  > | null>(null)
  const [tab, setTab] = useState(initialValue.tab)
  const { flowId } = useParams()
  const [flows, setFlows] = useState<FlowType[]>([])
  const { notification: n } = useContext(NotificationsContext)
  const { screenLoading } = useContext(MetaContext)

  useEffect(() => {
    setTab(flowId || "")
  }, [flowId])

  const getFlows = async () => {
    screenLoading.addScreenLoading()
    try {
      const { data } = await get_flows()
      if (data.flows) {
        if (data.flows.some((flow) => flow.name === "Global")) {
          setFlows(data.flows)
        } else {
          setFlows([globalFlow, ...data.flows])
        }
      } else {
        setFlows([globalFlow])
      }
    } catch (error) {
      console.error(error)
    } finally {
      screenLoading.removeScreenLoading()
    }
  }

  useEffect(() => {
    getFlows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveFlows = async (flows: FlowType[]) => {
    await save_flows(flows)
    setFlows(flows)
  }

  const quietSaveFlows = async () => {
    setTimeout(async () => {
      console.log("quiet save flows")
      await saveFlows(flows)
      n.add({ message: "Flows saved", title: "DEBUG", type: "debug" })
    }, 100)
  }

  const getLocaleFlows = useCallback(() => {
    return flows
  }, [flows])

  const deleteFlow = useCallback(
    (flow: FlowType) => {
      const new_flows = flows.filter((f) => f.name !== flow.name)
      saveFlows(new_flows)
      setFlows(new_flows)
    },
    [flows]
  )

  const updateFlow = useCallback(
    (flow: FlowType) => {
      const new_flows = flows.map((f) => (f.name === flow.name ? flow : f))
      // saveFlows(new_flows)
      setFlows(() => new_flows)
    },
    [flows]
  )

  const validateDeletion = ({ nodes, edges }: { nodes: AppNode[]; edges: Edge[] }) => {
    const is_nodes_valid = nodes.every((node) => {
      if (node.type === "default_node" && node?.data.flags?.includes("start")) {
        n.add({ title: "Warning!", message: "Can't delete start node", type: "warning" })
        return false
      }
      if (node?.id?.includes("LOCAL")) {
        n.add({ title: "Warning!", message: "Can't delete local node", type: "warning" })
        return false
      }
      if (node?.id?.includes("GLOBAL")) {
        n.add({ title: "Warning!", message: "Can't delete global node", type: "warning" })
        return false
      }
      return true
    })
    return new Promise<boolean>((resolve) => {
      resolve(is_nodes_valid)
    })
  }

  const validateNodeDeletion = (node: AppNode) => {
    if (node.type === "default_node" && node.data.flags.includes("start")) {
      n.add({ title: "Warning!", message: "Can't delete start node", type: "warning" })
      return false
    }
    if (node.id.includes("LOCAL")) {
      n.add({ title: "Warning!", message: "Can't delete local node", type: "warning" })
      return false
    }
    if (node.id.includes("GLOBAL")) {
      n.add({ title: "Warning!", message: "Can't delete global node", type: "warning" })
      return false
    }
    return true
  }

  const deleteNode = useCallback(
    (id: string) => {
      const flow = flows.find((flow) => flow.data.nodes.some((node) => node.id === id))
      if (!flow) return -1
      const deleted_node: AppNode = flow.data.nodes.find((node) => node.id === id) as AppNode
      if (deleted_node.type === "default_node" && deleted_node?.data.flags?.includes("start"))
        return n.add({ title: "Warning!", message: "Can't delete start node", type: "warning" })
      if (deleted_node?.id?.includes("LOCAL"))
        return n.add({ title: "Warning!", message: "Can't delete local node", type: "warning" })
      if (deleted_node?.id?.includes("GLOBAL"))
        return n.add({ title: "Warning!", message: "Can't delete global node", type: "warning" })
      if (deleted_node.type === "default_node" && deleted_node?.data.flags?.includes("fallback")) {
        // any_node.data.flags?.push("fallback")
      }
      const newNodes = flow.data.nodes.filter((node) => node.id !== id)
      const newEdges = flow.data.edges.filter(
        (edge: Edge) => edge.source !== id && edge.target !== id
      )
      const newFlows = flows.map((flow) =>
        flow.name === flowId
          ? { ...flow, data: { ...flow.data, nodes: newNodes, edges: newEdges } }
          : flow
      )
      saveFlows(newFlows)
      setFlows(newFlows)
    },
    [flowId, flows, n]
  )

  const deleteEdge = useCallback(
    (id: string) => {
      const flow = flows.find((flow) => flow.data.edges.some((edge) => edge.id === id))
      if (!flow) return -1
      const newEdges = flow.data.edges.filter((edge) => edge.id !== id)
      saveFlows(
        flows.map((flow) =>
          flow.name === flowId ? { ...flow, data: { ...flow.data, edges: newEdges } } : flow
        )
      )
      setFlows((flows) =>
        flows.map((flow) => ({ ...flow, data: { ...flow.data, edges: newEdges } }))
      )
    },
    [flowId, flows]
  )

  const deleteObject = useCallback(
    (id: string) => {
      const flow_node = flows.find((flow) => flow.data.nodes.some((node) => node.id === id))
      const flow_edge = flows.find((flow) => flow.data.edges.some((edge) => edge.id === id))
      if (!flow_node && !flow_edge) return -1
      if (flow_node) deleteNode(id)
      if (flow_edge) deleteEdge(id)
    },
    [deleteEdge, deleteNode, flows]
  )

  return (
    <flowContext.Provider
      value={{
        reactFlowInstance,
        setReactFlowInstance,
        tab,
        setTab,
        flows,
        setFlows,
        deleteFlow,
        saveFlows,
        quietSaveFlows,
        updateFlow,
        getLocaleFlows,
        getFlows,
        deleteNode,
        deleteEdge,
        deleteObject,
        validateDeletion,
        validateNodeDeletion,
      }}>
      {children}
    </flowContext.Provider>
  )
}
