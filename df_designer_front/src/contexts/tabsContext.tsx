import {
  createContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useContext,
  useId,
} from "react";
import { FlowType, NodeType } from "../types/flow";
import { TabsContextType, TabsState } from "../types/tabs";
import {
  updateIds,
  updateTemplate,
  getRandomDescription,
  getRandomName,
  flow_colors,
  findUnPickedColor,
} from "../utils";
import { alertContext } from "./alertContext";
import { typesContext } from "./typesContext";
import { APIClassType, APITemplateType } from "../types/api";
import ShortUniqueId from "short-unique-id";
import { OnSelectionChangeParams, addEdge, useNodesState } from "reactflow";
import {
  readFlowsFromDatabase,
  deleteFlowFromDatabase,
  saveFlowToDatabase,
  downloadFlowsFromDatabase,
  uploadFlowsToDatabase,
  updateFlowInDatabase,
  getFlowsFromDatabase,
  saveAllFlowsToDatabase,
} from "../controllers/API";
import _, { uniqueId } from "lodash";

const uid = new ShortUniqueId({ length: 5 });

const TabsContextInitialValue: TabsContextType = {
  save: () => { },
  tabId: "",
  setTabId: (index: string) => { },
  flows: [],
  removeFlow: (id: string) => { },
  addFlow: async (flowData?: any) => "",
  updateFlow: (newFlow: FlowType) => { },
  incrementNodeId: () => uid(),
  downloadFlow: (flow: FlowType) => { },
  downloadFlows: () => { },
  uploadFlows: () => { },
  uploadFlow: () => { },
  hardReset: () => { },
  saveFlow: async (flow: FlowType) => { },
  disableCopyPaste: false,
  setDisableCopyPaste: (state: boolean) => { },
  managerMode: false,
  setManagerMode: (state: boolean) => { },
  flowMode: false,
  setFlowMode: (state: boolean) => { },
  lastCopiedSelection: null,
  setLastCopiedSelection: (selection: any) => { },
  lastSelection: null,
  setLastSelection: (selection: any) => { },
  tabsState: {},
  setTabsState: (state: TabsState) => { },
  getNodeId: (nodeType: string) => "",
  setTweak: (tweak: any) => { },
  getTweak: {},
  paste: (
    selection: { nodes: any; edges: any },
    position: { x: number; y: number; paneX?: number; paneY?: number }
  ) => { },

};

export const TabsContext = createContext<TabsContextType>(
  TabsContextInitialValue
);

export function TabsProvider({ children }: { children: ReactNode }) {
  const { setErrorData, setNoticeData } = useContext(alertContext);

  const [tabId, setTabId] = useState("");

  const [flows, setFlows] = useState<Array<FlowType>>([]);
  const [id, setId] = useState(uid());
  const { templates, reactFlowInstance } = useContext(typesContext);
  const [lastCopiedSelection, setLastCopiedSelection] = useState(null);
  const [lastSelection, setLastSelection] = useState<OnSelectionChangeParams>(null)
  const [tabsState, setTabsState] = useState<TabsState>({});
  const [getTweak, setTweak] = useState({});

  const newNodeId = useRef(uid());
  function incrementNodeId() {
    newNodeId.current = uid();
    return newNodeId.current;
  }

  function save() {
    // added clone deep to avoid mutating the original object
    let Saveflows = _.cloneDeep(flows);
    if (Saveflows.length !== 0) {
      Saveflows.forEach((flow) => {
        if (flow.data && flow.data?.nodes)
          flow.data?.nodes.forEach((node) => {
            // console.log(node.data.type);
            //looking for file fields to prevent saving the content and breaking the flow for exceeding the the data limit for local storage
            Object.keys(node.data.node.template).forEach((key) => {
              console.log(node.data.node.template[key].type);
              if (node.data.node.template[key].type === "file") {
                // console.log(node.data.node.template[key]);
                node.data.node.template[key].content = null;
                node.data.node.template[key].value = "";
              }
            });
          });
      });
      window.localStorage.setItem(
        "tabsData",
        JSON.stringify({ tabId, flows: Saveflows, id })
      );
    }
  }

  // function loadCookie(cookie: string) {
  //   if (cookie && Object.keys(templates).length > 0) {
  //     let cookieObject: LangflowState = JSON.parse(cookie);
  //     try {
  //       cookieObject.flows.forEach((flow) => {
  //         if (!flow.data) {
  //           return;
  //         }
  //         flow.data.edges.forEach((edge) => {
  //           edge.className = "";
  //           edge.style = { stroke: "#555555" };
  //         });

  //         flow.data.nodes.forEach((node) => {
  //           const template = templates[node.data.type];
  //           if (!template) {
  //             setErrorData({ title: `Unknown node type: ${node.data.type}` });
  //             return;
  //           }
  //           if (Object.keys(template["template"]).length > 0) {
  //             node.data.node.base_classes = template["base_classes"];
  //             flow.data.edges.forEach((edge) => {
  //               if (edge.source === node.id) {
  //                 edge.sourceHandle = edge.sourceHandle
  //                   .split("|")
  //                   .slice(0, 2)
  //                   .concat(template["base_classes"])
  //                   .join("|");
  //               }
  //             });
  //             node.data.node.description = template["description"];
  //             node.data.node.template = updateTemplate(
  //               template["template"] as unknown as APITemplateType,
  //               node.data.node.template as APITemplateType
  //             );
  //           }
  //         });
  //       });
  //       setTabIndex(cookieObject.tabIndex);
  //       setFlows(cookieObject.flows);
  //       setId(cookieObject.id);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }
  // }



  useEffect(() => {

    async function refreshFlows() {
      // console.log(await getTabsDataFromDB());
      const response = await getTabsDataFromDB()
      // console.log(response)
      if (response && Object.keys(templates).length > 0) {
        try {
          updateStateWithDbData(response);
          processDBData(response);
        } catch (e) {
          console.error(e);
        }
      }

      // getTabsDataFromDB().then((data) => {

      //
      // });
    }

    // get data from db
    //get tabs locally saved
    // let tabsData = getLocalStorageTabsData();
    refreshFlows();
  }, [templates]);

  function getTabsDataFromDB() {
    //get tabs from db
    return getFlowsFromDatabase();
  }
  function processDBData(DbData) {
    console.log(DbData)
      DbData.forEach((flow) => {
        try {
          if (!flow.data) {
            return;
          }
          processFlowEdges(flow);
          processFlowNodes(flow);
        } catch (e) {
          console.error(e);
        }
      });
  }

  function processFlowEdges(flow) {
    if (!flow.data || !flow.data.edges) return;
    flow.data.edges.forEach((edge) => {
      edge.className = "";
      edge.style = { stroke: "#555555" };
    });
  }

  function updateDisplay_name(node: NodeType, template: APIClassType) {
    // node.data.node.display_name = template["display_name"] || node.data.type;
  }

  function updateNodeDocumentation(node: NodeType, template: APIClassType) {
    node.data.node.documentation = template["documentation"];
  }

  function processFlowNodes(flow) {
    if (!flow.data || !flow.data.nodes) return;
    flow.data.nodes.forEach((node: NodeType) => {
      const template = templates[node.data.type];
      if (!template) {
        setErrorData({ title: `Unknown node type: ${node.data.type}` });
        return;
      }
      if (Object.keys(template["template"]).length > 0) {
        updateDisplay_name(node, template);
        updateNodeBaseClasses(node, template);
        updateNodeEdges(flow, node, template);
        updateNodeDescription(node, template);
        updateNodeTemplate(node, template);
        updateNodeDocumentation(node, template);
      }
    });
  }

  function updateNodeBaseClasses(node: NodeType, template: APIClassType) {
    node.data.node.base_classes = template["base_classes"];
  }

  function updateNodeEdges(
    flow: FlowType,
    node: NodeType,
    template: APIClassType
  ) {
    flow.data.edges.forEach((edge) => {
      if (edge.source === node.id) {
        edge.sourceHandle = edge.sourceHandle
        // FIXME: TAKE CARE WITH THIS
        // .split("|")
        // .slice(0, 2)
        // .concat(template["base_classes"])
        // .join("|");
      }
    });
  }

  function updateNodeDescription(node: NodeType, template: APIClassType) {
    node.data.node.description = template["description"];
  }

  function updateNodeTemplate(node: NodeType, template: APIClassType) {
    node.data.node.template = updateTemplate(
      template["template"] as unknown as APITemplateType,
      node.data.node.template as APITemplateType
    );
  }

  function updateStateWithDbData(tabsData: FlowType[] | any) {
    // TODO: DELETE IT WHEN FLOW COLOR WILL ADDED IN DATABASE
    const newTabsData = tabsData
    // .map((flow, idx) => {
    //   return {
    //     ...flow,
    //     color: findUnPickedColor(flows)[idx]
    //   }
    // })
    // console.log(newTabsData)
    const isGlobal = JSON.stringify(tabsData) !== "{}" ? tabsData.some((flow) => flow.id === 'GLOBAL') : false
    if (!isGlobal && JSON.stringify(tabsData) !== "{}") {
      setFlows([{
        name: "GLOBAL",
        id: "GLOBAL",
        description: "Global flow",
        color: "#8338EC",
        data: {
          nodes: [
            {
              dragging: false,
              width: 384,
              height: 229,
              id: "GLOBAL_NODE",
              position: { x: 0, y: 0 },
              type: "genericNode",
              data: {
                id: "GLOBAL_NODE",
                type: "default_node",
                value: null,
                node: {
                  base_classes: ["default_node"],
                  description: "GLOBAL_NODE",
                  display_name: "GLOBAL_NODE",
                  documentation: "GLOBAL_NODE",
                  pre_responses: [],
                  pre_transitions: [],
                  conditions: [
                    // {
                    //   conditionID: 0,
                    //   left: false,
                    //   name: 'dft_cnd0',
                    //   priority: 1,
                    //   required: true,
                    //   type: `condition`,
                    //   transitionType: 'default',
                    //   intent: '',
                    //   action: '',
                    //   variables: '',
                    //   APIKey: '',
                    //   llm_model: '',
                    //   prompt: '',
                    // },
                  ],
                  template: {
                    response: {
                      placeholder: "response",
                      name: "response",
                      list: false,
                      required: true,
                      show: true,
                      type: "str",
                      multiline: false,
                      value: "",
                      display_name: "Some response",
                      APIKey: '',
                      llm_model: '',
                      prompt: '',
                      quote: '',
                    },
                  }
                }
              },
            }
          ]
        }
      }, ...tabsData]);
    } else if (!isGlobal && JSON.stringify(tabsData) === "{}") {
      setFlows([{
        name: "GLOBAL",
        id: "GLOBAL",
        description: "Global flow",
        color: "#8338EC",
        data: {
          nodes: [
            {
              dragging: false,
              width: 384,
              height: 229,
              id: "GLOBAL_NODE",
              position: { x: 0, y: 0 },
              type: "genericNode",
              data: {
                id: "GLOBAL_NODE",
                type: "default_node",
                value: null,
                node: {
                  base_classes: ["default_node"],
                  description: "GLOBAL_NODE",
                  display_name: "GLOBAL_NODE",
                  documentation: "GLOBAL_NODE",
                  pre_responses: [],
                  pre_transitions: [],
                  conditions: [
                    // {
                    //   conditionID: 0,
                    //   left: false,
                    //   name: 'dft_cnd0',
                    //   priority: 1,
                    //   required: true,
                    //   type: `condition`,
                    //   transitionType: 'default',
                    //   intent: '',
                    //   action: '',
                    //   variables: '',
                    //   APIKey: '',
                    //   llm_model: '',
                    //   prompt: '',
                    // },
                  ],
                  template: {
                    response: {
                      placeholder: "response",
                      name: "response",
                      list: false,
                      required: true,
                      show: true,
                      type: "str",
                      multiline: false,
                      value: "",
                      display_name: "Some response",
                      APIKey: '',
                      llm_model: '',
                      prompt: '',
                      quote: '',
                    },
                  }
                }
              },
            }
          ]
        }
      }]);
    } else {
      setFlows(tabsData);
    }
  }

  function hardReset() {
    newNodeId.current = uid();
    setTabId("");

    setFlows([]);
    setId(uid());
  }

  /**
   * Downloads the current flow as a JSON file
   */
  function downloadFlow(
    flow: FlowType,
    flowName: string,
    flowDescription?: string
  ) {
    // create a data URI with the current flow data
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify({ ...flow, name: flowName, description: flowDescription })
    )}`;

    // create a link element and set its properties
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${flowName && flowName != ""
      ? flowName
      : flows.find((f) => f.id === tabId).name
      }.json`;

    // simulate a click on the link element to trigger the download
    link.click();
    setNoticeData({
      title: "Warning: Critical data, JSON file may include API keys.",
    });
  }

  function downloadFlows() {
    downloadFlowsFromDatabase().then((flows) => {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(flows)
      )}`;

      // create a link element and set its properties
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `flows.json`;

      // simulate a click on the link element to trigger the download
      link.click();
    });
  }

  function getNodeId(nodeType: string) {
    // WAS: nodeType + "-" + incrementNodeId()
    return incrementNodeId();
  }

  /**
   * Creates a file input and listens to a change event to upload a JSON flow file.
   * If the file type is application/json, the file is read and parsed into a JSON object.
   * The resulting JSON object is passed to the addFlow function.
   */
  function uploadFlow(newProject?: boolean) {
    // create a file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    // add a change event listener to the file input
    input.onchange = (e: Event) => {
      // check if the file type is application/json
      if ((e.target as HTMLInputElement).files[0].type === "application/json") {
        // get the file from the file input
        const file = (e.target as HTMLInputElement).files[0];
        // read the file as text
        file.text().then((text) => {
          // parse the text into a JSON object
          let flow: FlowType = JSON.parse(text);

          addFlow(flow, newProject);
        });
      }
    };
    // trigger the file input click event to open the file dialog
    input.click();
  }

  function uploadFlows() {
    // create a file input
    const input = document.createElement("input");
    input.type = "file";
    // add a change event listener to the file input
    input.onchange = (e: Event) => {
      // check if the file type is application/json
      if ((e.target as HTMLInputElement).files[0].type === "application/json") {
        // get the file from the file input
        const file = (e.target as HTMLInputElement).files[0];
        // read the file as text
        const formData = new FormData();
        formData.append("file", file);
        uploadFlowsToDatabase(formData).then(() => {
          refreshFlows();
        });
      }
    };
    // trigger the file input click event to open the file dialog
    input.click();
  }
  /**
   * Removes a flow from an array of flows based on its id.
   * Updates the state of flows and tabIndex using setFlows and setTabIndex hooks.
   * @param {string} id - The id of the flow to remove.
   */
  function removeFlow(id: string) {
    const index = flows.findIndex((flow) => flow.id === id);
    if (index >= 0) {
      // deleteFlowFromDatabase(id).then(() => {
      //   setFlows(flows.filter((flow) => flow.id !== id));
      // });
        setFlows(flows.filter((flow) => flow.id !== id));
        saveAllFlowsToDatabase(flows.filter((flow) => flow.id !== id))
    }
  }
  /**
   * Add a new flow to the list of flows.
   * @param flow Optional flow to add.
   */

  function paste(
    selectionInstance,
    position: { x: number; y: number; paneX?: number; paneY?: number }
  ) {
    let minimumX = Infinity;
    let minimumY = Infinity;
    let idsMap = {};
    let nodes = reactFlowInstance.getNodes();
    let edges = reactFlowInstance.getEdges();
    selectionInstance.nodes.forEach((n) => {
      if (n.position.y < minimumY) {
        minimumY = n.position.y;
      }
      if (n.position.x < minimumX) {
        minimumX = n.position.x;
      }
    });

    const insidePosition = position.paneX
      ? { x: position.paneX + position.x, y: position.paneY + position.y }
      : reactFlowInstance.project({ x: position.x, y: position.y });

    const resultNodes: any[] = []

    selectionInstance.nodes.forEach((n: NodeType) => {
      // Generate a unique node ID
      let newId = getNodeId(n.data.type);
      idsMap[n.id] = newId;

      const positionX = insidePosition.x + n.position.x - minimumX
      const positionY = insidePosition.y + n.position.y - minimumY

      // Create a new node object
      const newNode: NodeType = {
        id: newId,
        type: "genericNode",
        position: {
          x: insidePosition.x + n.position.x - minimumX,
          y: insidePosition.y + n.position.y - minimumY,
        },
        data: {
          ..._.cloneDeep(n.data),
          id: newId,
        },
      };


      // FIXME: CHECK WORK >>>>>>>
      // check for intersections before paste
      if (nodes.some(({ position, id, width, height }) => {
        const xIntersect = ((positionX > position.x - width) && (positionX < (position.x + width)))
        const yIntersect = ((positionY > position.y - height) && (positionY < (position.y + height)))
        const result = xIntersect && yIntersect
        // console.log({id: id, xIntersect: xIntersect, yIntersect: yIntersect, result: result})
        return result
      })) {
        return setErrorData({ title: "Invalid place! Nodes can't intersect!" })
      }
      // FIXME: CHECK WORK >>>>>>>>

      resultNodes.push({ ...newNode, selected: true })

    });

    if (resultNodes.length < selectionInstance.nodes.length) {
      return
    }

    // Add the new node to the list of nodes in state
    nodes = nodes
      .map((e) => ({ ...e, selected: false }))
      .concat(resultNodes);
    reactFlowInstance.setNodes(nodes);

    selectionInstance.edges.forEach((e) => {
      let source = idsMap[e.source];
      let target = idsMap[e.target];
      let sourceHandleSplitted = e.sourceHandle.split("|");
      let sourceHandle =
        source +
        "|" +
        sourceHandleSplitted[1] +
        "|" +
        source
      let targetHandleSplitted = e.targetHandle.split("|");
      let targetHandle =
        targetHandleSplitted.slice(0, -1).join("|") + target;
      let id =
        "reactflow__edge-" +
        source +
        sourceHandle +
        "-" +
        target +
        targetHandle;
      edges = addEdge(
        {
          source,
          target,
          sourceHandle,
          targetHandle,
          id,
          style: { stroke: "inherit" },
          className:
            targetHandle.split("|")[0] === "Text"
              ? "stroke-foreground "
              : "stroke-foreground ",
          animated: targetHandle.split("|")[0] === "Text",
          selected: false,
        },
        edges.map((e) => ({ ...e, selected: false }))
      );
    });
    reactFlowInstance.setEdges(edges);
  }

  const addFlow = async (
    flow?: FlowType,
    newProject?: Boolean,
    newFlowData?: any
  ): Promise<String> => {
    if (newProject) {
      let flowData = extractDataFromFlow(flow);
      if (flowData.description == "") {
        flowData.description = getRandomDescription();
      }

      // Create a new flow with a default name if no flow is provided.
      const newFlow = createNewFlow(flowData, flow, newFlowData);
      processFlowEdges(newFlow);
      processFlowNodes(newFlow);

      try {
        const newId = crypto.randomUUID()
        console.log(newId)
        // const { id } = await saveFlowToDatabase(newFlow);
        // Change the id to the new id.
        newFlow.id = newId;

        // Add the new flow to the list of flows.

        // add local node
        const newNode = {
          dragging: false,
          width: 384,
          height: 229,
          id: "LOCAL_NODE",
          position: { x: 0, y: 0 },
          type: "genericNode",
          data: {
            id: "LOCAL_NODE",
            type: "default_node",
            value: null,
            node: {
              base_classes: ["default_node"],
              description: "LOCAL_NODE",
              display_name: "LOCAL_NODE",
              documentation: "LOCAL_NODE",
              pre_responses: [],
              pre_transitions: [],
              conditions: [
                // {
                //   conditionID: 0,
                //   left: false,
                //   name: 'dft_cnd0',
                //   priority: 1,
                //   required: true,
                //   type: `condition`,
                //   transitionType: 'default',
                //   intent: '',
                //   action: '',
                //   variables: '',
                //   APIKey: '',
                //   llm_model: '',
                //   prompt: '',
                // },
              ],
              template: {
                response: {
                  placeholder: "response",
                  name: "response",
                  list: false,
                  required: true,
                  show: true,
                  type: "str",
                  multiline: false,
                  value: "",
                  display_name: "Some response",
                  APIKey: '',
                  llm_model: '',
                  prompt: '',
                  quote: '',
                },
              }
            }
          },
        }
        newFlow.data.nodes = [newNode]
        saveFlow(newFlow)
        await saveAllFlowsToDatabase(addFlowToLocalState(newFlow))
        // Return the id
        return id;

      } catch (error) {
        // Handle the error if needed
        console.error("Error while adding flow:", error);
        throw error; // Re-throw the error so the caller can handle it if needed
      }
    } else {
      paste(
        { nodes: flow.data.nodes, edges: flow.data.edges },
        { x: 10, y: 10 }
      );
    }
  };

  const extractDataFromFlow = (flow) => {
    console.log(flow?.data)
    let data = flow?.data ? flow.data : null;
    const description = flow?.description ? flow.description : "";

    if (data) {
      updateEdges(data.edges);
      updateNodes(data.nodes, data.edges);
      updateIds(data, getNodeId); // Assuming updateIds is defined elsewhere
    }

    return { data, description };
  };

  const updateEdges = (edges) => {
    edges.forEach((edge) => {
      edge.style = { stroke: "inherit" };
      edge.className =
        edge.targetHandle.split("|")[0] === "Text"
          ? "stroke-gray-800 "
          : "stroke-gray-900 ";
      edge.animated = edge.targetHandle.split("|")[0] === "Text";
    });
  };

  const updateNodes = (nodes, edges) => {
    nodes.forEach((node) => {
      const template = templates[node.data.type];
      if (!template) {
        setErrorData({ title: `Unknown node type: ${node.data.type}` });
        return;
      }
      if (Object.keys(template["template"]).length > 0) {
        node.data.node.base_classes = template["base_classes"];
        edges.forEach((edge) => {
          if (edge.source === node.id) {
            edge.sourceHandle = edge.sourceHandle
              .split("|")
              .slice(0, 2)
              .concat(template["base_classes"])
              .join("|");
          }
        });
        node.data.node.description = template["description"];
        node.data.node.template = updateTemplate(
          template["template"] as unknown as APITemplateType,
          node.data.node.template as APITemplateType
        );
      }
    });
  };


  const createNewFlow = (flowData, flow, newFlow) => ({
    description: newFlow?.description ? newFlow.description : flowData.description,
    name: newFlow?.name ? newFlow.name : flows.find(({ name }) => name === `Flow ${flows.length}`) ? `Flow ${flows.length + 1}` : `Flow ${flows.length}`,
    data: flowData.data ?? {
      nodes: [],
      edges: [],
    },
    color: newFlow?.color ? newFlow.color : findUnPickedColor(flows)[0],
    id: "",
  });

  const addFlowToLocalState = (newFlow) => {
    let flows = []
    setFlows((prevState) => {
      flows = [...prevState, newFlow]
      return [...prevState, newFlow];
    });
    return flows
  };

  /**
   * Updates an existing flow with new data
   * @param newFlow - The new flow object containing the updated data
   */
  function updateFlow(newFlow: FlowType) {
    setFlows((prevState) => {
      const newFlows = [...prevState];
      const index = newFlows.findIndex((flow) => flow.id === newFlow.id);
      if (index !== -1) {
        newFlows[index].description = newFlow.description ?? "";
        newFlows[index].data = newFlow.data;
        newFlows[index].name = newFlow.name;
        newFlows[index].color = newFlow.color ? newFlow.color : findUnPickedColor(flows)[0];
      }
      return newFlows;
    });
  }

  async function saveFlow(newFlow: FlowType) {
    try {
      // updates flow in db
      // FIXME: OLD
      const response = await saveAllFlowsToDatabase(flows)
      console.log(response)
      const updatedFlow = await updateFlowInDatabase(newFlow);
      if (updatedFlow) {
        // updates flow in state
        setFlows((prevState) => {
          const newFlows = [...prevState];
          const index = newFlows.findIndex((flow) => flow.id === newFlow.id);
          if (index !== -1) {
            newFlows[index].description = newFlow.description ?? "";
            newFlows[index].data = newFlow.data;
            newFlows[index].name = newFlow.name;
            newFlows[index].color = newFlow.color ?? findUnPickedColor(flows)[0];
          }
          return newFlows;
        });
        //update tabs state
        setTabsState((prev) => {
          return {
            ...prev,
            [tabId]: {
              isPending: false,
            },
          };
        });
      }

    } catch (err) {
      setErrorData(err);
    }
  }

  const [disableCopyPaste, setDisableCopyPaste] = useState(false);
  const [managerMode, setManagerMode] = useState(false)

  const [flowMode, setFlowMode] = useState(false)


  return (
    <TabsContext.Provider
      value={{
        saveFlow,
        lastCopiedSelection,
        setLastCopiedSelection,
        lastSelection,
        setLastSelection,
        disableCopyPaste,
        setDisableCopyPaste,
        managerMode,
        setManagerMode,
        flowMode,
        setFlowMode,
        hardReset,
        tabId,
        setTabId,
        flows,
        save,
        incrementNodeId,
        removeFlow,
        addFlow,
        updateFlow,
        downloadFlow,
        downloadFlows,
        uploadFlows,
        uploadFlow,
        getNodeId,
        tabsState,
        setTabsState,
        paste,
        getTweak,
        setTweak,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
}
