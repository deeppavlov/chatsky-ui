import { cloneDeep } from "lodash"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { addEdge, Edge, Node, OnSelectionChangeParams, useReactFlow } from "reactflow"
import { v4 } from "uuid"
import { NodeDataType } from "../types/NodeTypes"
import { flowContext } from "./flowContext"
import { notificationsContext } from "./notificationsContext"

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
  copy: () => {},
  paste: () => {},
  copiedSelection: null,
}

const defaultOptions: UseUndoRedoOptions = {
  maxHistorySize: 100,
  enableShortcuts: true,
}

// eslint-disable-next-line react-refresh/only-export-components
export const undoRedoContext = createContext<undoRedoContextType>(initialValue)

export function UndoRedoProvider({ children }: { children: React.ReactNode }) {
  const { tab, flows } = useContext(flowContext)
  const { notification: n } = useContext(notificationsContext)

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

  const { reactFlowInstance } = useContext(flowContext)
  const [copiedSelection, setCopiedSelection] = useState<OnSelectionChangeParams | null>(null)

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const nodes: Node<NodeDataType>[] = reactFlowInstance.getNodes()
    let edges: Edge[] = reactFlowInstance.getEdges()
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
        : reactFlowInstance.project({ x: position.x, y: position.y })

    const resultNodes: Node<NodeDataType>[] = []

    selectionInstance.nodes.forEach((n: Node<NodeDataType>) => {
      // Generate a unique node ID
      const newId = v4()
      idsMap[n.id] = newId
      const newConditions = n.data.conditions?.map((c) => {
        const newCondId = v4()
        sourceHandlesMap[c.id] = newCondId
        return { ...c, id: newCondId }
      })
      const newResponse = n.data.response
        ? {
            ...n.data.response,
            id: v4(),
          }
        : undefined

      // Create a new node object
      const newNode: Node<NodeDataType> = {
        id: newId,
        type: n.type,
        position: {
          x: insidePosition.x + n.position.x - minimumX,
          y: insidePosition.y + n.position.y - minimumY,
        },
        data: {
          ...cloneDeep(n.data),
          conditions: newConditions,
          response: newResponse,
          flags: [],
          id: newId,
        },
      }

      resultNodes.push({ ...newNode, selected: true })
    })

    if (resultNodes.length < selectionInstance.nodes.length) {
      return
    }

    const newNodes = [
      ...nodes.map((e: Node<NodeDataType>) => ({ ...e, selected: false })),
      ...resultNodes,
    ]

    console.log(selectionInstance.edges)

    selectionInstance.edges.forEach((e) => {
      const source = idsMap[e.source]
      const target = idsMap[e.target]
      if (e.sourceHandle) {
        const sourceHandle = sourceHandlesMap[e.sourceHandle]
        const id = v4()
        edges = addEdge(
          {
            source,
            target,
            sourceHandle,
            targetHandle: null,
            id,
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

  // function paste(
  //   selectionInstance,
  //   position: { x: number; y: number; paneX?: number; paneY?: number }
  // ) {
  //   let minimumX = Infinity;
  //   let minimumY = Infinity;
  //   let idsMap = {};
  //   let nodes = reactFlowInstance.getNodes();
  //   let edges = reactFlowInstance.getEdges();
  //   selectionInstance.nodes.forEach((n) => {
  //     if (n.position.y < minimumY) {
  //       minimumY = n.position.y;
  //     }
  //     if (n.position.x < minimumX) {
  //       minimumX = n.position.x;
  //     }
  //   });

  //   const insidePosition = position.paneX
  //     ? { x: position.paneX + position.x, y: position.paneY + position.y }
  //     : reactFlowInstance.project({ x: position.x, y: position.y });

  //   const resultNodes: any[] = []

  //   selectionInstance.nodes.forEach((n: NodeType) => {
  //     // Generate a unique node ID
  //     let newId = getNodeId(n.data.type);
  //     idsMap[n.id] = newId;

  //     const positionX = insidePosition.x + n.position.x - minimumX
  //     const positionY = insidePosition.y + n.position.y - minimumY

  //     // Create a new node object
  //     const newNode: NodeType = {
  //       id: newId,
  //       type: "genericNode",
  //       position: {
  //         x: insidePosition.x + n.position.x - minimumX,
  //         y: insidePosition.y + n.position.y - minimumY,
  //       },
  //       data: {
  //         ..._.cloneDeep(n.data),
  //         id: newId,
  //       },
  //     };

  //     // FIXME: CHECK WORK >>>>>>>
  //     // check for intersections before paste
  //     if (nodes.some(({ position, id, width, height }) => {
  //       const xIntersect = ((positionX > position.x - width) && (positionX < (position.x + width)))
  //       const yIntersect = ((positionY > position.y - height) && (positionY < (position.y + height)))
  //       const result = xIntersect && yIntersect
  //       // console.log({id: id, xIntersect: xIntersect, yIntersect: yIntersect, result: result})
  //       return result
  //     })) {
  //       return setErrorData({ title: "Invalid place! Nodes can't intersect!" })
  //     }
  //     // FIXME: CHECK WORK >>>>>>>>

  //     resultNodes.push({ ...newNode, selected: true })

  //   });

  //   if (resultNodes.length < selectionInstance.nodes.length) {
  //     return
  //   }

  //   // Add the new node to the list of nodes in state
  //   nodes = nodes
  //     .map((e) => ({ ...e, selected: false }))
  //     .concat(resultNodes);
  //   reactFlowInstance.setNodes(nodes);

  //   selectionInstance.edges.forEach((e) => {
  //     let source = idsMap[e.source];
  //     let target = idsMap[e.target];
  //     let sourceHandleSplitted = e.sourceHandle.split("|");
  //     let sourceHandle =
  //       source +
  //       "|" +
  //       sourceHandleSplitted[1] +
  //       "|" +
  //       source
  //     let targetHandleSplitted = e.targetHandle.split("|");
  //     let targetHandle =
  //       targetHandleSplitted.slice(0, -1).join("|") + target;
  //     let id =
  //       "reactflow__edge-" +
  //       source +
  //       sourceHandle +
  //       "-" +
  //       target +
  //       targetHandle;
  //     edges = addEdge(
  //       {
  //         source,
  //         target,
  //         sourceHandle,
  //         targetHandle,
  //         id,
  //         style: { stroke: "inherit" },
  //         className:
  //           targetHandle.split("|")[0] === "Text"
  //             ? "stroke-foreground "
  //             : "stroke-foreground ",
  //         animated: targetHandle.split("|")[0] === "Text",
  //         selected: false,
  //       },
  //       edges.map((e) => ({ ...e, selected: false }))
  //     );
  //   });
  //   reactFlowInstance.setEdges(edges);
  // }

  return (
    <undoRedoContext.Provider
      value={{
        undo,
        redo,
        takeSnapshot,
        copy,
        paste,
        copiedSelection,
      }}>
      {children}
    </undoRedoContext.Provider>
  )
}
