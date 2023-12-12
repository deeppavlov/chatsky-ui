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
import { APITemplateType } from "../../types/api";


export default function EditLLMPromptModal({ data, template }: { data: NodeDataType, template: APITemplateType | any  }) {
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
  const [prompt, setPrompt] = useState(template.value)
  if (nodeLength == 0) {
    closePopUp();
  }

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    template.value = prompt
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


  // const response = data.node.template?.response ? data.node.template?.response : null
  // const conditions = data.node.conditions?.length ? data.node.conditions : null
  // const pre_responses = data.node.pre_responses?.length ? data.node.pre_responses : null
  // const pre_transitions = data.node.pre_transitions?.length ? data.node.pre_transitions : null

  // // console.log(conditions);

  // const [conditionsState, setConditionsState] = useState(conditions ? conditions : [])

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[700px]">
        <DialogTitle className="flex items-center">
          <span className="pr-2">{data.type}</span>
          <Badge variant="secondary">ID: {data.id}</Badge>
        </DialogTitle>
        <label htmlFor="">
          <span className="text-neutral-400 text-sm"> Prompt </span>
          <textarea defaultValue={prompt} onChange={e => setPrompt(e.target.value)} name="prompt" id="condition_prompt" className="w-full rounded-lg mt-1 cond-textarea" rows={10}></textarea>
        </label>
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
