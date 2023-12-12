import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { NodeDataType } from "../../types/flow";
import { classNames, condition_actions, condition_intents, condition_llms, condition_variables, limitScrollFieldsModal, node_preresponses, node_pretransitions } from "../../utils";
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


export default function EditPreModal({ data, resp }: { data: NodeDataType, resp: boolean }) {
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
  const { types } = useContext(typesContext);
  const ref = useRef();
  const [enabled, setEnabled] = useState(null);
  const [custom, setCustom] = useState(false);
  const { tabId, flows, saveFlow } = useContext(TabsContext)

  if (nodeLength == 0) {
    closePopUp();
  }

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }

  useEffect(() => { }, [closePopUp, data.node.template]);

  const conditions = data.node.conditions.length ? data.node.conditions : null

  const [name, setName] = useState('')
  const [func, setFunc] = useState('')

  const [conditionsState, setConditionsState] = useState(conditions)

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    resp 
    ? data.node.pre_responses.push({name: name, func: func})
    : data.node.pre_transitions.push({name: name, func: func})
    saveFlow(savedFlow);
    closePopUp();
  }

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[700px]">
        <DialogHeader className="flex flex-row justify-between">
          <DialogTitle>
            <span className="flex flex-row items-center mb-2">
              <EditConditionIcon />
              <p className="ml-1">Edit Pre{resp ? 'responses' : 'transitions'} </p>
            </span>
            <Badge variant="secondary" > {data.id} </Badge>
          </DialogTitle>
        </DialogHeader>
        <div>
          <DialogDescription>
            <div className="flex pt-3">
              <span className="edit-node-modal-span">
                Preprocessing name
              </span>
            </div>
          </DialogDescription>
          <InputComponent onChange={e => { setName(e) }} password={false} value={name} className='mb-4' />
          <DialogDescription>
            <div className="flex pt-3">
              <span className="edit-node-modal-span">
                Function
              </span>
            </div>
          </DialogDescription>
          <div className="flex flex-row w-full">
            <span className="w-full">
              <Dropdown value={func} onSelect={e => setFunc(e)} options={resp ? node_preresponses : node_pretransitions} />
            </span>
            <Button className="bg-neutral-200 mt-1 mb-1 ml-1 w-[300px] h-[38px] text-black hover:bg-neutral-100 "> + Create new function </Button>
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
