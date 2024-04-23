import React, { useState, createContext, useEffect, useCallback } from "react"
import { FlowType } from "../types/FlowTypes"
import { get_flows, save_flows } from "../api/flows"
import { generate } from "random-words"
import { FLOW_COLORS } from "../consts"
import { v4 } from "uuid"
import toast from "react-hot-toast"
import { useParams } from "react-router-dom"
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
  addFlow: (flow?: FlowType) => void
  deleteFlow: (flow: FlowType) => void
  saveFlows: (flows: FlowType[]) => void
  updateFlow: (flow: FlowType) => void
  getLocaleFlows: () => FlowType[]
  getFlows: () => void
}

const initialValue: TabContextType = {
  tab: "",
  setTab: () => {},
  flows: [],
  setFlows: () => {},
  addFlow: () => {},
  deleteFlow: () => {},
  saveFlows: () => {},
  updateFlow: () => {},
  getLocaleFlows: () => {
    return []
  },
  getFlows: async () => {},
}

export const flowContext = createContext(initialValue)

export const FlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [tab, setTab] = useState(initialValue.tab)
  const { flowId } = useParams()
  const [flows, setFlows] = useState<FlowType[]>([])

  useEffect(() => {
    setTab(flowId || '')
    console.log(flowId)
  }, [flowId]) 

  const getFlows = async () => {
    const { data } = await get_flows()
    console.log(data)
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

  const getLocaleFlows = () => {
    return flows
  }

  const addFlow = (flow?: FlowType) => {
    // const name = generate({
    //   exactly: 1,
    //   wordsPerString: 2,
    //   join: " ",
    //   formatter: (word, index) =>
    //     index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    // })
    // const description = generate({
    //   exactly: 1,
    //   wordsPerString: 4,
    //   join: " ",
    //   formatter: (word, index) =>
    //     index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    // })
    // console.log(name)
    // const new_flow: FlowType = flow ?? {
    //   data: {
    //     nodes: [],
    //     edges: [],
    //     viewport: {
    //       x: 0,
    //       y: 0,
    //       zoom: 1,
    //     },
    //   },
    //   color: FLOW_COLORS[Math.floor(Math.random() * FLOW_COLORS.length)],
    //   description: description,
    //   name: name,
    // }
    // const new_flows = [...flows, new_flow]
    // saveFlows(new_flows)
    // setFlows(new_flows)
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
      setFlows(prev => new_flows)
    },
    [flows]
  )

  return (
    <flowContext.Provider
      value={{
        tab,
        setTab,
        flows,
        setFlows,
        addFlow,
        deleteFlow,
        saveFlows,
        updateFlow,
        getLocaleFlows,
        getFlows,
      }}>
      {children}
    </flowContext.Provider>
  )
}
