import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { NodeDataType } from "../../types/flow";
import { classNames, condition_actions, condition_intents, condition_llms, condition_variables, limitScrollFieldsModal } from "../../utils";
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
import { EditConditionIcon } from "../../icons/EditConditionIcon";
import { TabsContext } from "../../contexts/tabsContext";
import { HelpBtn } from "../../components/ui/helpbtn";
import { LLM_cnd_icon } from "../../icons/LLMConditionIcon";
import { Custom_cnd_icon } from "../../icons/CustomConditionIcon";
import { Title } from "@radix-ui/react-dialog";
import { PlayIcon } from "../../icons/PlayIcon";
import { Play2Icon } from "../../icons/Play2Icon";


export default function EditConditionModal({ data, conditionID }: { data: NodeDataType, conditionID: number }) {
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

  const { closePopUp } = useContext(PopUpContext);
  const { types } = useContext(typesContext);
  const [custom, setCustom] = useState(true);
  const { tabId, flows, saveFlow } = useContext(TabsContext)


  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }

  useEffect(() => { }, [closePopUp, data.node.template]);

  let conditions = data.node.conditions.length ? data.node.conditions : null
  const condition = data.node?.conditions.find((cond) => conditionID === cond.conditionID) ?? null

  const [title, setTitle] = useState(condition?.name ? condition.name : '')
  const [intent, setIntent] = useState(condition?.intent ? condition.intent : '')
  const [action, setAction] = useState(condition?.action ? condition.action : '')
  const [variables, setVariables] = useState(condition?.variables ? condition.variables : '')
  const [llm_model, setLLM_Model] = useState(condition?.llm_model ? condition.llm_model : '')
  const [api_key, setApi_key] = useState(condition?.APIKey ? condition.APIKey : '')
  const [prompt, setPrompt] = useState(condition?.prompt ? condition.prompt : '')

  const [promptTestWindow, setPromptTestWindow] = useState(false)
  const [isSatisfied, setIsSatisfied] = useState(false)


  const [conditionsState, setConditionsState] = useState(conditions)

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    if (!custom) {
      condition.prompt = ''
      condition.APIKey = ''
      condition.llm_model = ''
      condition.name = title
      condition.intent = intent
      condition.action = action
      condition.variables = variables
    } else {
      condition.prompt = prompt
      condition.APIKey = api_key
      condition.llm_model = llm_model
      condition.name = title
      condition.intent = ''
      condition.action = ''
      condition.variables = ''
    }
    saveFlow(savedFlow);
    closePopUp();
  }

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className={`sm:max-w-[600px] ${promptTestWindow ? "lg:max-w-[940px]" : "lg:max-w-[700px]"} flex flex-row transition-all duration-500 `}>
        <div className="w-full flex flex-col justify-between">
          <DialogHeader className="flex flex-row justify-between items-start">
            <DialogTitle>
              <span className="flex flex-row items-center mb-2">
                <EditConditionIcon fill="var(--text)" />
                <p className="ml-1">Edit Conditions</p>
              </span>
              <Badge variant="secondary" > {data.id} | {condition.name ? condition.name : 'noname'} </Badge>
            </DialogTitle>
            <label className="flex flex-row mr-4 items-center" htmlFor="">
              <span className={`${custom && 'text-neutral-400'}  flex flex-row items-center`}>
                <Custom_cnd_icon className="" fill={` ${custom ? '#999' : 'var(--text)'} `} />
                Custom
              </span>
              <ToggleShadComponent
                className="mt-1"
                enabled={custom}
                setEnabled={(e) => { setCustom(prev => prev) }
                }
                disabled={false}
                size="small" />
              <span className={`${!custom && 'text-neutral-400'} flex flex-row items-center`}>
                <LLM_cnd_icon className="mr-1" fill={` ${!custom ? '#999' : 'var(--text)'} `} />
                Using llm
              </span>
            </label>
          </DialogHeader>
          <div>
            <DialogDescription>
              <div className="flex pt-3 mb-1 flex-row justify-between items-center">
                <span className="edit-node-modal-span text-text">
                  Title
                </span>
                <button
                  className=" bg-background p-2 hover:bg-muted rounded-lg transition "
                  onClick={e => {
                    if (confirm("Are you sure?")) {
                      data.node.conditions = conditions.filter((cond) => cond.conditionID !== condition.conditionID)
                      closePopUp()
                    }
                  }}
                >
                  <DeleteIcon fill="var(--text)" />
                </button>
              </div>
            </DialogDescription>
            <InputComponent onChange={e => { setTitle(e) }} password={false} value={title} />
            {!custom ? (
              <>
                <span className="flex flex-row justify-between items-center mt-4 mb-4">
                  <span className="w-full mr-2">
                    <label className="text-text text-sm" htmlFor="">Intent</label>
                    <Dropdown options={condition_intents} onSelect={e => { setIntent(e) }} value={intent} />
                  </span>
                  <span className="w-full mr-2">
                    <label className="text-text text-sm" htmlFor="">Action</label>
                    <Dropdown options={condition_actions} onSelect={e => { setAction(e) }} value={action} />
                  </span>
                  <span className="w-full mr-2">
                    <label className="text-text text-sm" htmlFor="">Variables</label>
                    <Dropdown options={condition_variables} onSelect={e => { setVariables(e) }} value={variables} />
                  </span>
                  <button
                    className={`bg-red-500 rounded-lg mt-7 p-2.5`}
                    onClick={e => { if (confirm("Вы уверены?")) { data.node.conditions = data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID); setConditionsState(data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID)) } }}
                  >
                    <DeleteIcon fill={`white`} />
                  </button>
                </span>
                <DialogDescription>
                  <div className="flex pt-3">
                    <span className="edit-node-modal-span">
                      Preview
                    </span>
                  </div>
                  <span>
                    <p className="font-semibold text-neutral-500">If</p>
                    <p className="font-semibold line"> {!intent.length && '...'} <span className="text-black"> {intent} </span> <span className="text-neutral-400"> {action} </span> <span className="text-black"> {variables} </span> </p>
                  </span>
                </DialogDescription>
              </>
            ) : (
              <>
                <span className="flex flex-row items-end mt-4 mb-4 justify-between">
                  <label className="flex flex-col w-full" htmlFor="">
                    <span className="text-text text-sm">Model name</span>
                    <Dropdown onSelect={e => setLLM_Model(e)} options={condition_llms} value={llm_model} />
                  </label>
                  <label className="flex flex-col w-full ml-2" htmlFor="">
                    <span className="text-text text-sm">API Key</span>
                    <InputComponent className="mt-1" onChange={e => setApi_key(e)} password={false} value={api_key} />
                  </label>
                </span>
                <label className="mb-4 block" htmlFor="">
                  <span className="text-text text-sm"> Prompt </span>
                  <textarea defaultValue={prompt} onChange={e => setPrompt(e.target.value)} name="prompt" id="condition_prompt" className="w-full rounded-lg mt-1 cond-textarea bg-background" rows={10}></textarea>
                </label>
                <label className="flex flex-col w-full" htmlFor="">
                  <span className="text-text text-sm font-semibold mb-1"> Condition satisfaction triggers </span>
                  <textarea placeholder="# if the following is true, the condition is satisfied" className="w-full h-[60px] overflow-y-scroll p-3 py-1 border-border border-[1px] rounded-md outline-[#8d96b5] outline-2 text-sm font-normal " />
                </label>
              </>
            )}
          </div>
          <DialogFooter>
            <HelpBtn />
            <div className="flex flex-row gap-2">
              <Button
                className="mt-3"
                onClick={handleClick}
                type="submit"
              >
                Save Conditions
              </Button>
              {!promptTestWindow && custom && (
                <Button
                  className="mt-3 bg-neutral-300 text-black hover:bg-neutral-400"
                  onClick={e => { setPromptTestWindow(true) }}
                >
                  Test prompt
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
        {promptTestWindow && custom && (
          <>
            <span className="min-h-[572px] max-h-full ml-2.5 w-[1px] bg-border rounded-lg block"></span>
            <div className={` flex flex-col justify-between text-lg font-semibold min-w-[0px] max-w-[220px] test-anim-for-modal ml-3 `}>
              <div className="w-full flex flex-col justify-between h-full">
                <div>
                  <Title className="flex flex-row items-center gap-2 mb-3">
                    <PlayIcon fill="var(--text)" />
                    Prompt testing
                  </Title>
                  <div>
                    <Title className="font-semibold text-sm mb-3">
                      User input
                    </Title>
                    <textarea placeholder="Type something" className="w-full h-[70px] p-3 py-1 border-border border-[1px] rounded-md oborder outline-2 text-sm font-normal "></textarea>
                    <Button className=" flex flex-row gap-2 text-xs w-full h-7 mb-4 ">
                      <Play2Icon />
                      Run
                    </Button>
                  </div>
                </div>
                <div className="w-full mb-4">
                  <Title className="font-semibold text-sm">
                    Prompt keys
                  </Title>
                  <div className="text-neutral-400 flex flex-col text-sm font-normal">
                    <span>some.key_1</span>
                    <span>some.key_2</span>
                    <span>some.key_3</span>
                  </div>
                </div>
                <div className="w-full">
                  <Title className="font-semibold text-sm mb-3">
                    Response output
                  </Title>
                  <textarea placeholder="Test response will be displayed here." className="w-full h-[200px] p-3 border-border border-[1px] rounded-md outline-border outline-2 text-sm font-normal " name="" id="" rows={10}></textarea>
                  <Button className="bg-white text-black hover:bg-neutral-200 border-black border-[1px] h-7 ">
                    Test triggers
                  </Button>
                  <p className="text-xs mt-2.5 mb-2.5"> Condition status: <span className={` ${isSatisfied ? "text-green-500" : "text-red-500"} `}> {isSatisfied ? "Successfully satisfied" : "Not satisfied"} </span> </p>
                </div>
              </div>
              <Button
                className="mt-3 ml-auto bg-neutral-300 text-black w-max hover:bg-neutral-400"
                onClick={e => { setPromptTestWindow(false) }}
              >
                Stop testing
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
