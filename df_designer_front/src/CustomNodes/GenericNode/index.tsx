import {
  classNames,
  conditionTypes,
  default_types,
  flowTypes,
  getCurrNode,
  nodeColors,
  nodeIconsLucide,
  nodeTransitionTypes,
  nodeTypes,
  titleNodeColors,
  titleTextNodeColors,
  toTitleCase,
} from "../../utils";
import ParameterComponent from "./components/parameterComponent";
import { typesContext } from "../../contexts/typesContext";
import React, { useContext, useState, useEffect, useRef, useId, useCallback, useMemo } from "react";
import { FlowType, NodeDataType, NodeType } from "../../types/flow";
import { alertContext } from "../../contexts/alertContext";
import { PopUpContext } from "../../contexts/popUpContext";
import NodeModal from "../../modals/NodeModal";
import Tooltip from "../../components/TooltipComponent";
import { Handle, NodeToolbar, Position, getNodePositionWithOrigin, useReactFlow } from "reactflow";
import NodeToolbarComponent from "../../pages/FlowPage/components/nodeToolbarComponent";
import ShadTooltip from "../../components/ShadTooltipComponent";
import { useSSE } from "../../contexts/SSEContext";
import { Input } from "../../components/ui/input";
import InputComponent from "../../components/inputComponent";
import { InputBase } from "@mui/material";
import { useOnClickOutside } from "../../alerts/hooks/useOnClickOutside";
import { CheckedIcon } from "../../icons/CheckedIcon";
import { Info_Small_Icon } from "../../icons/InfoSmall_Icon";
import { PreArrowIcon } from "../../icons/PreArrowIcon";
import { ConditionClassType } from "../../types/api";
import { LinkComponent } from "./components/linkComponent";
import { TabsContext } from "../../contexts/tabsContext";
import { LinksListComponent } from "./components/linksListComponent";
import EditConditionModal from "../../modals/editConditionModal";
import { Badge, BadgeProps } from "../../components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { ConditionPlusIcon } from "../../icons/ConditionPlus";
import InputConditionsModal from "../../modals/inputConditionsModal";
import { EditLinkIcon } from "../../icons/EditLinkIcon";
import { Links_ } from "../../icons/Links";
import { darkContext } from "../../contexts/darkContext";
import * as ContextMenu from '@radix-ui/react-context-menu'
import { CopyIcon } from "@radix-ui/react-icons";
import { ClipboardPasteIcon, Combine, FileText, ReplaceIcon, Settings2, Trash2 } from "lucide-react";
import EditNodeModal from "../../modals/EditNodeModal";
import _ from "lodash";
import { ManageIcon } from "../../icons/ManageIcon";
import EditLinkModal from "../../modals/editLinkModal";
import { ContextMenuItem } from "./ContextMenuItem";

export default function GenericNode({
  data,
  selected,
}: {
  data: NodeDataType;
  selected: boolean;
}) {

  // useEffect(() => { console.log(data) }, [selected])

  const [activePreRes, setActivePreRes] = useState<string[]>([])
  const [activePreTrans, setActivePreTrans] = useState<string[]>([])

  // useEffect(() => {

  // }, [activePreRes, activePreTrans])


  const { reactFlowInstance, setReactFlowInstance } =
    useContext(typesContext);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const { closePopUp, openPopUp } = useContext(PopUpContext);
  const showError = useRef(true);
  const { types, deleteNode } = useContext(typesContext);
  const { flows, tabId, disableCopyPaste, managerMode, lastCopiedSelection, setLastCopiedSelection, paste, lastSelection, setLastSelection, setTabId, goToNodeHandler, targetNode, setTargetNode } = useContext(TabsContext)
  const { setViewport, getEdges, setEdges, setNodes } = useReactFlow();
  const navigate = useNavigate()
  const edges = getEdges()

  // const goToNodeHandler = (currFlow: FlowType, nodeID: string) => {
  //   // setTabId(currFlow.id)
  //   console.log(flows)
  //   navigate(`/flow/${currFlow.id}`)
  //   // try {
  //   // } catch (error) {
  //   // } finally {
  //     // setTimeout(() => {
  //     //   if (tabId === currFlow.id && window.location.pathname.includes(currFlow.id)) {
  //     //     const nodes = currFlow.data.nodes
  //     //     let node = nodes.find((node) => node.id == nodeID)
  //     //     // reactFlowInstance.fitBounds({ x: node.position.x, y: node.position.y, width: node.width, height: node.height })
  //     //   }
  //     // }, 200);
  //   // }

  //   // const currNode: NodeType = currFlow.data.nodes.find((node) => node.data.id == nodeID)
  //   // setTimeout(() => {
  //   //   const nodes = reactFlowInstance.getNodes()
  //   //   let node = nodes.find((node) => node.id == nodeID)
  //   //   reactFlowInstance.fitBounds({ x: node.position.x, y: node.position.y, width: node.width, height: node.height })
  //   //   // node.selected = true
  //   // }, 50);
  //   // console.log(flows)
  // }

  const [links, setLinks] = useState<any>()

  useEffect(() => {
    if (data.node.node_type == nodeTypes.link) {
      data.node.from_links = edges.filter((edge) => edge.target == data.id).map((edge) => {
        return {
          node: edge.source,
          condition: flows.
            find((flow) => flow.data.nodes?.
              find((node: NodeType) => node.data.id == edge.source)).data.nodes.
            find((node: NodeType) => node.data.id == edge.source).data.node.conditions.
            find((cnd) => `${cnd.type}${cnd.conditionID}` == edge.sourceHandle.split('|')[1]).name
        }
      })
      // console.log(data.node.from_links)
    }
  }, [setEdges, setNodes, edges.length])

  // all conditions state
  const [CONDITIONS, setCONDITIONS] = useState<ConditionClassType[]>(data.node.conditions ?? [])
  const [LOCAL_CONDITIONS, setLOCAL_CONDITIONS] = useState<ConditionClassType[]>(
    flows.
      find((flow) => flow.id === tabId)?.data?.nodes?.
      find((node) => node.id === nodeTypes.LOCAL)?.data?.node?.conditions
    ?? [])
  const [GLOBAL_CONDITIONS, setGLOBAL_CONDITIONS] = useState<ConditionClassType[]>(
    flows.
      find((flow) => flow.id === flowTypes.GLOBAL)?.data?.nodes?.
      find((node) => node.id === nodeTypes.GLOBAL)?.data?.node?.conditions
    ?? [])

  // update condition list when add new condition in global node 
  useEffect(() => {
    setGLOBAL_CONDITIONS(flows.
      find((flow) => flow.id === flowTypes.GLOBAL)?.data?.nodes?.
      find((node) => node.id === nodeTypes.GLOBAL)?.data?.node?.conditions
      ?? [])
  }, [flows.
    find((flow) => flow.id === flowTypes.GLOBAL)?.data?.nodes?.
    find((node) => node.id === nodeTypes.GLOBAL)?.data?.node?.conditions.length
  ])

  // update condition list when add new condition in local node 
  useEffect(() => {
    setLOCAL_CONDITIONS(flows.
      find((flow) => flow.id === tabId)?.data?.nodes?.
      find((node) => node.id === nodeTypes.LOCAL)?.data?.node?.conditions
      ?? [])
  }, [flows.
    find((flow) => flow.id === tabId)?.data?.nodes?.
    find((node) => node.id === nodeTypes.LOCAL)?.data?.node?.conditions.length
  ])

  useEffect(() => {
    // console.log(CONDITIONS, LOCAL_CONDITIONS, GLOBAL_CONDITIONS)

    // const data_conditions = CONDITIONS.filter((condition) => (LOCAL_CONDITIONS.some((cnd) => cnd.local_id === condition.local_id) || GLOBAL_CONDITIONS.some((cnd) => cnd.global_id === condition.global_id) || (condition.type !== conditionTypes.GLOBAL && condition.type !== conditionTypes.LOCAL)))
    const data_conditions = CONDITIONS.filter((condition) => ((condition.type !== conditionTypes.GLOBAL && condition.type !== conditionTypes.LOCAL)))

    const local = (data.id !== nodeTypes.LOCAL && data.id !== nodeTypes.GLOBAL) ? LOCAL_CONDITIONS.filter((cnd) => !cnd.global_id).map((cond, idx) => {
      const ref_cond: ConditionClassType = {
        ...cond,
        conditionID: CONDITIONS.length + idx,
        name: `${default_types.LOCAL}_${cond.name}`,
        transitionType: nodeTransitionTypes.manual,
        type: conditionTypes.LOCAL
      }
      return ref_cond
    }) : []

    const global = data.id !== nodeTypes.GLOBAL ? GLOBAL_CONDITIONS.map((cond, idx) => {
      const ref_cond: ConditionClassType = {
        ...cond,
        conditionID: CONDITIONS.length + LOCAL_CONDITIONS.length + idx,
        name: `${default_types.GLOBAL}_${cond.name}`,
        transitionType: nodeTransitionTypes.manual,
        type: conditionTypes.GLOBAL
      }
      return ref_cond
    }) : []

    data.node.conditions = [...data_conditions, ...local, ...global]
    // console.log(data.node.conditions)
  }, [LOCAL_CONDITIONS, GLOBAL_CONDITIONS])

  useEffect(() => {

  }, [GLOBAL_CONDITIONS])

  useEffect(() => {

  }, [LOCAL_CONDITIONS])

  // const [globalConditions, setGlobalConditions] = useState<any>(
  //   data.id !== 'GLOBAL_NODE' && data.node?.base_classes[0] == 'default_node' && (
  //     flows.find(({ id }) => id == 'GLOBAL').data?.nodes?.find((node: NodeType) => node.id == "GLOBAL_NODE")?.data?.node?.conditions?.map((condition: ConditionClassType, idx: number) => {
  //       const global_data = flows.find(({ id }) => id == 'GLOBAL').data.nodes.find((node: NodeType) => node.id == "GLOBAL_NODE").data
  //       return (
  //         <ParameterComponent
  //           data={data}
  //           color={
  //             nodeColors[types.default_nodes] ??
  //             nodeColors.unknown
  //           }
  //           title={`GLOBAL_${condition.name}`}
  //           info={''}
  //           name={`${condition.name}`}
  //           tooltipTitle={global_data.type}
  //           required={true}
  //           id={data.id + "|" + `GLOBAL_condition${condition.conditionID}` + '|' + data.id}
  //           left={condition.left}
  //           type={`global_condition`}
  //           key={data.id + 'GLOBAL_condition' + `${idx}`}
  //           priority={condition.priority}
  //           conditionID={condition.conditionID}
  //           transitionType={condition.transitionType}
  //         />
  //       )
  //     })
  //   )
  // )

  // const [localConditions, setLocalConditions] = useState<any>(
  //   data.id !== 'LOCAL_NODE' && data.node?.base_classes[0] == 'default_node' && (
  //     flows.find(({ id }) => id == tabId).data?.nodes?.find((node: NodeType) => node.id == "LOCAL_NODE")?.data?.node?.conditions?.map((condition: ConditionClassType, idx: number) => {
  //       const global_data = flows.find(({ id }) => id == tabId).data.nodes.find((node: NodeType) => node.id == "LOCAL_NODE").data
  //       return (
  //         <ParameterComponent
  //           data={data}
  //           color={
  //             nodeColors[types.default_nodes] ??
  //             nodeColors.unknown
  //           }
  //           title={`LOCAL_${condition.name}`}
  //           info={''}
  //           name={`${condition.name}`}
  //           tooltipTitle={global_data.type}
  //           required={true}
  //           id={data.id + "|" + `LOCAL_condition${condition.conditionID}` + '|' + data.id}
  //           left={condition.left}
  //           type={`local_condition`}
  //           key={data.id + 'LOCAL_condition' + `${idx}`}
  //           priority={condition.priority}
  //           conditionID={condition.conditionID}
  //           transitionType={condition.transitionType}
  //         />
  //       )
  //     })
  //   )
  // )

  // console.log(globalConditions)


  const [conditions, setConditions] = useState<any[]>(data.node?.conditions ? [
    ...data.node.conditions.map((condition, idx) => {
      return <ParameterComponent
        data={data}
        color={
          nodeColors[types.default_nodes] ??
          nodeColors.unknown
        }
        title={condition.name}
        info={''}
        name={condition.name}
        tooltipTitle={data.type}
        required={true}
        id={data.id + "|" + `${condition.type}${condition.conditionID}` + '|' + data.id}
        left={condition.left}
        type={condition.type}
        key={data.id + 'condition' + `${idx}`}
        priority={condition.priority}
        conditionID={condition.conditionID}
        transitionType={condition.transitionType}
        global_id={condition.global_id}
        local_id={condition.local_id}
      />
    }),
  ] : [])
  useEffect(() => {
    setConditions(data.node.conditions ? data.node.conditions.map((condition, idx) => {
      return <ParameterComponent
        data={data}
        color={
          nodeColors[types.default_nodes] ??
          nodeColors.unknown
        }
        title={condition.name}
        info={''}
        name={condition.name}
        tooltipTitle={data.type}
        required={true}
        id={data.id + "|" + `${condition.type}${condition.conditionID}` + '|' + data.id}
        left={condition.left}
        type={condition.type}
        key={data.id + 'condition' + `${idx}`}
        priority={condition.priority}
        conditionID={condition.conditionID}
        transitionType={condition.transitionType}
        global_id={condition.global_id}
        local_id={condition.local_id}
      />
    }) : [])
  }, [closePopUp, LOCAL_CONDITIONS, GLOBAL_CONDITIONS, CONDITIONS])
  const [conditionCounter, setConditionCounter] = useState(conditions.length)


  const [name, setName] = useState('')
  const { dark } = useContext(darkContext)
  const [nameInput, setNameInput] = useState(false)
  // any to avoid type conflict
  const Icon: any =
    nodeIconsLucide[data.type] || nodeIconsLucide[types[data.type]];
  const [validationStatus, setValidationStatus] = useState(null);
  // State for outline color
  const { sseData, isBuilding } = useSSE();
  const refHtml = useRef(null);
  const [inputLinks, setInputLinks] = useState(flows.filter((flow) => flow.data?.nodes?.find((node: NodeType) => node?.data?.node?.links?.find((link) => link.to == data.id))).map((flow) => {
    const sourceLinks = flow.data.nodes.filter((node: NodeType) => node.data.node.links?.find((link) => link.to == data.id))
    const p = sourceLinks.map((sourceLink) => flow.data.nodes.filter((node: NodeType) => node.id == edges.find((edge) => edge.target == sourceLink.id)?.source))
    const sourceNodes = sourceLinks.map((sourceLink: NodeType) => sourceLink.data.node.from_links)
    return { flow: flow.name, sourceLinks, sourceNodes }
  }))

  // console.log(inputLinks);
  const [pre_responses, setPre_responses] = useState(data.node?.pre_responses?.length ? data.node.pre_responses : [])
  const [pre_transitions, setPre_transitions] = useState(data.node?.pre_transitions?.length ? data.node.pre_transitions : [])

  useEffect(() => {
    setPre_responses(data.node?.pre_responses?.length ? data.node.pre_responses : [])
    setPre_transitions(data.node?.pre_transitions?.length ? data.node.pre_transitions : [])
  }, [data.node?.pre_responses?.length, data.node?.pre_transitions?.length])


  useOnClickOutside(refHtml, () => {
    setNameInput(false)
  })

  const [position, setPosition] = useState<{ x: number, y: number }>()


  const mouseMoveHandler = (e: MouseEvent) => {
    setPosition({
      x: e.clientX,
      y: e.clientY
    })
  }

  // useEffect(() => { 

  // }, [position])

  useEffect(() => {
    setName(data.node.display_name)
    window.addEventListener("mousemove", mouseMoveHandler)
    // return (
    //   window.removeEventListener("mousemove", mouseMoveHandler)
    // )

  }, [])

  useEffect(() => {
    if (data.node.base_classes[0] == 'default_node') {
      if (data.node.conditions?.filter((condition) => condition.APIKey).length && data.node.conditions?.filter((condition) => condition.llm_model).length && data.node.conditions?.filter((condition) => condition.prompt).length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'links') {
      if (data.node.links?.filter((link) => link.to).length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'fallback_node') {
      if (data.node.template['response']?.value.length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'llm_node') {
      if (Object.values(data.node.template).filter((template) => template.value) && data.node.conditions?.filter((condition) => condition.APIKey).length && data.node.conditions?.filter((condition) => condition.llm_model).length && data.node.conditions?.filter((condition) => condition.prompt).length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'fallback_node') {
      if (data.node.template['response']?.value.length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'start_node') {
      if (data.node.template['response']?.value.length && data.node.conditions?.filter((condition) => condition.APIKey).length && data.node.conditions?.filter((condition) => condition.llm_model).length && data.node.conditions?.filter((condition) => condition.prompt).length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }
  }, [data.node?.conditions, closePopUp, data.node?.template['response']?.value, data.node?.links])

  const handleClassNameForNodeName = () => {
    // switch (data.node.base_classes[0]) {
    //   case "default_node": return "bg-[#198BF6] text-white border-transparent"
    //   case "links": return "bg-[#F5B85A] border-transparent"
    //   case "fallback_node": return "bg-[#FF3434] text-[white] border-transparent"
    //   case "start_node": return "bg-[#00CC99] text-[white] border-transparent"
    //   case "llm_node": return "bg-[#7000FF] text-[white] border-transparent"
    // }
    return ""
  }

  if (!Icon) {
    if (showError.current) {
      setErrorData({
        title: data.type
          ? `The ${data.type} node could not be rendered, please review your json file`
          : "There was a node that can't be rendered, please review your json file",
      });
      showError.current = false;
    }
    deleteNode(data.id);
    return;
  }

  // useEffect(() => {
  // }, [closePopUp, data.node.template]);



  const [nodeParamsList, setNodeParamsList] = useState(Object.keys(data.node.template)
    .filter((t) => t.charAt(0) !== "_")
    .map((t: string, idx) => (
      <div key={idx}>
        {data.node.template[t].show &&
          !data.node.template[t].advanced && data.node.template[t].name == 'response' ? (
          <>

            {pre_responses.length > 1 ? (
              <div className="flex flex-row flex-nowrap px-4 items-center ">
                {data.node.base_classes[0] == 'default_node' &&
                  <div className="flex flex-row flex-nowrap h-full w-max items-center">
                    <Info_Small_Icon />
                    <PreArrowIcon className="" width="9" height="13" viewbox="24 24" />
                  </div>
                }
                <div className="flex flex-wrap flex-row items-center">
                  {pre_responses.length && data.node.template[t].name == 'response' ? pre_responses.map((pre: { name: string; func: string }, idx) => <span key={pre.name} onClick={(e) => {
                    // if (!activePreRes.includes(pre)) {
                    //   setActivePreRes((prev) => [...prev, pre])
                    // } else if (activePreRes.includes(pre)) {
                    //   setActivePreRes((prev) => prev.filter((item) => item !== pre))
                    // }
                  }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreRes.includes(pre.name) ? 'bg-black' : '')}> {pre.name} </span>) : <></>}
                </div>
              </div>
            ) : <></>}
            <ParameterComponent
              data={data}
              color={
                nodeColors[types[data.node.template[t].type]] ??
                nodeColors.unknown
              }
              title={
                data.node.template[t].display_name
                  ? data.node.template[t].display_name
                  : data.node.template[t].name
                    ? toTitleCase(data.node.template[t].name)
                    : toTitleCase(t)
              }
              info={data.node.template[t].info}
              name={t}
              tooltipTitle={data.node.template[t].type}
              required={data.node.template[t].required}
              id={data.node.template[t].type + "|" + t + "|" + data.id}
              left={data.node.base_classes[0] === "start_node" && data.node.template[t].name !== "response" ? false : true}
              type={data.node.template[t].type}
            />
            {pre_transitions.length > 0 && (
              <div className="flex flex-row flex-nowrap px-4 items-center ">
                {data.node.base_classes[0] == 'default_node' &&
                  <div className="flex flex-row flex-nowrap h-full w-max items-center">
                    <Info_Small_Icon />
                    <PreArrowIcon className="h-full" width="9" height="13" viewbox="24 24" />
                  </div>
                }
                <div className="flex flex-wrap flex-row items-center">
                  {pre_transitions.length && data.node.template[t].name == 'response' ? pre_transitions.map((pre: { name: string; func: string }, idx) => <span key={pre.name} onClick={(e) => {
                    // if (!activePreTrans.includes(pre)) {
                    //   setActivePreTrans((prev) => [...prev, pre])
                    //   // console.log(activePreRes)
                    // } else if (activePreTrans.includes(pre)) {
                    //   setActivePreTrans(activePreTrans.filter((item) => { return item != pre }))
                    // }
                  }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreTrans.includes(pre.name) ? 'bg-slate-500' : '')}> {pre.name} </span>) : <></>}
                </div>
              </div>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    )))

  useEffect(() => {
    setNodeParamsList((Object.keys(data.node.template)
      .filter((t) => t.charAt(0) !== "_")
      .map((t: string, idx) => (
        <div className="w-full flex flex-col items-center" key={idx}>
          {data.node.template[t].show &&
            !data.node.template[t].advanced && data.node.template[t].name == 'response' || data.node.template[t].name == 'prompt' ? (
            <>
              {pre_responses.length > 0 ? (
                <div className="flex flex-row flex-nowrap px-4 items-center ">
                  {(data.node.base_classes[0] == 'default_node' || data.node.base_classes[0] == 'llm_node') &&
                    <div className="flex flex-row flex-nowrap h-full w-max items-center">
                      <Info_Small_Icon />
                      <PreArrowIcon className="" width="9" height="13" viewbox="24 24" />
                    </div>
                  }
                  <div className="flex flex-wrap flex-row items-center">
                    {pre_responses.length && data.node.template[t].name == 'response' ? pre_responses.map((pre: { name: string; func: string }, idx) => <span key={pre.name} onClick={(e) => {
                      // if (!activePreRes.includes(pre)) {
                      //   setActivePreRes((prev) => [...prev, pre])
                      // } else if (activePreRes.includes(pre)) {
                      //   setActivePreRes((prev) => prev.filter((item) => item !== pre))
                      // }
                    }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreRes.includes(pre.name) ? 'bg-black' : '')}> {pre.name} </span>) : <></>}
                  </div>
                </div>
              ) : <></>}
              <ParameterComponent
                data={data}
                color={
                  nodeColors[types[data.node.template[t].type]] ??
                  nodeColors.unknown
                }
                title={
                  data.node.template[t].display_name
                    ? data.node.template[t].display_name
                    : data.node.template[t].name
                      ? toTitleCase(data.node.template[t].name)
                      : toTitleCase(t)
                }
                info={data.node.template[t].info}
                name={t}
                tooltipTitle={data.node.template[t].type}
                required={data.node.template[t].required}
                id={data.node.template[t].type + "|" + t + "|" + data.id}
                left={data.node.base_classes[0] === "start_node" && data.node.template[t].name !== "response" ? false : true}
                type={data.node.template[t].type}
              />
              {pre_transitions.length > 0 && (
                <div className="flex flex-row flex-nowrap px-4 items-center ">
                  {data.node.display_name == 'default_node' &&
                    <div className="flex flex-row flex-nowrap h-full w-max items-center">
                      <Info_Small_Icon />
                      <PreArrowIcon className="h-full" width="9" height="13" viewbox="24 24" />
                    </div>
                  }
                  <div className="flex flex-wrap flex-row items-center">
                    {pre_transitions.length && data.node.template[t].name == 'response' ? pre_transitions.map((pre: { name: string; func: string }, idx) => <span key={pre.name} onClick={(e) => {
                      // if (!activePreTrans.includes(pre)) {
                      //   setActivePreTrans((prev) => [...prev, pre])
                      //   // console.log(activePreRes)
                      // } else if (activePreTrans.includes(pre)) {
                      //   setActivePreTrans(activePreTrans.filter((item) => { return item != pre }))
                      // }
                    }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreTrans.includes(pre.name) ? 'bg-slate-500' : '')}> {pre.name} </span>) : <></>}
                  </div>
                </div>
              )}
            </>
          ) : (
            <></>
          )}
          {data.node.template[t].name == 'model_name' && (
            <ParameterComponent
              data={data}
              color={
                nodeColors[types[data.node.template[t].type]] ??
                nodeColors.unknown
              }
              title={
                data.node.template[t].display_name
                  ? data.node.template[t].display_name
                  : data.node.template[t].name
                    ? toTitleCase(data.node.template[t].name)
                    : toTitleCase(t)
              }
              info={data.node.template[t].info}
              name={t}
              tooltipTitle={data.node.template[t].type}
              required={data.node.template[t].required}
              id={data.node.template[t].type + "|" + t + "|" + data.id}
              left={data.node.node_type === nodeTypes.start_node && data.node.template[t].name !== "response" ? false : true}
              type={data.node.template[t].type}
            />
          )}
        </div>
      ))))

  }, [pre_responses, pre_transitions, closePopUp])

  const [idBadge, setIdBadge] = useState(false)
  const [linkHref, setLinkHref] = useState(data.node.node_type === nodeTypes.link ? (flows.find((flow) => flow.name == data.node.links[0]?.to)?.id ?? '') : '')

  const copy = (e: any) => {
    // e.preventDefault();
    // const node = flows.find((flow) => flow.id === tabId).data.nodes.find((node: NodeType) => node.id === data.id)
    // console.log(node)
    // console.log(lastCopiedSelection)
    setLastCopiedSelection(_.cloneDeep(lastSelection))
    setSuccessData({ title: "Node was succesfully copied!" })
  }
  const openSettings = (e) => openPopUp(
    data.node.base_classes[0] === 'links'
      ? <EditLinkModal data={data} />
      : <EditNodeModal data={data} />
  )


  return (
    <>
      {/* <NodeToolbar>
        <NodeToolbarComponent
          data={data}
          openPopUp={openPopUp}
          deleteNode={deleteNode}
        ></NodeToolbarComponent>
      </NodeToolbar> */}
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            className={classNames(
              "generic-node-div new-node-style",
              selected ? "border border-ring" : "border",

            )}
          >
            {data.node.node_type == nodeTypes.link ? (
              <div className={`generic-node-div-title bg-accent ${dark ? "border-0" : ''} gap-0 relative rounded-[15px] flex flex-col justify-center items-start`}>
                {data.type != 'start_node' &&
                  // data.type != 'llm_node' &&
                  <Handle type="target" position={Position.Left} id={data.id} className={classNames("-ml-0.5 mt-2", "h-3 w-3 rounded-full border-2 bg-background border-blue-condition")} />}
                <span className="text-foreground font-semibold mb-2">
                  {data.node.links[0].to}
                </span>
                <div className="flex flex-row items-center justify-between w-full gap-3 mb-4 ml-3">
                  <div className="flex flex-row items-center">
                    <EditLinkIcon fill={dark ? "white" : "black"} />
                    <h5 className="ml-1"> {flows.find((flow) => flow.name == data.node.links[0].to)?.data?.nodes?.find((node: NodeType) => node.id == data.node.links[1].to)?.data?.node?.display_name ?? ''} </h5>
                  </div>
                  <button
                    // to={`/flow/${linkHref}`}
                    key={data.id}
                    onClick={e => {
                      // e.preventDefault()e
                      setTimeout(() => {
                        setTabId(linkHref)
                        navigate(`/flow/${linkHref}`)
                      }, 10);
                      setTimeout(() => {
                        setTargetNode(getCurrNode(flows, linkHref, data.node.links[1].to))
                      }, 25);
                      // window.location.pathname = `/flow/${linkHref}`
                      // setTabId('')
                      // goToNodeHandler(flows.find((flow) => flow.name == data.node.links[0]?.to), data.node.links[1]?.to)

                      // setTimeout(() => {
                      //   setTabId(linkHref);
                      //   if (tabId === linkHref) {
                      //     navigate(`/flow/${linkHref}`)
                      //     reactFlowInstance.fitBounds({ x: node.position.x, y: node.position.y, width: node.width, height: node.height })
                      //   }
                      // }, 1);
                    }} className="bg-background px-2 rounded-lg curr-shadow border-[1px] mr-3 font-semibold"> go to node -&gt; </button>
                </div>
              </div>
            ) : (
              <>
                <div className={`generic-node-div-title ${dark && 'bg-background'} relative rounded-t-[15px]`}>
                  {data.type != 'start_node' &&
                    // data.type != 'llm_node' &&
                    <Handle type="target" position={Position.Left} id={data.id} className={classNames(`-ml-0.5 ${inputLinks.length != 0 && "mt-2"}`, "h-3 w-3 rounded-full border-2 bg-background border-blue-condition")} />}
                  {data.node.node_type == nodeTypes.default_node && inputLinks.length != 0 && <button className={`absolute -left-8 top-2.5 px-1 text-[10px] border-blue-condition border-[2px] font-semibold rounded-s-lg rounded-e ${!dark ? "bg-white" : "bg-muted"}`} onClick={e => openPopUp(<InputConditionsModal goToHandler={goToNodeHandler} data={data} />)}>
                    Links
                  </button>}
                  <div className="generic-node-title-arrangement">
                    <div className="generic-node-tooltip-div">
                      <div className="flex flex-row items-center">
                        <div
                          onMouseLeave={e => setIdBadge(false)}
                          onMouseDownCapture={e => setIdBadge(true)}
                          className={handleClassNameForNodeName() + ` w-full h-full px-2 py-0.5 rounded-xl font-medium id-node-name ${dark ? `bg-background` : "bg-muted"} `}>
                          <span>
                            {data.node.display_name}
                          </span>
                        </div>
                        <Badge variant="default" className={` ${idBadge ? "id-after-node-name" : "id-after-node-name-reverse"} ml-3`}>
                          ID: {data.id}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="round-button-div">
                    <button
                      className="relative"
                      onClick={(event) => {
                        event.preventDefault();
                        openPopUp(<NodeModal data={data} />);
                      }}
                    ></button>
                  </div>
                  <div className="round-button-div">
                    <div className="flex flex-row items-center gap-2">
                      <button onClick={e => openPopUp(<EditNodeModal data={data} />)}>
                        <ManageIcon fill={dark ? 'white' : 'black'} />
                      </button>
                      <Tooltip
                        title={
                          !validationStatus ? (
                            "Validating..."
                          ) : (
                            <div className="generic-node-validation-div">
                              <span> Ready for connection </span>
                            </div>
                          )
                        }
                      >
                        <div className="generic-node-status-position">
                          <div
                            className={classNames(
                              validationStatus && validationStatus.valid
                                ? "green-status"
                                : "status-build-animation",
                              "status-div"
                            )}
                          ></div>
                          <div
                            className={classNames(
                              validationStatus && !validationStatus.valid
                                ? "red-status"
                                : "status-build-animation",
                              "status-div"
                            )}
                          ></div>
                          <div
                            className={classNames(
                              !validationStatus || isBuilding
                                ? "yellow-status"
                                : "status-build-animation",
                              "status-div"
                            )}
                          ></div>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <div className="generic-node-desc bg-card m-0 py-2 pt-0 rounded-b-[15px]">
                  <>
                    <div className="flex flex-col items-center w-full">
                      {nodeParamsList}
                      {links}
                      {conditions}
                      {/* {globalConditions}
                      {localConditions} */}
                    </div>
                    <div
                      className={classNames(
                        Object.keys(data.node.template).length < 1 ? "hidden" : "",
                        "flex-max-width justify-center"
                      )}
                    >
                      {" "}
                    </div>
                    {/* {data.node.base_classes.map((base_class, idx) => {

                })} */}
                    {(data.node.base_classes[0] === "default_node" || data.node.base_classes[0] === "llm_node") && (
                      <div className="flex w-full items-center justify-center mt-1">
                        {!managerMode && (
                          <button className={` text-center flex flex-col justify-center items-center text-xl  ${!dark ? "bg-white hover:bg-node-back border-[1px] border-border " : "bg-card hover:bg-muted border-[1px] border-muted"} py-1 px-6 transition-all rounded-lg new-cnd-btn  `} onClick={(e) => {
                            // console.log(conditionCounter)
                            const newCondition: ConditionClassType = {
                              conditionID: conditionCounter,
                              left: false,
                              name: `dft_cnd${conditionCounter}`,
                              priority: 1,
                              required: true,
                              type: `condition`,
                              transitionType: "default",
                              local_id: data.id === nodeTypes.LOCAL ? `${data.id}-local_condition-${conditionCounter}` : '',
                              global_id: data.id === nodeTypes.GLOBAL ? `${data.id}-global_condition-${conditionCounter}` : ''
                            }
                            const newConditionJSX =
                              <ParameterComponent
                                data={data}
                                color={
                                  nodeColors[types[data.node.template["response"].type]] ??
                                  nodeColors.unknown
                                }
                                title={newCondition.name}
                                info={''}
                                name={newCondition.name}
                                tooltipTitle={data.node.template["response"].type}
                                required={data.node.template["response"].required}
                                id={data.id + "|" + `condition${newCondition.conditionID}` + '|' + data.id}
                                left={false}
                                type={`condition`}
                                key={data.node.template["response"].display_name + `${conditionCounter}`}
                                priority={1}
                                conditionID={conditionCounter}
                                transitionType={newCondition.transitionType}
                              />
                            // console.log(newCondition)
                            data.node.conditions.push(newCondition)
                            setCONDITIONS(prev => [...prev, newCondition])
                            openPopUp(<EditConditionModal conditionID={newCondition.conditionID} data={data} />)
                            setConditions(prev => [...prev, newConditionJSX])
                            setConditionCounter(prev => prev + 1)
                          }} >
                            <ConditionPlusIcon fill="var(--condition-default)" />
                          </button>
                        )}
                      </div>
                    )}
                  </>
                </div>
              </>
            )}
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal container={document.getElementById('modal_root')}>
          <ContextMenu.Content className="context-wrapper">
            {/* <ContextMenu.Item disabled onClick={e => {
              let bounds = document.getElementById('reactFlowWrapper').getBoundingClientRect()
              // console.log(bounds)
              const node = reactFlowInstance.getNode(data.id)
              // console.log(node)
              // console.log(getNodePositionWithOrigin(node))
              const pos = getNodePositionWithOrigin(node)
              // console.log(node)
              deleteNode(data.id)
              setTimeout(() => {
                paste(
                  lastCopiedSelection,
                  {
                    x: node.position.x,
                    y: node.position.y
                  })
              }, 20);
            }}
              className=" context-item context-item-disabled">
              <div className="flex flex-row items-center gap-1">
                <ReplaceIcon className="w-4 h-4" />
                <p>Paste to replace</p>
              </div>
              <span className="text-neutral-400"> Ctrl+Shift+V </span>
            </ContextMenu.Item> */}
            {/* <ContextMenu.Item disabled onClick={e => { }}
              className=" context-item context-item-disabled">
              <div className="flex flex-row items-center gap-1">
                <Combine className="w-4 h-4" />
                <p>Create preset</p>
              </div>
              <span className="text-neutral-400"> Shift+A </span>
            </ContextMenu.Item> */}
            <ContextMenuItem
              type='copy'
              onClick={copy}
              hide={data.id === "LOCAL_NODE" || data.id === "GLOBAL_NODE"}
            />
            <ContextMenuItem
              type='settings' 
              onClick={openSettings}
            />
            <ContextMenuItem type="doc" onClick={_.noop} />
            {data.id !== "LOCAL_NODE" && data.id !== "GLOBAL_NODE" && (
              <ContextMenu.Separator className="w-[90%] mx-auto h-[1px] bg-[#666] " />
            )}
            <ContextMenuItem
              type="delete"
              onClick={e => deleteNode(data.id)}
              hide={data.id === "LOCAL_NODE" || data.id === "GLOBAL_NODE"}
            />
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </>
  );
}
