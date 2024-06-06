import { cloneDeep } from "lodash"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Edge, Node, useReactFlow } from "reactflow"
import { flowContext } from "./flowContext"

type undoRedoContextType = {
  undo: () => void
  redo: () => void
  takeSnapshot: () => void
}

type UseUndoRedoOptions = {
  maxHistorySize: number
  enableShortcuts: boolean
}

// type UseUndoRedo = (options?: UseUndoRedoOptions) => {
//   undo: () => void
//   redo: () => void
//   takeSnapshot: () => void
//   canUndo: boolean
//   canRedo: boolean
// }

type HistoryItem = {
  nodes: Node[]
  edges: Edge[]
}

const initialValue = {
  undo: () => {},
  redo: () => {},
  takeSnapshot: () => {},
}

const defaultOptions: UseUndoRedoOptions = {
  maxHistorySize: 100,
  enableShortcuts: true,
}

// eslint-disable-next-line react-refresh/only-export-components
export const undoRedoContext = createContext<undoRedoContextType>(initialValue)

export function UndoRedoProvider({ children }: { children: React.ReactNode }) {
  const { tab, flows } = useContext(flowContext)

  const [past, setPast] = useState<HistoryItem[][]>(flows.map(() => []))
  const [future, setFuture] = useState<HistoryItem[][]>(flows.map(() => []))
  const [tabIndex, setTabIndex] = useState(flows.findIndex((f) => f.name === tab))

  useEffect(() => {
    // whenever the flows variable changes, we need to add one array to the past and future states
    setPast((old) => flows.map((f, i) => (old[i] ? old[i] : [])))
    setFuture((old) => flows.map((f, i) => (old[i] ? old[i] : [])))
    setTabIndex(flows.findIndex((f) => f.name === tab))
  }, [flows, tab])

  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow()

  const takeSnapshot = useCallback(() => {
    // push the current graph to the past state
    // console.log(tabIndex)
    if (tabIndex > -1) {
      console.log(tabIndex)
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
      if (event.key === "z" && (event.ctrlKey || event.metaKey) && event.shiftKey) {
        redo()
      } else if (event.key === "y" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault() // prevent the default action
        redo()
      } else if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
        undo()
      }
    }

    document.addEventListener("keydown", keyDownHandler)

    return () => {
      document.removeEventListener("keydown", keyDownHandler)
    }
  }, [undo, redo])
  return (
    <undoRedoContext.Provider
      value={{
        undo,
        redo,
        takeSnapshot,
      }}>
      {children}
    </undoRedoContext.Provider>
  )
}
