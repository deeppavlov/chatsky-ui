import { addEdge, Edge, Node, OnSelectionChangeParams, useReactFlow } from "@xyflow/react"
import { cloneDeep } from "lodash"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { v4 } from "uuid"
import { AppNode } from "../types/NodeTypes"
import { OnSelectionChangeParamsCustom } from "../types/ReactFlowTypes"
import { generateNewNode } from "../utils"
import { flowContext } from "./flowContext"
import { NotificationsContext } from "./notificationsContext"
import { workspaceContext } from "./workspaceContext"

type undoRedoContextType = {
  undo: () => void
  redo: () => void
  takeSnapshot: () => void
  copy: (selection: OnSelectionChangeParams) => void
  paste: (
    selectionInstance: OnSelectionChangeParams,
    position: { x: number; y: number; paneX?: number; paneY?: number }
  ) => void
  copiedSelection: OnSelectionChangeParams | null
  disableCopyPaste: boolean
  setDisableCopyPaste: React.Dispatch<React.SetStateAction<boolean>>
}

type UseUndoRedoOptions = {
  maxHistorySize: number
  enableShortcuts: boolean
}

type HistoryItem = {
  nodes: Node[]
  edges: Edge[]
}

const initialValue = {
  undo: () => {},
  redo: () => {},
  takeSnapshot: () => {},
  copy: () => {},
  paste: () => {},
  copiedSelection: null,
  disableCopyPaste: false,
  setDisableCopyPaste: () => {},
}

const defaultOptions: UseUndoRedoOptions = {
  maxHistorySize: 100,
  enableShortcuts: true,
}

// eslint-disable-next-line react-refresh/only-export-components
export const undoRedoContext = createContext<undoRedoContextType>(initialValue)

export function UndoRedoProvider({ children }: { children: React.ReactNode }) {
  const { tab, flows } = useContext(flowContext)
  const { notification: n } = useContext(NotificationsContext)
  const { modalsOpened } = useContext(workspaceContext)

  const [past, setPast] = useState<HistoryItem[][]>(flows.map(() => []))
  const [future, setFuture] = useState<HistoryItem[][]>(flows.map(() => []))
  const [tabIndex, setTabIndex] = useState(flows.findIndex((f) => f.name === tab))
  const [disableCopyPaste, setDisableCopyPaste] = useState(false)

  useEffect(() => {
    // whenever the flows variable changes, we need to add one array to the past and future states
    setPast((old) => flows.map((f, i) => (old[i] ? old[i] : [])))
    setFuture((old) => flows.map((f, i) => (old[i] ? old[i] : [])))
    setTabIndex(flows.findIndex((f) => f.name === tab))
  }, [flows, tab])

  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow()

  /**
   * Take snapshot for undo/redo functions
   */
  const takeSnapshot = useCallback(() => {
    // push the current graph to the past state
    if (tabIndex > -1) {
      setPast((old) => {
        const newPast = cloneDeep(old)
        newPast[tabIndex] = old[tabIndex].slice(
          old[tabIndex].length - defaultOptions.maxHistorySize + 1,
          old[tabIndex].length
        )
        newPast[tabIndex].push({ nodes: getNodes(), edges: getEdges() })
        return newPast
      })

      // whenever we take a new snapshot, the redo operations need to be cleared to avoid state mismatches
      setFuture((old) => {
        const newFuture = cloneDeep(old)
        newFuture[tabIndex] = []
        return newFuture
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getNodes, getEdges, past, future, flows, tab, setPast, setFuture, tabIndex])

  /**
   * Undo function
   */
  const undo = useCallback(() => {
    // get the last state that we want to go back to
    const pastState = past[tabIndex][past[tabIndex].length - 1]

    if (pastState) {
      // first we remove the state from the history
      setPast((old) => {
        const newPast = cloneDeep(old)
        newPast[tabIndex] = old[tabIndex].slice(0, old[tabIndex].length - 1)
        return newPast
      })
      // we store the current graph for the redo operation
      setFuture((old) => {
        const newFuture = cloneDeep(old)
        newFuture[tabIndex] = old[tabIndex]
        newFuture[tabIndex].push({ nodes: getNodes(), edges: getEdges() })
        return newFuture
      })
      // now we can set the graph to the past state
      setNodes(pastState.nodes)
      setEdges(pastState.edges)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setNodes, setEdges, getNodes, getEdges, future, past, setFuture, setPast, tabIndex])

  /**
   * Redo function
   */
  const redo = useCallback(() => {
    const futureState = future[tabIndex][future[tabIndex].length - 1]

    if (futureState) {
      setFuture((old) => {
        const newFuture = cloneDeep(old)
        newFuture[tabIndex] = old[tabIndex].slice(0, old[tabIndex].length - 1)
        return newFuture
      })
      setPast((old) => {
        const newPast = cloneDeep(old)
        newPast[tabIndex] = old[tabIndex]
        newPast[tabIndex].push({ nodes: getNodes(), edges: getEdges() })
        return newPast
      })
      setNodes(futureState.nodes)
      setEdges(futureState.edges)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [future, past, setFuture, setPast, setNodes, setEdges, getNodes, getEdges, future, tabIndex])

  useEffect(() => {
    // this effect is used to attach the global event handlers
    if (!defaultOptions.enableShortcuts) {
      return
    }

    const keyDownHandler = (event: KeyboardEvent) => {
      if (
        event.key === "z" &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        !disableCopyPaste
      ) {
        redo()
      } else if (event.key === "y" && (event.ctrlKey || event.metaKey) && !disableCopyPaste) {
        event.preventDefault() // prevent the default action
        redo()
      } else if (event.key === "z" && (event.ctrlKey || event.metaKey) && !disableCopyPaste) {
        undo()
      }
    }

    document.addEventListener("keydown", keyDownHandler)

    return () => {
      document.removeEventListener("keydown", keyDownHandler)
    }
  }, [undo, redo, disableCopyPaste])

  const { reactFlowInstance } = useContext(flowContext)
  const [copiedSelection, setCopiedSelection] = useState<OnSelectionChangeParams | null>(null)

  useEffect(() => {
    if (modalsOpened === 0) {
      setDisableCopyPaste(false)
    } else if (modalsOpened > 0) {
      setDisableCopyPaste(true)
    }
  }, [modalsOpened])

  /**
   * Copy function
   * @param selection last selection to copy
   */
  const copy = (selection: OnSelectionChangeParams) => {
    if (selection && (selection.nodes.length || selection.edges.length)) {
      setCopiedSelection(cloneDeep(selection))
      n.add({
        title: "Copied!",
        message: `
          Copied ${selection.nodes.length} nodes and ${selection.edges.length} edges.
        `,
        type: "success",
      })
    } else {
      n.add({
        title: "Nothing to copy!",
        message: "",
        type: "warning",
      })
    }
  }

  /**
   * Paste function
   * @param selectionInstance last selection of nodes&edges
   * @param position position of pasting nodes&edges
   */
  const paste = (
    selectionInstance: OnSelectionChangeParams,
    position: { x: number; y: number; paneX?: number; paneY?: number }
  ) => {
    if (!reactFlowInstance) {
      return n.add({
        title: "Fatal error!",
        message: "React flow instance not found!",
        type: "error",
      })
    }
    if (!selectionInstance.edges.length && !selectionInstance.nodes.length) {
      return n.add({
        title: "Nothing to paste!",
        message: "",
        type: "warning",
      })
    }
    const _selectionInstance = selectionInstance as OnSelectionChangeParamsCustom
    const nodes = reactFlowInstance.getNodes()
    let edges = reactFlowInstance.getEdges()
    let minimumX = Infinity
    let minimumY = Infinity
    const idsMap: { [id: string]: string } = {}
    const sourceHandlesMap: { [id: string]: string } = {}

    selectionInstance.nodes.forEach((n) => {
      if (n.position.y < minimumY) {
        minimumY = n.position.y
      }
      if (n.position.x < minimumX) {
        minimumX = n.position.x
      }
    })

    const insidePosition =
      position.paneX && position.paneY
        ? { x: position.paneX + position.x, y: position.paneY + position.y }
        : reactFlowInstance.screenToFlowPosition({ x: position.x, y: position.y })

    const resultNodes: AppNode[] = []

    _selectionInstance.nodes.forEach((n: AppNode) => {
      let newConditions
      let newResponse
      if (n.type === "default_node") {
        newConditions = n.data.conditions.map((c) => {
          const newCondId = "condition_" + v4()
          sourceHandlesMap[c.id] = newCondId
          return { ...c, id: newCondId }
        })
        newResponse = n.data.response
          ? {
              ...n.data.response,
              id: "response_" + v4(),
            }
          : undefined
      }

      // Create a new node object
      const newNode = generateNewNode(n.type, {
        position: {
          x: insidePosition.x + n.position.x - minimumX,
          y: insidePosition.y + n.position.y - minimumY,
        },
        data: {
          ...cloneDeep(n.data),
          conditions: newConditions,
          response: newResponse,
          flags: [],
        },
      })
      idsMap[n.id] = newNode.id

      // const newNode: AppNode = {
      //   id: newId,
      //   type: n.type,
      //   position: {
      //     x: insidePosition.x + n.position.x - minimumX,
      //     y: insidePosition.y + n.position.y - minimumY,
      //   },
      //   data: {
      //     ...cloneDeep(n.data),
      //     conditions: newConditions,
      //     response: newResponse,
      //     flags: [],
      //     id: newId,
      //   },
      // }

      resultNodes.push({ ...newNode, selected: true })
    })

    if (resultNodes.length < selectionInstance.nodes.length) {
      return
    }

    const newNodes = [...nodes.map((e: AppNode) => ({ ...e, selected: false })), ...resultNodes]

    selectionInstance.edges.forEach((e) => {
      const source = idsMap[e.source]
      const target = idsMap[e.target]
      if (e.sourceHandle) {
        const sourceHandle = sourceHandlesMap[e.sourceHandle]
        const id = "reactflow__edge-" + v4()
        edges = addEdge(
          {
            source,
            target,
            sourceHandle,
            targetHandle: null,
            id: id,
            selected: false,
          },
          edges.map((e) => ({ ...e, selected: false }))
        )
      }
    })
    takeSnapshot()
    reactFlowInstance.setNodes(newNodes)
    reactFlowInstance.setEdges(edges)
  }

  return (
    <undoRedoContext.Provider
      value={{
        undo,
        redo,
        takeSnapshot,
        copy,
        paste,
        copiedSelection,
        disableCopyPaste,
        setDisableCopyPaste,
      }}>
      {children}
    </undoRedoContext.Provider>
  )
}
