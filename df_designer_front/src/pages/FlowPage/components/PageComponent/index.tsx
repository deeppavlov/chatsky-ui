import _, { min, set } from "lodash";
import { useContext, useRef, useState, useEffect, useCallback } from "react";
import ReactFlow, {
  OnSelectionChangeParams,
  useNodesState,
  useEdgesState,
  useReactFlow,
  EdgeChange,
  Connection,
  addEdge,
  NodeDragHandler,
  SelectionDragHandler,
  OnEdgesDelete,
  Edge,
  updateEdge,
  Background,
  Controls,
  NodeChange,
  BaseEdge,
  EdgeLabelRenderer,
} from "reactflow";
import GenericNode from "../../../../CustomNodes/GenericNode";
import Chat from "../../../../components/chatComponent";
import { alertContext } from "../../../../contexts/alertContext";
import { locationContext } from "../../../../contexts/locationContext";
import { TabsContext } from "../../../../contexts/tabsContext";
import { typesContext } from "../../../../contexts/typesContext";
import { APIClassType, ConditionClassType } from "../../../../types/api";
import { FlowType, NodeType } from "../../../../types/flow";
import { conditionTypes, isValidConnection, nodeTypes } from "../../../../utils";
import ConnectionLineComponent from "../ConnectionLineComponent";
import ExtraSidebar from "../extraSidebarComponent";
import { undoRedoContext } from "../../../../contexts/undoRedoContext";
import { PopUpContext } from "../../../../contexts/popUpContext";
import EditLinkModal from "../../../../modals/editLinkModal";
import ErrorAlert from "../../../../alerts/error";
import { animated, useSpring, useTransition } from '@react-spring/web'
import { Preloader } from "../../../Preloader/Preloader";
import * as ContextMenu from '@radix-ui/react-context-menu';
import { BoxSelect, ClipboardPasteIcon, Combine, Copy } from "lucide-react";
import { LayoutGrid } from 'lucide-react';
import AddPresetModal from "../../../../modals/addPresetModal";
import { darkContext } from "../../../../contexts/darkContext";
import dagre from 'dagre';
import LayoutFlow from "../LayoutComponent";
import { useNavigate } from "react-router-dom";
import { ContextMenuItem } from "../../../../CustomNodes/GenericNode/ContextMenuItem";

const nodeDefTypes = {
  genericNode: GenericNode,
};

export default function Page({ flow }: { flow: FlowType }) {
  let {
    updateFlow,
    disableCopyPaste,
    managerMode,
    flowMode,
    setFlowMode,
    addFlow,
    getNodeId,
    paste,
    lastCopiedSelection,
    setLastCopiedSelection,
    tabsState,
    saveFlow,
    setTabsState,
    tabId,
    flows,
    lastSelection,
    setLastSelection,
    setManagerMode,
    setTabId,
    targetNode,
    setTargetNode
  } = useContext(TabsContext);
  const { types, reactFlowInstance, setReactFlowInstance, templates } =
    useContext(typesContext);
  const reactFlowWrapper = useRef(null);
  const { openPopUp } = useContext(PopUpContext)
  const { grid, setGrid } = useContext(darkContext)
  const navigate = useNavigate()

  // useEffect(() => {
  //   console.log(flow)
  // }, [flow])



  const { takeSnapshot, undo } = useContext(undoRedoContext);
  const { getIntersectingNodes } = useReactFlow();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isCloneVisible, setIsCloneVisible] = useState(false)
  const [isMouseOnNode, setIsMouseOnNode] = useState<boolean>()
  const [redZone, setRedZone] = useState(false)

  // console.log(position)

  // const [lastSelection, setLastSelection] =
  //   useState<OnSelectionChangeParams>(null);

  useEffect(() => {
    if (targetNode) {
      // console.log(1)
      setTimeout(() => {
        // setViewport({x: targetNode.position.x, y: targetNode.position.y, zoom: 1})
        reactFlowInstance.fitBounds({ x: targetNode.position.x, y: targetNode.position.y, width: 384, height: 384 })
      }, 5)
      setTargetNode(null)
    }
    // else {
    //   reactFlowInstance.fitView();
    // }
  }, [targetNode])

  useEffect(() => {
   console.log('init page')
  }, [flow])
  


  const pasteClickHandler = (event: Event) => {
    if (isCloneVisible && !redZone) {
      event.preventDefault();
      setIsCloneVisible(false)
      document.removeEventListener('click', pasteClickHandler)
      let bounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodesPositions = flow.data.nodes.map((node: NodeType) => node.position)
      if (!(lastSelection.nodes.map((node) => node.id).includes("GLOBAL_NODE") || lastSelection.nodes.map((node) => node.id).includes("LOCAL_NODE"))) {
        if (!isMouseOnNode) {
          // if ((nodesPositions[0].x) < (position.x - bounds.left) && (position.x - bounds.left) < (nodesPositions[0].x + 384)) {}
          takeSnapshot()
          paste(lastCopiedSelection, {
            x: position.x - bounds.left,
            y: position.y - bounds.top,
          });
          // console.log(position)
        } else {
          setErrorData({ title: "You can't paste node over node! Nodes can't intersect!" })
        }
      } else setErrorData({ title: "You can't paste Global/Local Node copy!" })
    } else {
      return
    }
  }

  useEffect(() => {
    // this effect is used to attach the global event handlers

    const onKeyDown = (event: KeyboardEvent) => {
      // console.log(event)

      if ((event.key === "Delete" || event.key === "Backspace") && (!disableCopyPaste) && (lastSelection.nodes.map((node) => node.id).includes("GLOBAL_NODE") || lastSelection.nodes.map((node) => node.id).includes("LOCAL_NODE"))) {
        event.preventDefault()
        // console.log(event.key)
        setErrorData({ title: "You can't delete Global/Local Node!" })
        undo() // FIXME: mb fix it?
      }
      // if ((event.key === "Delete" || event.key === "Backspace") && (disableCopyPaste)) {
      //   event.preventDefault()
      //   // console.log(event.key)
      //   // setErrorData({ title: "You can't delete Global/Local Node!" })
      //   undo() // FIXME: mb fix it?
      // }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "c" &&
        lastSelection &&
        !disableCopyPaste
      ) {
        event.preventDefault();
        // console.log(lastSelection)
        if (!(lastSelection.nodes.map((node) => node.id).includes("GLOBAL_NODE") || lastSelection.nodes.map((node) => node.id).includes("LOCAL_NODE"))) {
          setLastCopiedSelection(_.cloneDeep(lastSelection));
          // console.log(lastSelection)
        } else setErrorData({ title: "You can't copy Global/Local Node!" })
        // setLastCopiedSelection(_.cloneDeep(lastSelection));
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "v" &&
        lastCopiedSelection &&
        !disableCopyPaste
      ) {
        setIsCloneVisible(true)
        getNodesSelectionZone(lastCopiedSelection.nodes)
        getRightestNode(lastCopiedSelection.nodes)
        // document.addEventListener('click', pasteClickHandler)
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "g" &&
        lastSelection?.nodes?.length &&
        !disableCopyPaste
      ) {
        event.preventDefault();
        openPopUp(<AddPresetModal lastSelection={lastSelection} />)
        // addFlow(newFlow, false);
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "a" &&
        !disableCopyPaste
      ) {
        event.preventDefault()
        selectAllHandler()
      }

      if (event.key === 'e' && !disableCopyPaste) {
        event.preventDefault()
        setManagerMode(false)
      }
      if (event.metaKey && event.key === 'r') {
        event.preventDefault()
        window.location.reload()
      }
      if (event.key === 'r' && !disableCopyPaste && !event.metaKey) {
        event.preventDefault()
        setManagerMode(true)
      }
      if (event.key === 'w' && (!disableCopyPaste || flowMode)) {
        event.preventDefault()
        setFlowMode(!flowMode)
      }

      // if (
      //   (event.shiftKey) &&
      //   event.key === "a" &&
      //   !disableCopyPaste
      // ) {
      //   event.preventDefault()
      //   openPopUp(<AddPresetModal lastSelection={lastSelection} />)
      // }
    };
    const handleMouseMove = (event) => {
      const reactflowBounds = reactFlowWrapper.current.getBoundingClientRect();
      setPosition({ x: event.clientX, y: event.clientY });
      const p = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
      const currMousePos = {
        x: p.x,
        y: p.y
      }

      // console.log(redZone)
      if (nodes.some((node) => {
        if (((currMousePos.x + selectionZone.width > node.position.x) && (currMousePos.x < node.position.x + node.width)) && ((currMousePos.y + selectionZone.height > node.position.y) && (currMousePos.y < node.position.y + node.height))) {
          return true
        } else {
          return false
        }
      })) {
        setRedZone(true)
      } else {
        setRedZone(false)

      }
    };

    if (isCloneVisible) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === "Delete" || e.key === "Backspace") {
          setIsCloneVisible(false)
          document.removeEventListener('click', pasteClickHandler)
        }
      })
    }

    document.addEventListener('click', pasteClickHandler)
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener('click', pasteClickHandler)
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [position, lastCopiedSelection, lastSelection]);

  const [selectionMenuVisible, setSelectionMenuVisible] = useState(false);

  const { setExtraComponent, setExtraNavigation } = useContext(locationContext);
  const { setErrorData } = useContext(alertContext);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    flow.data?.nodes ?? [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    flow.data?.edges ?? [],
  );
  const { setViewport } = useReactFlow();
  const edgeUpdateSuccessful = useRef(true);
  useEffect(() => {
    if (flow && reactFlowInstance) {
      flow.data = reactFlowInstance.toObject();
      updateFlow(flow);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);
  //update flow when tabs change
  useEffect(() => {
    setNodes(flow?.data?.nodes ?? []);
    setEdges(flow?.data?.edges ?? []);
    if (reactFlowInstance) {
      // console.log(1)
      setViewport(flow?.data?.viewport ?? { x: 1, y: 0, zoom: 0.5 });
      reactFlowInstance.fitView()
    }
  }, [flow, reactFlowInstance, setEdges, setNodes, setViewport]);
  //set extra sidebar
  useEffect(() => {
    setExtraComponent(<ExtraSidebar />);
    setExtraNavigation({ title: "Components" });
  }, [setExtraComponent, setExtraNavigation]);

  const onEdgesChangeMod = useCallback(
    (s: EdgeChange[]) => {
      onEdgesChange(s);
      setNodes((x) => {
        let newX = _.cloneDeep(x);
        return newX;
      });
      setTabsState((prev) => {
        return {
          ...prev,
          [tabId]: {
            isPending: true,
          },
        };
      });
    },
    [onEdgesChange, setNodes, setTabsState, tabId],
  );

  const onNodesChangeMod = useCallback(
    (s: NodeChange[]) => {
      onNodesChange(s);
      setTabsState((prev) => {
        return {
          ...prev,
          [tabId]: {
            isPending: true,
          },
        };
      });
    },
    [onNodesChange, setTabsState, tabId],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            style: { stroke: "inherit" },
            className:
              params.targetHandle.split("|")[0] === "Text"
                ? "stroke-foreground edge-cust mt-2"
                : "stroke-foreground edge-cust mt-2",
            animated: params.targetHandle.split("|")[0] === "Text",
          },
          eds,
        ),
      );
      setNodes((x) => {
        let newX = _.cloneDeep(x);
        return newX;
      });
    },
    [setEdges, setNodes, takeSnapshot],
  );

  // const nodeInitialPosition = useRef<any>()

  const onNodeDragStart: NodeDragHandler = useCallback((event: React.DragEvent, node: NodeType) => {
    // 👇 make dragging a node undoable
    takeSnapshot();
    // 👉 you can place your event handlers here
  }, [takeSnapshot]);

  const onNodeDragOver = (event: any, node: NodeType) => {
    // console.log(event)
    // console.log(node)
  }

  const onNodeDragStop = useCallback((event: React.DragEvent, node: NodeType) => {
    if (getIntersectingNodes(node).length) {
      const intersectingNodes = getIntersectingNodes(node)

      undo() // undo if nodes intersect
      // console.log(node)
      setErrorData({ title: "Nodes can't intersect!" })
    }
  }, [takeSnapshot])

  const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
    // 👇 make dragging a selection undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    // 👇 make deleting edges undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      takeSnapshot();

      // Get the current bounds of the ReactFlow wrapper element


      // Extract the data from the drag event and parse it as a JSON object
      let data: { type: string; node?: APIClassType } = JSON.parse(
        event.dataTransfer.getData("json"),
      );

      // If data type is not "chatInput" or if there are no "chatInputNode" nodes present in the ReactFlow instance, create a new node
      // Calculate the position where the node should be created
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const positionXY = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      // check for intersections before add new node
      if (nodes.some(({ position, id, width, height }) => {
        const xIntersect = ((positionXY.x > position.x - width) && (positionXY.x < (position.x + width)))
        const yIntersect = ((positionXY.y > position.y - height) && (positionXY.y < (position.y + height)))
        const result = xIntersect && yIntersect
        // console.log({id: id, xIntersect: xIntersect, yIntersect: yIntersect, result: result})
        return result
      })) {
        return setErrorData({ title: "Invalid place! Nodes can't intersect!" })
      }
      // FIXME: CHECK WORK

      // Generate a unique node ID
      let { type } = data;
      let newId = getNodeId(type);
      let newNode: NodeType;

      if (tabId === "GLOBAL" && data.node.node_type !== nodeTypes.link) {
        setErrorData({ title: "You can add new links only on GLOBAL flow!" })
        return
      }

      if (data.node.nodes !== undefined) {
        // const resultNodes = []
        // data.node.nodes.forEach((element, idx) => {
        //   // console.log(element)
        //   let newNode: NodeType;
        //   newNode = {
        //     id: getNodeId(element.base_classes[0]),
        //     type: "genericNode",
        //     position: { x: position.x + 400 * idx, y: position.y },
        //     data: {
        //       node: element,
        //       id: getNodeId(element.base_classes[0]),
        //       value: null,
        //       type: element.base_classes[0]
        //     }
        //   }
        //   // setNodes((nds) => nds.concat(newNode))
        //   console.log(newNode)
        //   resultNodes.push(newNode)
        // })
        let bounds = reactFlowWrapper.current.getBoundingClientRect();
        paste({ nodes: data.node.nodes, edges: data.node.edges ?? [] }, { x: event.clientX - bounds.left, y: event.clientY - bounds.top })
        // reactFlowInstance.addNodes(resultNodes)

        // for (let node of resultNodes) {
        //   setNodes((nds) => {
        //     // console.log(nds)
        //     return nds.concat(node)
        //   })
        // }
        // setNodes((nds) => {
        //   return [...nds, ...resultNodes]
        // })
      }
      else if (data.type !== "groupNode") {
        // Create a new node object

        // const local_conditions: ConditionClassType[] = flows.find((flow) => flow.id === tabId)?.data.nodes?.find((node) => node.id === "LOCAL_NODE")?.data?.node?.conditions.map((cond, idx) => {
        //   return {
        //     ...cond,
        //     conditionID: data.node?.conditions?.length + idx,
        //     type: conditionTypes.LOCAL,
        //     name: `local_${cond.name}`
        //   }
        // }) ?? []
        // const global_conditions: ConditionClassType[] = flows.find((flow) => flow.id === "GLOBAL")?.data.nodes?.find((node) => node.id === "GLOBAL_NODE")?.data?.node?.conditions.map((cond, idx) => {
        //   return {
        //     ...cond,
        //     conditionID: data.node?.conditions?.length + local_conditions.length + idx,
        //     type: conditionTypes.GLOBAL,
        //     name: `global_${cond.name}`
        //   }
        // }) ?? []
        // console.log(global_conditions, local_conditions)

        // data.node.conditions = [
        //   ...data.node.conditions,
        //   ...local_conditions,
        //   ...global_conditions
        // ]

        // console.log(data)
        newNode = {
          id: newId,
          type: "genericNode",
          position,
          data: {
            ...data,
            id: newId,
            value: null,
          },
        };
        setNodes((nds) => nds.concat(newNode));
      } else {
        // Create a new node object
        newNode = {
          id: newId,
          type: "groupNode",
          position,
          data: {
            ...data,
            id: newId,
            value: null,
          },
        };

        setNodes((nds) => nds.concat(newNode));
        // Add the new node to the list of nodes in state
      }

      if (data.node.base_classes[0] == 'links') {
        openPopUp(<EditLinkModal data={newNode.data} />)
      }

    },
    // Specify dependencies for useCallback
    [getNodeId, reactFlowInstance, setErrorData, setNodes, takeSnapshot],
  );

  useEffect(() => {
    return () => {
      if (tabsState && tabsState[flow.id]?.isPending) {
        saveFlow(flow);
      }
    };
  }, []);

  const onDelete = useCallback(
    (mynodes) => {
      if (!isCloneVisible && !disableCopyPaste) {
        takeSnapshot();
        setEdges(
          edges.filter(
            (ns) =>
              !mynodes.some((n) => ns.source === n.id || ns.target === n.id),
          ),
        );
      }
    },
    [takeSnapshot, edges, setEdges],
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (isValidConnection(newConnection, reactFlowInstance)) {
        edgeUpdateSuccessful.current = true;
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
      }
    },
    [],
  );

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const [selectionEnded, setSelectionEnded] = useState(false);
  const [preloader, setPreloader] = useState(false)

  // console.log(document.readyState)

  // document.onreadystatechange = function(e: Event) {
  //   const state = document.readyState
  //   console.log(state)
  //   if (state == 'interactive') {
  //     setTimeout(() => {
  //       setPreloader(false)
  //     }, 1000);
  //   }
  // }

  const onSelectionEnd = useCallback(() => {
    setSelectionEnded(true);
  }, []);
  const onSelectionStart = useCallback(() => {
    setSelectionEnded(false);
  }, []);

  // Workaround to show the menu only after the selection has ended.
  useEffect(() => {
    if (selectionEnded && lastSelection && lastSelection.nodes.length > 1) {
      setSelectionMenuVisible(true);
    } else {
      setSelectionMenuVisible(false);
    }
  }, [selectionEnded, lastSelection]);

  const onSelectionChange = useCallback((flow) => {
    setLastSelection(flow);
  }, []);

  const { setDisableCopyPaste } = useContext(TabsContext);

  const transitions = useTransition(location.pathname, {
    config: { duration: 300 },
    delay: 75,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    exitBeforeEnter: true,
  })

  const selectAllHandler = () => {
    const nodes = reactFlowInstance.getNodes()
    nodes.map((node) => node.selected = true)
    // console.log(nodes)
    reactFlowInstance.setNodes(nodes)
  }

  const [selectionZone, setSelectionZone] = useState<{ width: number, height: number }>({ width: 0, height: 0 })

  const getNodesSelectionZone = (nodes: NodeType[]) => {
    const positions = nodes.map((node) => node.position)
    // console.log(first)
    // get min and max values of x and y for calculate width and height of paste zone
    const getMinMax = () => {
      let minX = 999999
      let maxX = -999999
      let minY = 999999
      let maxY = -999999
      positions.forEach((position, i) => {
        if (position.x < minX) {
          minX = position.x
        }
        if (position.x + 384 > maxX) {
          maxX = position.x + 384
        }
      })
      positions.forEach((position, i) => {
        if (position.y < minY) {
          minY = position.y
        }
        if (position.y + reactFlowInstance.getNode(nodes[i].id).height > maxY) {
          maxY = position.y + reactFlowInstance.getNode(nodes[i].id).height
        }
      })
      // console.log({maxX, minX})
      // console.log({maxY, minY})
      return { maxX: maxX, minX: minX, maxY: maxY, minY: minY }
    }
    const width = getMinMax().maxX - getMinMax().minX
    const height = getMinMax().maxY - getMinMax().minY
    // console.log(maxX, minX)
    // console.log(maxY, minY)
    console.log({ width: width, height: height })
    setSelectionZone({ width: width, height: height })
    return { width: width, height: height }
  }

  // console.log(flows)


  const [nodeCopiedClones, setNodeCopiedClones] = useState<NodeType[]>()

  const getRightestNode = (nodes: NodeType[]) => {
    let minX = 999999
    let minY = 999999
    let rightestPosition = { x: minX, y: minY }
    // let rightestNode: NodeType
    nodes.forEach((node) => {
      if (node.position.x < minX) {
        minX = node.position.x
        // rightestNode = {...node}
        // console.log(rightestNode)
      }
      if (node.position.y < minY) {
        minY = node.position.y
      }
    })
    const filteredNodes = [...nodes]
    filteredNodes.map((node) => node.position = { x: node.position.x - minX, y: node.position.y - minY })
    // console.log(filteredNodes[0].position)
    // console.log([rightestNode, ...filteredNodes])
    setNodeCopiedClones([...filteredNodes])
    return [...filteredNodes]
  }

  // useEffect(() => {
  //   // console.log(flow.data.edges)
  //   const fe = flow.data.edges.map((edge) => {
  //     return { source: edge.source, target: edge.target }
  //   })
  //   const fe_1 = fe.map((f) => {

  //   })
  //   console.log(fe)
  // }, [])

  const copy = (e) => {
    setLastCopiedSelection(_.cloneDeep(lastSelection));
  }
  const pasteNode = (e) => {
    //    let bounds = reactFlowWrapper.current.getBoundingClientRect();
    //    const nodesPositions = flow.data.nodes.map((node: NodeType) => node.position)
    //    if (!(lastSelection.nodes.map((node) => node.id).includes("GLOBAL_NODE") || lastSelection.nodes.map((node) => node.id).includes("LOCAL_NODE"))) {
    //      if (!isMouseOnNode) {
    //        if ((nodesPositions[0].x) < (position.x - bounds.left) && (position.x - bounds.left) < (nodesPositions[0].x + 384)) {
    //          // console.log('1')
    //        }
    //        paste(lastCopiedSelection, {
    //          x: position.x - bounds.left,
    //          y: position.y - bounds.top,
    //        });
    //        // console.log('first')
    //      } else {
    //        setErrorData({ title: "You can't paste node over node! Nodes can't intersect!" })
    //      }
    //    } else setErrorData({ title: "You can't paste Global/Local Node copy!" })
    if (lastCopiedSelection) {
      setIsCloneVisible(true);
      getNodesSelectionZone(lastCopiedSelection.nodes);
      getRightestNode(lastCopiedSelection.nodes);
    }
  }
  const createPreset = (e) => {
    if (lastSelection?.nodes?.length > 0)
      openPopUp(<AddPresetModal lastSelection={lastSelection} />);
  }
  
  return (
    <>
      {isCloneVisible && (
        <>
          <div className=" absolute z-50 rounded-xl border border-dashed flex flex-col items-center justify-center font-extrabold text-xl " style={{ backgroundColor: redZone ? "rgba(251, 79, 79, 0.5)" : "rgba(51, 153, 204, 0.2)", borderColor: redZone ? "#FF4747" : "#39C", top: position.y, left: position.x, width: selectionZone.width * reactFlowInstance.getZoom(), height: selectionZone.height * reactFlowInstance.getZoom(), color: 'rgba(255,255,255, 0.9)' }} >
          </div>
          {nodeCopiedClones.map((node, idx) => {
            // console.log(position.x, node.position.x, position.x + node.position.x)
            return (
              <div key={node.id} className=" absolute rounded-xl z-50 border " style={{ backgroundColor: redZone ? "rgba(251, 79, 79, 0.8)" : "rgba(51, 153, 204, 0.275)", borderColor: redZone ? "#FF4747" : "#39C", top: (node.position.y * reactFlowInstance.getZoom()) + position.y, left: (node.position.x * reactFlowInstance.getZoom()) + position.x, width: reactFlowInstance.getNode(node.id).width * reactFlowInstance.getZoom(), height: reactFlowInstance.getNode(node.id).height * reactFlowInstance.getZoom() }} >

              </div>
            )
          })}
        </>
      )}
      <div className="flex h-full overflow-hidden">
        {/* {preloader && <Preloader />} */}
        {preloader ? <Preloader /> : (
          <>
            <ExtraSidebar />
            {/* Main area */}
            <main className="flex flex-1 relative ">
              {/* Primary column */}
              {transitions((style, item) => (
                <animated.div style={style} className="h-full w-full ">
                  <ContextMenu.Root>
                    <ContextMenu.Trigger>
                      <div id="reactFlowWrapper" className="h-full w-full" ref={reactFlowWrapper}>
                        {Object.keys(templates).length > 0 &&
                          Object.keys(types).length > 0 ? (
                          <div className="h-full w-full">
                            <ReactFlow
                              nodes={nodes}
                              onMove={() => {
                                // console.log('move')
                                // FIXME: was active flow duplicate bugfix test
                                updateFlow({
                                  ...flow,
                                  data: reactFlowInstance.toObject(),
                                });
                              }}
                              edges={edges}
                              onPaneClick={() => {
                                setDisableCopyPaste(false);
                                // FIXME: was active
                              }}
                              onPaneMouseLeave={() => {
                                setDisableCopyPaste(true);
                                // FIXME: was active
                              }}
                              onPaneMouseEnter={() => {
                                setDisableCopyPaste(false);
                                // FIXME: was active
                              }}
                              onNodesChange={onNodesChangeMod}
                              onEdgesChange={onEdgesChangeMod}
                              onConnect={managerMode ? () => { } : onConnect}
                              disableKeyboardA11y={false}
                              onLoad={setReactFlowInstance}
                              onInit={setReactFlowInstance}
                              nodeTypes={nodeDefTypes}
                              onEdgeUpdate={managerMode ? () => { } : onEdgeUpdate}
                              onEdgeUpdateStart={managerMode ? () => { } : onEdgeUpdateStart}
                              onEdgeUpdateEnd={onEdgeUpdateEnd}
                              onNodeDragStart={onNodeDragStart}
                              onNodeMouseEnter={e => setIsMouseOnNode(true)}
                              onNodeMouseLeave={e => setIsMouseOnNode(false)}
                              onNodeDragStop={onNodeDragStop}
                              onSelectionDragStart={onSelectionDragStart}
                              onSelectionEnd={onSelectionEnd}
                              onSelectionStart={onSelectionStart}
                              onEdgesDelete={onEdgesDelete}
                              connectionLineComponent={ConnectionLineComponent}
                              onDragOver={onDragOver}
                              onDrop={onDrop}
                              onNodesDelete={onDelete}
                              onSelectionChange={onSelectionChange}
                              snapGrid={[96, 96]}
                              snapToGrid={grid}
                              nodesDraggable={!managerMode}
                              panOnDrag={true} // FIXME: TEST {!disableCopyPaste} was
                              zoomOnDoubleClick={!managerMode}
                              selectNodesOnDrag={false}
                              multiSelectionKeyCode={['Meta', 'Shift']}
                              className="theme-attribution"
                              minZoom={0.01}
                              maxZoom={8}
                            >
                              <Background size={grid ? 3 : 1} gap={grid ? 96 : 25} className="" />
                              <Controls
                                className="bg-muted fill-foreground stroke-foreground text-primary [&>button]:border-b-border hover:[&>button]:bg-border"
                              ></Controls>
                              {flowMode && <LayoutFlow />}
                            </ReactFlow>
                            <Chat flow={flow} reactFlowInstance={reactFlowInstance} />
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </ContextMenu.Trigger>
                    <ContextMenu.Portal container={document.getElementById('modal_root')}>
                      <ContextMenu.Content className="context-wrapper">
                        <ContextMenuItem
                          type="copy"
                          onClick={copy}
                          hide={!lastSelection?.nodes?.length && !lastSelection?.edges?.length}
                        />
                        <ContextMenuItem
                          type="paste"
                          onClick={pasteNode}
                          hide={!lastCopiedSelection?.nodes?.length}
                        />
                        <ContextMenuItem type="toggleGrid" onClick={(e) => setGrid(!grid)} />
                        <ContextMenuItem
                          type="createPreset"
                          disabled={lastSelection?.nodes?.length <= 0}
                          onClick={createPreset}
                        />
                        <ContextMenuItem
                          type="selectAll"
                          onClick={selectAllHandler}
                        />
                      </ContextMenu.Content>
                    </ContextMenu.Portal>
                  </ContextMenu.Root>
                </animated.div>
              ))}
            </main>
          </>
        )}
      </div>
    </>
  );
}
