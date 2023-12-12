import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { NodeDataType } from "../../types/flow";
import { classNames, limitScrollFieldsModal } from "../../utils";
import { typesContext } from "../../contexts/typesContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import ToggleShadComponent from "../../components/toggleShadComponent";
import InputListComponent from "../../components/inputListComponent";
import TextAreaComponent from "../../components/textAreaComponent";
import InputComponent from "../../components/inputComponent";
import FloatComponent from "../../components/floatComponent";
import Dropdown from "../../components/dropdownComponent";
import IntComponent from "../../components/intComponent";
import InputFileComponent from "../../components/inputFileComponent";
import PromptAreaComponent from "../../components/promptComponent";
import CodeAreaComponent from "../../components/codeAreaComponent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Text, Variable } from "lucide-react";
import { Switch } from "@radix-ui/react-switch";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { DragIcon } from "../../icons/DragIcon";
import { TabsContext } from "../../contexts/tabsContext";
import EditPreModal from "../addeditPreModal";
import { HelpBtn } from "../../components/ui/helpbtn";
import { APITemplateType, ConditionClassType } from "../../types/api";
import { DropdownMenu } from "../../components/ui/dropdown-menu";
import { EditConditionIcon } from "../../icons/EditConditionIcon";
import { EditResponseIcon } from "../../icons/EditResponseIcon";
import EditResponseModal from "../EditResponseModal";


export default function EditNodeModal({ data }: { data: NodeDataType }) {
  const { openPopUp } = useContext(PopUpContext)
  const [open, setOpen] = useState(true);
  const [nodeLength, setNodeLength] = useState(
    Object.keys(data.node.template).filter(
      (t) =>
        t.charAt(0) !== "_" &&
        data.node.template[t].show &&
        (data.node.template[t].type === "str" ||
          data.node.template[t].type === "bool" ||
          data.node.template[t].type === "float" ||
          data.node.template[t].type === "code" ||
          data.node.template[t].type === "prompt" ||
          data.node.template[t].type === "file" ||
          data.node.template[t].type === "int"),
    ).length,
  );
  const [nodeValue, setNodeValue] = useState(null);
  const { closePopUp } = useContext(PopUpContext);
  const { tabId, flows, saveFlow } = useContext(TabsContext)
  const { types } = useContext(typesContext);
  const ref = useRef();
  const [enabled, setEnabled] = useState(null);
  const [quote, setQuote] = useState(false);
  const [dragCnd, setDragCnd] = useState<ConditionClassType>()
  const [dropCnd, setDropCnd] = useState<any>()
  const [name, setName] = useState(data.node?.display_name ? data.node.display_name : '')

  const response = data.node.template?.response ? data.node.template?.response : null
  let conditions = data.node.conditions?.length ? data.node.conditions : null
  const pre_responses = data.node.pre_responses?.length ? data.node.pre_responses : null
  const pre_transitions = data.node.pre_transitions?.length ? data.node.pre_transitions : null

  // console.log(conditions);

  const [responseValue, setResponseValue] = useState(response.value)
  const [conditionsState, setConditionsState] = useState(conditions ? conditions : [])

  const onDragStartHandler = (e: DragEvent | any, cond: ConditionClassType) => {
    // e.preventDefault()
    // console.log(cond)
    setDragCnd(cond)
    // console.log(conditions);
  }

  const onDragOverHandler = (e: DragEvent | any) => {
    e.preventDefault()
    // console.log(e)
    // e.target.style.background = 'black'
  }

  const onDragLeaveHandler = (e: DragEvent | any) => {
    e.preventDefault()
    // console.log(e)
    // e.target.style.background = '#F9FAFC'
  }

  const onDragEndHandler = (e: DragEvent | any) => {
    // console.log(e)
  }

  const onDropHandler = (e: any, cond: ConditionClassType) => {
    e.preventDefault()
    // console.log(cond)
    setConditionsState(conditions.map((condition, idx) => {
      if (condition.conditionID == cond.conditionID) {
        // console.log(dragCnd)
        return dragCnd
      }
      if (condition.conditionID == dragCnd.conditionID) {
        return cond
      }
      return condition
    }))
    data.node.conditions = conditionsState
  }

  // const sortConditions = (a: ConditionClassType, b: ConditionClassType) => {
  //   if (a.conditionID > b.conditionID) {
  //     return 1
  //   } else return -1
  // }

  useEffect(() => {
    setConditionsState(conditions ? conditions : [])
  }, [conditions])

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    data.node.pre_responses = data.node.pre_responses
    data.node.pre_transitions = data.node.pre_transitions
    data.node.conditions = conditionsState
    data.node.display_name = name
    saveFlow(savedFlow);
    closePopUp();
  }

  useEffect(() => { }, [closePopUp, data.node.template]);

  function changeAdvanced(node): void {
    Object.keys(data.node.template).filter((n, i) => {
      if (n === node.name) {
        data.node.template[n].advanced = !data.node.template[n].advanced;
      }
      return true;
    });
    setNodeValue(!nodeValue);
  }

  const IS_GLOBAL_NODE = data.id === "GLOBAL_NODE" || data.id === "LOCAL_NODE"


  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[700px]">
        <DialogTitle className="flex items-center">
          <EditConditionIcon fill="var(--text)" />
          <span className="pr-2">Edit node </span>
          <Badge variant="secondary">Name: {data.node.display_name}</Badge>
          <Badge className="ml-2" variant="secondary">ID: {data.id}</Badge>
        </DialogTitle>
        <div>
          <label htmlFor="">
            <span className={`text-sm mb-2 block font-semibold`}>Name</span>
            <InputComponent placeholder={IS_GLOBAL_NODE ? data.node.display_name : ""} disabled={IS_GLOBAL_NODE} onChange={e => setName(e)} password={false} value={name} />
          </label>
        </div>
        <div>
          {response && (
            <>
              <label htmlFor="">
                <span className={`text-sm mb-2 block font-semibold`}>Response</span>
                <span className="bg-[#F9FAFC] text-[#8D96B5] flex flex-row items-center justify-between p-3 h-[38px] w-full rounded-md text-sm border-[1px] border-[#8D96B5]">
                  {responseValue ? responseValue : 'Edit response to show it here...'}
                  <button onClick={e => openPopUp(<EditResponseModal data={data}/> )}>
                    <EditResponseIcon />
                  </button>
                </span>
              </label>
              {/* <label className="flex flex-row" htmlFor="">
                <span className={`${quote && 'text-neutral-400'}`}>Quote</span>
                <ToggleShadComponent
                  enabled={quote}
                  setEnabled={(e) => { setQuote(prev => !prev) }
                  }
                  disabled={false}
                  size="small" />
                <span className={`${!quote && 'text-neutral-400'}`}>Description</span>
              </label> */}
              {/* {!quote ? (
                <label htmlFor="">
                  <span></span>
                  <InputComponent
                    onChange={value => response.value = value}
                    placeholder='Enter bot’s response text...'
                    password={false}
                    value={response.value ? response.value : ''}
                  />
                </label>
              ) : (
                <label htmlFor="">
                  <InputComponent
                    onChange={value => data.node.description = value}
                    placeholder='Enter node description...'
                    password={false}
                    value={data.node.description ? data.node.description : ''}
                  />
                </label>
              )} */}
            </>
          )}
        </div>
        {data.node.base_classes[0] == 'llm_node' && (
          <>
            <DialogHeader>
              <DialogDescription>
                <div className="flex pt-3">
                  <Variable className="edit-node-modal-variable "></Variable>
                  <span className="edit-node-modal-span">
                    Parameters
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="edit-node-modal-arrangement">
              <div
                className={classNames(
                  "edit-node-modal-box",
                  nodeLength > limitScrollFieldsModal
                    ? "overflow-scroll overflow-x-hidden custom-scroll"
                    : "overflow-hidden",
                )}
              >
                {nodeLength > 0 && (
                  <div className="edit-node-modal-table">
                    <Table className="table-fixed bg-muted outline-1">
                      <TableHeader className="edit-node-modal-table-header">
                        <TableRow className="">
                          <TableHead className="h-7 text-center">PARAM</TableHead>
                          <TableHead className="h-7 p-0 text-center">
                            VALUE
                          </TableHead>
                          <TableHead className="h-7 text-center">ACTION</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="p-0">
                        {Object.entries(data.node?.template).map(([key, value]) => {
                          if (key == 'response') return <></>
                          return (
                            <TableRow key={key} className="h-10">
                              <TableCell className="truncate p-0 text-center text-sm text-foreground sm:px-3">
                                <div className="flex flex-row items-center justify-start">
                                  <span className="ml-12">{key}</span>
                                </div>
                              </TableCell>
                              <TableCell className="w-[300px] p-0 text-center text-xs text-foreground ">
                                {value.options ? (
                                  <select
                                    className="p-1 w-[150px] text-center rounded-lg in-modal-input"
                                    onChange={e => value.value = e.target.value}
                                    value={value.value}
                                  >
                                    <option value={''}> choose model </option>
                                    {value.options.map((option) => {
                                      return (
                                        <option value={option}>
                                          {option}
                                        </option>
                                      )
                                    })}
                                  </select>
                                ) :
                                  <input
                                    onChange={v => { value.value = v.target.value }}
                                    defaultValue={value.value}
                                    type="string"
                                    className="p-1 w-[150px] text-center rounded-lg in-modal-input"
                                  />}
                              </TableCell>
                              <TableCell className="p-0 text-center" >
                                {/* <button
                                  className={`${data.node.conditions.length > 0 && 'bg-red-500'} p-1.5 rounded-lg`}
                                  onClick={e => { if (confirm("Вы уверены?")) { data.node.conditions = data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID); setConditionsState(data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID)) } }}
                                >
                                  <DeleteIcon fill={`${data.node.conditions.length > 0 ? 'white' : 'black'}`} />
                                </button> */}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        <DialogHeader>
          <DialogDescription>
            <div className="flex pt-3">
              <Variable className="edit-node-modal-variable "></Variable>
              <span className="edit-node-modal-span">
                Conditions
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="edit-node-modal-arrangement">
          <div
            className={classNames(
              "edit-node-modal-box",
              nodeLength > limitScrollFieldsModal
                ? "overflow-scroll overflow-x-hidden custom-scroll"
                : "overflow-hidden",
            )}
          >
            {nodeLength > 0 && (
              <div className="edit-node-modal-table">
                <Table className="table-fixed bg-muted outline-1">
                  <TableHeader className="edit-node-modal-table-header">
                    <TableRow className="">
                      <TableHead className="h-7 text-center">PARAM</TableHead>
                      <TableHead className="h-7 p-0 text-center">
                        PRIORITY
                      </TableHead>
                      <TableHead className="h-7 text-center">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="p-0">
                    {conditionsState.map((condition, index) => {
                      return (
                        <TableRow
                          draggable
                          onDragStart={e => onDragStartHandler(e, condition)}
                          onDragLeave={e => onDragLeaveHandler(e)}
                          onDragOver={e => onDragOverHandler(e)}
                          onDragEnd={e => onDragEndHandler(e)}
                          onDrop={e => onDropHandler(e, condition)}
                          key={condition.conditionID}
                          className="h-10">
                          <TableCell className="truncate p-0 text-center text-sm text-foreground sm:px-3">
                            <div className="flex flex-row items-center justify-start">
                              <DragIcon className="cursor-grabbing" />
                              <span className="ml-12">{condition.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="w-[300px] p-0 text-center text-xs text-foreground ">
                            <input
                              onChange={v => { condition.priority = Number(v.target.value) }}
                              defaultValue={condition.priority}
                              type="number"
                              className="p-1 text-center rounded-lg in-modal-input"
                            />
                          </TableCell>
                          <TableCell className="p-0 text-center" >
                            <button
                              className={`${data.node.conditions.length > 0 && 'bg-red-500'} p-1.5 rounded-lg`}
                              onClick={e => { if (confirm("Вы уверены?")) { data.node.conditions = data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID); setConditionsState(data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID)) } }}
                            >
                              <DeleteIcon fill={`${data.node.conditions.length > 0 ? 'white' : 'black'}`} />
                            </button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
        <h5 className="extra-title text-sm mt-4"> Preprocessing in progress... </h5>
        <div className="  ">
          <div className="mb-3 ">
            {/* <h5 className="extra-title text-sm mb-2 w-max rounded">Preresponse processing</h5> */}
            <span className="w-[200px] h-[20px] rounded mb-1 bg-neutral-300 block ">  </span>
            <div className="flex flex-row">
              {pre_responses?.map((res, idx) => <span key={res.name} className='text-sm bg-neutral-900 text-white px-2 py-1 rounded-md mx-0.5'> <span className="text-neutral-500">{idx}. </span>{res.name}</span>)}
              <button disabled onClick={e => openPopUp(<EditPreModal data={data} resp={true} />)} className=" bg-neutral-300 text-neutral-500 py-1 px-2 text-sm rounded-md font-medium">+ Add</button>
            </div>
          </div>
          <div className="mb-3">
            {/* <h5 className="extra-title text-sm mb-2"> Pretransition processing </h5> */}
            <span className="w-[200px] h-[20px] rounded mb-1 bg-neutral-300 block ">  </span>
            <div className="flex flex-row">
              {pre_transitions?.map((res, idx) => <span key={res.name} className='text-sm bg-neutral-900 text-white px-2 py-1 rounded-md mx-0.5'> <span className="text-neutral-500">{idx}. </span>{res.name}</span>)}
              <button disabled onClick={e => openPopUp(<EditPreModal data={data} resp={false} />)} className=" bg-neutral-300 text-neutral-500 py-1 px-2 text-sm rounded-md font-medium">+ Add</button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <HelpBtn />
          <Button
            className="mt-3"
            onClick={handleClick}
            type="submit"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
