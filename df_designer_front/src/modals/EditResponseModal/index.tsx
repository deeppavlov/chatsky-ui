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
import { Bold } from "../../icons/FormatTextIcons/Bold";
import { Italic } from "../../icons/FormatTextIcons/Italic";
import { LineThrough } from "../../icons/FormatTextIcons/LineThrougth";
import { Link } from "../../icons/FormatTextIcons/Link";
import { Title } from "@radix-ui/react-dialog";
import { PlayIcon } from "../../icons/PlayIcon";
import { Play2Icon } from "../../icons/Play2Icon";


export default function EditResponseModal({ data }: { data: NodeDataType }) {
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

  const response = data.node.template?.response ? data.node.template?.response : null
  const [title, setTitle] = useState(response?.value ? response.value : '')
  const [llm_model, setLLM_Model] = useState(response?.llm_model ? response.llm_model : '')
  const [api_key, setApi_key] = useState(response?.APIKey ? response.APIKey : '')
  const [prompt, setPrompt] = useState(response?.prompt ? response.prompt : '')
  const [responseQuote, setResponseQuote] = useState<string | string[]>()

  const [promptTestWindow, setPromptTestWindow] = useState(false)



  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    if (!custom) {
      data.node.template['response'].value = title
      data.node.template['response'].quote = responseQuote
    } else {
      data.node.template['response'].value = title
      data.node.template['response'].api_key = api_key
      data.node.template['response'].model_name = llm_model
      data.node.template['response'].prompt = prompt
    }
    saveFlow(savedFlow);
    closePopUp();
  }

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className={`sm:max-w-[600px] ${promptTestWindow ? "lg:max-w-[940px]" : "lg:max-w-[700px]"} flex flex-row transition-all`}>
        <div className="w-full flex flex-col justify-between">
          <DialogHeader className="flex flex-row justify-between items-start">
            <DialogTitle>
              <span className="flex flex-row items-center mb-2">
                <EditConditionIcon />
                <p className="ml-1">Edit Response</p>
              </span>
              <Badge variant="secondary" > {data.id} | {response.name ? response.name : 'noname'} </Badge>
            </DialogTitle>
            <label className="flex flex-row mr-4 items-center" htmlFor="">
              <span className={`${custom && 'text-neutral-400'}  flex flex-row items-center`}>
                <Custom_cnd_icon className="" fill={` ${custom ? '#8D96B5' : 'black'} `} />
                Custom
              </span>
              <ToggleShadComponent
                className="mt-1"
                enabled={custom}
                setEnabled={(e) => { setCustom(prev => !prev) }
                }
                disabled={false}
                size="small" />
              <span className={`${!custom && 'text-neutral-400'} flex flex-row items-center`}>
                <LLM_cnd_icon className="mr-1" fill={` ${!custom ? '#8D96B5' : 'black'} `} />
                Using llm
              </span>
            </label>
          </DialogHeader>
          <div>
            <DialogDescription>
              <div className="flex pt-3">
                <span className="edit-node-modal-span">
                  Display text
                </span>
              </div>
            </DialogDescription>
            <InputComponent onChange={e => { setTitle(e) }} password={false} value={title} />
            {!custom ? (
              <>
                <div className="mt-8">
                  <span className="edit-node-modal-span mb-2 flex">
                    Response quote
                  </span>
                  <div className="flex flex-row items-center justify-start mb-2 gap-2">
                    <button>
                      <Bold />
                    </button>
                    <button>
                      <Italic />
                    </button>
                    <button>
                      <LineThrough />
                    </button>
                    <button>
                      <Link />
                    </button>
                  </div>
                  <textarea className="w-full h-[280px] p-3 border-[#8d96b5] border-[1px] rounded-md outline-[#8d96b5] outline-2 " name="" id="" defaultValue={responseQuote} onChange={e => setResponseQuote(e.target.value)} cols={30}></textarea>
                </div>
              </>
            ) : (
              <>
                <span className="flex flex-row items-end mt-4 mb-4 justify-between">
                  <label className="flex flex-col w-full" htmlFor="">
                    <span className="text-neutral-400 text-sm">Model name</span>
                    <Dropdown onSelect={e => setLLM_Model(e)} options={condition_llms} value={llm_model} />
                  </label>
                  <label className="flex flex-col w-full ml-2" htmlFor="">
                    <span className="text-neutral-400 text-sm">API Key</span>
                    <InputComponent className="mt-1" onChange={e => setApi_key(e)} password={false} value={api_key} />
                  </label>
                </span>
                <label htmlFor="">
                  <span className="text-neutral-400 text-sm"> Prompt </span>
                  <textarea defaultValue={prompt} onChange={e => setPrompt(e.target.value)} name="prompt" id="condition_prompt" className="w-full rounded-lg mt-1 cond-textarea" rows={10}></textarea>
                </label>
              </>
            )}
          </div>
          <DialogFooter className="">
            <HelpBtn />
            <div className="flex flex-row gap-2">
              <Button
                className="mt-3"
                onClick={handleClick}
                type="submit"
              >
                Save response
              </Button>
              {!promptTestWindow && custom && (
                <Button
                  className={`mt-3 bg-neutral-300 text-black hover:bg-neutral-400 `}
                  onClick={e => { setPromptTestWindow(true) }}
                >
                  Test prompt {`>`}
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
        {promptTestWindow && custom && (
          <>
            <span className="h-[572px] ml-2.5 w-[1px] bg-neutral-300 rounded-lg block"></span>
            <div className=" flex flex-col justify-between text-lg font-semibold min-w-[220px] ml-[12px] ">
              <div className="w-full flex flex-col justify-between h-full">
                <div>
                  <Title className="flex flex-row items-center gap-2 mb-3">
                    <PlayIcon />
                    Prompt testing
                  </Title>
                  <Button className=" flex flex-row gap-2 text-xs w-full h-7 mb-4 ">
                    <Play2Icon />
                    Generate response
                  </Button>
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
                  <textarea placeholder="Test response will be displayed here." className="w-full h-[280px] overflow-y-scroll p-3 border-[#8d96b5] border-[1px] rounded-md outline-[#8d96b5] outline-2 text-sm font-normal " name="" id="" rows={10}></textarea>
                </div>
              </div>
              <Button
                className="mt-3 ml-auto bg-neutral-300 text-black w-max hover:bg-neutral-400"
                onClick={e => { setPromptTestWindow(false) }}
              >
                {`<`} Stop testing 
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
