/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useParams } from "react-router-dom"
import { Edge } from "reactflow"
import { v4 } from "uuid"
import { get_flows, save_flows } from "../api/flows"
import { FLOW_COLORS } from "../consts"
import { FlowType } from "../types/FlowTypes"
import { NodeType } from "../types/NodeTypes"
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
          flags: [],
          conditions: [],
          global_conditions: [],
          local_conditions: [],
          name: "Global node",
          response: {
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

type TabContextType = {
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
}

const initialValue: TabContextType = {
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
}

export const flowContext = createContext(initialValue)

export const FlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [tab, setTab] = useState(initialValue.tab)
  const { flowId } = useParams()
  const [flows, setFlows] = useState<FlowType[]>([])

  useEffect(() => {
    setTab(flowId || "")
  }, [flowId])

  const getFlows = async () => {
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
  }

  useEffect(() => { 
    getFlows()
  }, [])

  const saveFlows = async (flows: FlowType[]) => {
    const res = await save_flows(flows)
    setFlows(flows)
  }

  const quietSaveFlows = async () => {
    setTimeout(async () => {
      console.log("quiet save flows")
      await saveFlows(flows)
      toast.success("DEBUG: Flows saved")
    }, 100)
  }

  const getLocaleFlows = () => {
    return flows
  }

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

  const deleteNode = (id: string) => {
    const flow = flows.find((flow) => flow.data.nodes.some((node) => node.id === id))
    if (!flow) return -1
    const deleted_node: NodeType = flow.data.nodes.find((node) => node.id === id) as NodeType
    if (deleted_node?.data.flags?.includes("start")) return toast.error("Can't delete start node")
    if (deleted_node?.id?.includes("LOCAL")) return toast.error("Can't delete local node")
    if (deleted_node?.id?.includes("GLOBAL")) return toast.error("Can't delete global node")
    if (deleted_node?.data.flags?.includes("fallback")) {
      console.log(
        flow.data.nodes
          .find((node) => node.id !== id && !node.data.id.includes("LOCAL"))
          ?.data.flags.push("fallback")
      )
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
  }

  const deleteEdge = (id: string) => {
    const flow = flows.find((flow) => flow.data.edges.some((edge) => edge.id === id))
    if (!flow) return -1
    const newEdges = flow.data.edges.filter((edge) => edge.id !== id)
    saveFlows(
      flows.map((flow) =>
        flow.name === flowId ? { ...flow, data: { ...flow.data, edges: newEdges } } : flow
      )
    )
    setFlows((flows) => flows.map((flow) => ({ ...flow, data: { ...flow.data, edges: newEdges } })))
  }

  const deleteObject = (id: string) => {
    const flow_node = flows.find((flow) => flow.data.nodes.some((node) => node.id === id))
    const flow_edge = flows.find((flow) => flow.data.edges.some((edge) => edge.id === id))
    if (!flow_node && !flow_edge) return -1
    if (flow_node) deleteNode(id)
    if (flow_edge) deleteEdge(id)
  }

  return (
    <flowContext.Provider
      value={{
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
      }}>
      {children}
    </flowContext.Provider>
  )
}
