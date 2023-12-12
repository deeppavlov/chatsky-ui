import { Handle, Position, useReactFlow, useUpdateNodeInternals } from "reactflow";
import {
  classNames,
  getRandomKeyByssmm,
  groupByFamily,
  isValidConnection,
  nodeIconsLucide,
} from "../../../../utils";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import InputComponent from "../../../../components/inputComponent";
import InputListComponent from "../../../../components/inputListComponent";
import TextAreaComponent from "../../../../components/textAreaComponent";
import { typesContext } from "../../../../contexts/typesContext";
import { ParameterComponentType } from "../../../../types/components";
import FloatComponent from "../../../../components/floatComponent";
import Dropdown from "../../../../components/dropdownComponent";
import CodeAreaComponent from "../../../../components/codeAreaComponent";
import InputFileComponent from "../../../../components/inputFileComponent";
import { TabsContext } from "../../../../contexts/tabsContext";
import IntComponent from "../../../../components/intComponent";
import PromptAreaComponent from "../../../../components/promptComponent";
import { nodeNames } from "../../../../utils";
import React from "react";
import { nodeColors } from "../../../../utils";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import { PopUpContext } from "../../../../contexts/popUpContext";
import ToggleShadComponent from "../../../../components/toggleShadComponent";
import { Globe2, Info } from "lucide-react";
import { BotIcon } from "../../../../icons/BotIcon";
import { PersonIcon } from "../../../../icons/PersonIcon";
import { ChangeConditionIcon } from "../../../../icons/ChangeConditionIcon";
import * as TransitionIcons from '../../../../icons/TransitionIcons/index'
import { ConditionClassType } from "../../../../types/api";
import { TransitionComponent } from "./components/transitionComponent";
import { TransitionList } from "./components/transitionsList";
import EditConditionModal from "../../../../modals/editConditionModal";
import useTraceUpdate from "../../../../hooks/useTraceUpdate";
import EditLLMPromptModal from "../../../../modals/llmPromptEdit";
import { darkContext } from "../../../../contexts/darkContext";
import { Globe2Icon } from "lucide-react";
import { LocalNodeIcon } from "../../../../icons/LocalNodeIcon";

export default function ParameterComponent({
  left,
  id,
  data,
  tooltipTitle,
  title,
  color,
  type,
  name = "",
  required = false,
  info = "",
  priority,
  conditionID,
  transitionType,
}: ParameterComponentType) {
  const ref = useRef(null);
  const refHtml = useRef(null);
  const infoHtml = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [position, setPosition] = useState(0);
  const { closePopUp, openPopUp } = useContext(PopUpContext);
  const { setTabsState, tabId, save, saveFlow, updateFlow } = useContext(TabsContext);
  const { dark } = useContext(darkContext)
  let { flows } = useContext(TabsContext)
  const { setEdges, getEdges } = useReactFlow()
  const [forwardsMenu, setForwardsMenu] = useState(false)




  useEffect(() => {
    if (ref.current && ref.current.offsetTop && ref.current.clientHeight) {
      setPosition(ref.current.offsetTop + ref.current.clientHeight / 2);
      updateNodeInternals(data.id);
    }
  }, [data.id, ref, ref.current, ref.current?.offsetTop, updateNodeInternals]);

  useEffect(() => {
    updateNodeInternals(data.id);
  }, [data.id, position, updateNodeInternals]);

  const [enabled, setEnabled] = useState(
    data.node.template[name]?.value ?? false
  );

  useEffect(() => {
  }, [closePopUp, data.node.template]);

  const { reactFlowInstance } = useContext(typesContext);
  let disabled =
    reactFlowInstance?.getEdges().some((e) => e.targetHandle === id) ?? false;
  const [myData, setMyData] = useState(useContext(typesContext).data);

  const handleOnNewValue = (newValue: any) => {
    // data.node.template[name].value = newValue;
    const _flows = flows
    const flow = _flows.filter((flow) => flow.id === tabId)[0]
    const node = flow.data.nodes.filter((node) => node.id == id.split('|').slice(2).join())[0].data.node
    node.template[name].value = newValue
    // Set state to pending
    // console.log('value was changed')
    // console.log(node.template[name]);
    setTabsState((prev) => {
      return {
        ...prev,
        [tabId]: {
          isPending: true,
        },
      };
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setForwardsMenu(true)
  };


  const HandleTypeIcon = (transitionType: string) => {
    switch (transitionType) {
      case "default": return ''; break;
      case "forward": return <TransitionIcons.forward />; break;
      case "backward": return <TransitionIcons.backward />; break;
      case "repeat": return <TransitionIcons.repeat />; break;
      case "previous": return <TransitionIcons.previous />; break;
      case "to start": return <TransitionIcons.to_start />; break;
      case "to fallback": return <TransitionIcons.to_fallback />; break;
        return -1
    }
    return -1
  }


  useEffect(() => {
    const groupedObj = groupByFamily(myData, tooltipTitle);
    refHtml.current = groupedObj.map((item, i) => (
      <span
        key={getRandomKeyByssmm()}
        className={classNames(
          i > 0 ? "mt-3 flex items-center" : "flex items-center"
        )}
      >
        <div
          className="h-6 w-6"
          style={{
            color: nodeColors[item.family],
          }}
        >
          {React.createElement(nodeIconsLucide[item.family])}
        </div>
        <span className="ps-2 text-foreground">
          {nodeNames[item.family] ?? ""}{" "}
          <span className={classNames(left ? "hidden" : "")}>
            {" "}
            -&nbsp;
            {item.type.split(", ").length > 2
              ? item.type.split(", ").map((el, i) => (
                <React.Fragment key={el + i}>
                  <span>
                    {i === item.type.split(", ").length - 1
                      ? el
                      : (el += `, `)}
                  </span>
                  {i % 2 === 0 && i > 0 && <br />}
                </React.Fragment>
              ))
              : item.type}
          </span>
        </span>
      </span>
    ));
  }, [tooltipTitle]);




  const [forwardsItem, setForwardsItem] = useState(transitionType ? transitionType : '')
  const [iconType, setIconType] = useState<ReactNode>()
  useEffect(() => {
    setIconType(HandleTypeIcon(forwardsItem))
  }, [forwardsItem])
  const forwardsItemRef = useRef(transitionType ? transitionType : '')



  const setNewConditionType = () => {
    const _flows = flows
    const flow = _flows.filter((flow) => flow.id === tabId)[0]
    const node = flow.data.nodes.filter((node) => node.id == id.split('|').slice(2).join())[0].data.node
    node.conditions.filter((condition: ConditionClassType) => condition.name == name)[0]['transitionType'] = forwardsItemRef.current;
    flows = _flows
  }


  const handleConditionType = (changeType: string) => {
    setForwardsMenu(false);
    setForwardsItem(prev => changeType);
    forwardsItemRef.current = changeType
    setNewConditionType()
  }

  const handleInputPlaceholder = (temp_name: string) => {
    switch (temp_name) {
      case 'response': return 'Enter bot’s response text...';
      case 'prompt': return 'Enter some prompt...'
    }
  }


  return (
    <div
      ref={ref}
      className={`my-1 flex w-[95%] flex-wrap items-center justify-between px-4 rounded-[8px]` + ' ' + (name == 'response' ? "bg-card mb-1 w-full rounded-none" : 'mb-1 bg-secondary py-2 new-templates border-[1px] border-border') + ' ' + (type == 'condition' ? 'py-3' : (type == 'global_condition' || type == 'local_condition' ? 'py-2' : '')) + ' ' + (name == 'pre-transition' ? 'mb-5' : 'mb-1')}
    >
      <>
        {
          name == 'response' ? <div></div> :
            <div
              className={
                "w-full justify-between ml-1 flex flex-row truncate text-sm " +
                (left ? "" : "") +
                (info !== "" ? " flex items-center" : "")
              }
            >
              <div className={`flex flex-row ${(type == 'global_condition' || type == 'local_condition' )&& 'text-neutral-500'} items-center`}>
                {type == `condition` ? <PersonIcon fill='var(--condition-default)' className="mr-2" /> : <></>}
                { type == 'global_condition' ? <Globe2Icon className="mr-2" strokeWidth={1.5} stroke="var(--medium-indigo)" /> : <></> }
                { type == 'local_condition' ? <LocalNodeIcon className="mr-2" strokeWidth={1.5} stroke="var(--medium-indigo)" /> : <></> }
                {title}
              </div>
              <div className="flex flex-row items-center">
                <span className="text-neutral-400"> {priority} </span>
                {type == 'condition' && <button onClick={e => openPopUp(<EditConditionModal data={data} conditionID={conditionID} />)}> <ChangeConditionIcon fill={dark ? "white" : "black"} className="ml-8" /> </button>}
                <div className="">
                  {info !== "" && (
                    <ShadTooltip content={infoHtml.current}>
                      <Info className="relative bottom-0.5 ml-2 h-3 w-3" />
                    </ShadTooltip>
                  )}
                </div>
              </div>
            </div>
        }
        {left &&
          (type === "str" ||
            type === "bool" ||
            type === "float" ||
            type === "code" ||
            type === "prompt" ||
            type === "file" ||
            type === "int") ? (
          <></>
        ) : (
          <div className="">
            <ShadTooltip
              delayDuration={0}
              content={refHtml.current}
              side={left ? "left" : "right"}
            >
              <Handle onContextMenu={(e) => handleClick(e)}
                type={left ? "target" : "source"}
                position={left ? Position.Left : Position.Right}
                id={id}
                isConnectable={getEdges().filter((edge) => edge.source === data.id)?.length < (data.node.conditions?.length - data.node.conditions.filter((cond) => cond.transitionType !== 'default')?.length)}
                className={classNames(
                  left ? "-ml-0.5 " : "-mr-0.5 ",
                  "h-3 w-3 rounded-full border-2 bg-background",
                  forwardsItem == 'default' ? '' : 'hidden'
                )}
                style={{
                  borderColor: '#FF9500',
                  top: position,
                }}
              ></Handle>
            </ShadTooltip>
            <div className="relative">
              <div
                onContextMenu={(e) => handleClick(e)}
                style={{ borderColor: '#FF9500' }}
                className={classNames(forwardsItem != 'default' ? '' : 'hidden', 'absolute flex flex-row items-center justify-center w-max left-[305px] ml-8 bg-node-back px-2 text-xs font-semibold rounded rounded-e-lg -top-[22px] border-2')}>
                {forwardsItem}
                <span className="ml-1">{iconType}</span>
              </div>
              <TransitionList
                forwardsMenu={forwardsMenu}
                handleConditionType={handleConditionType}
                id={id} />
            </div>
          </div>

        )}

        {left === true &&
          type === "str" &&
          !data.node.template[name].options ? (
          <div className="mt-0 w-full">
            {data.node.template[name].list ? (
              <InputListComponent
                disabled={disabled}
                value={
                  !data.node.template[name].value ||
                    data.node.template[name].value === ""
                    ? [""]
                    : data.node.template[name].value
                }
                onChange={handleOnNewValue}
              />
            ) : data.node.template[name].multiline ? (
              <TextAreaComponent
                disabled={disabled}
                value={data.node.template[name].value ?? ""}
                onChange={handleOnNewValue}
              />
            ) : (
              <div className="flex flex-row w-full mt-1 items-center">
                {name == 'response' && <BotIcon fill={dark ? "white" : "black"} className="mr-2" />}
                {name == 'response' ?
                  <>
                    {data.node.template[name].value ? data.node.template[name].value : "‘I am a bot and here is my quote’"}
                  </>
                  :
                  <>
                    <InputComponent
                      className="w-full"
                      disabled={disabled}
                      disableCopyPaste={true}
                      password={data.node.template[name].password ?? false}
                      value={data.node.template[name].value ?? ""}
                      onChange={handleOnNewValue}
                      placeholder={handleInputPlaceholder(name)}
                    />
                  </>
                }
                {name == 'prompt' && <button onClick={e => openPopUp(<EditLLMPromptModal data={data} template={data.node.template[name]} />)}> <ChangeConditionIcon className="ml-8" fill={dark ? "white" : "black"} /> </button>}
              </div>
            )}
          </div>
        ) : left === true && type === "bool" ? (
          <div className="mt-2 w-full">
            <ToggleShadComponent
              disabled={disabled}
              enabled={enabled}
              setEnabled={(t) => {
                handleOnNewValue(t);
                setEnabled(t);
              }}
              size="large"
            />
          </div>
        ) : left === true && type === "float" ? (
          <div className="mt-2 w-full">
            <FloatComponent
              disabled={disabled}
              disableCopyPaste={true}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : left === true &&
          type === "str" &&
          data.node.template[name].options ? (
          <div className="mt-0 w-full">
            <Dropdown
              options={data.node.template[name].options}
              onSelect={handleOnNewValue}
              value={data.node.template[name].value ?? "Choose an option"}
            ></Dropdown>
          </div>
        ) : left === true && type === "code" ? (
          <div className="mt-2 w-full">
            <CodeAreaComponent
              disabled={disabled}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : left === true && type === "file" ? (
          <div className="mt-2 w-full">
            <InputFileComponent
              disabled={disabled}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
              fileTypes={data.node.template[name].fileTypes}
              suffixes={data.node.template[name].suffixes}
              onFileChange={(t: string) => {
                data.node.template[name].file_path = t;
                save();
              }}
            ></InputFileComponent>
          </div>
        ) : left === true && type === "int" ? (
          <div className="mt-2 w-full">
            <IntComponent
              disabled={disabled}
              disableCopyPaste={true}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : left === true && type === "prompt" ? (
          <div className="mt-2 w-full">
            <PromptAreaComponent
              disabled={disabled}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : (
          <></>
        )}
      </>
    </div >
  );
}
