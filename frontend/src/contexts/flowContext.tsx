/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useParams } from "react-router-dom"
import { v4 } from "uuid"
import { get_flows, save_flows } from "../api/flows"
import { FLOW_COLORS } from "../consts"
import { FlowType } from "../types/FlowTypes"
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
          conditions: [],
          global_conditions: [],
          local_conditions: [],
          name: "Global node",
          response: "Global response",
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
}

export const flowContext = createContext(initialValue)

export const FlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [tab, setTab] = useState(initialValue.tab)
  const { flowId } = useParams()
  const [flows, setFlows] = useState<FlowType[]>([])

  useEffect(() => {
    setTab(flowId || "")
    console.log(flowId)
  }, [flowId])

  const getFlows = async () => {
    const { data } = await get_flows()
    // console.log(data)
    if (data.flows.length) {
      if (data.flows.some((flow) => flow.name === "Global")) {
        setFlows(data.flows)
      } else {
        setFlows([globalFlow, ...data.flows])
      }
    }
  }

  useEffect(() => {
    getFlows()
  }, [])

  const saveFlows = async (flows: FlowType[]) => {
    const res = await save_flows(flows)
    console.log(res)
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
    const newNodes = flow.data.nodes.filter((node) => node.id !== id)
    saveFlows(
      flows.map((flow) =>
        flow.name === flowId ? { ...flow, data: { ...flow.data, nodes: newNodes } } : flow
      )
    )
    setFlows((flows) => flows.map((flow) => ({ ...flow, data: { ...flow.data, nodes: newNodes } })))
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
      }}>
      {children}
    </flowContext.Provider>
  )
}
