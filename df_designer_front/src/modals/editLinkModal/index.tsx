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
import { DropdownMenu } from "../../components/ui/dropdown-menu";
import { LinksListComponent } from "../../CustomNodes/GenericNode/components/linksListComponent";
import { EditConditionIcon } from "../../icons/EditConditionIcon";
import { EditLinkIcon } from "../../icons/EditLinkIcon";


export default function EditLinkModal({ data }: { data: NodeDataType }) {
  const { openPopUp, closePopUp } = useContext(PopUpContext)
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
  const { tabId, flows, saveFlow } = useContext(TabsContext)
  const { types } = useContext(typesContext);

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    data.node.links = data.node.links
    // console.log(data.node.links);
    saveFlow(savedFlow);
    closePopUp();
  }

  useEffect(() => { }, [closePopUp, data.node.template]);



  // const response = data.node.template?.response ? data.node.template?.response : null
  // const conditions = data.node.conditions?.length ? data.node.conditions : null
  // const pre_responses = data.node.pre_responses?.length ? data.node.pre_responses : null
  // const pre_transitions = data.node.pre_transitions?.length ? data.node.pre_transitions : null

  // console.log(conditions);

  // console.log(data);



  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[700px]">
        <DialogTitle className="flex items-center">
          <EditLinkIcon className="mr-1.5" />
          <span className="pr-2">Edit link</span>
          <Badge variant="secondary">ID: {data.id}</Badge>
        </DialogTitle>
        <div>

        </div>
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
          <div className="edit-node-modal-arrangement w-full">
            <LinksListComponent data={data} links={data.node.links} className='w-full' />
            {/* <div
              className={classNames(
                "edit-node-modal-box",
                nodeLength > limitScrollFieldsModal
                  ? "overflow-scroll overflow-x-hidden custom-scroll"
                  : "overflow-hidden",
              )}
            >
              {nodeLength >= 0 && (
                <div className="edit-node-modal-table">
                  <Table className="table-fixed bg-muted outline-1">
                    <TableHeader className="edit-node-modal-table-header">
                      <TableRow className="">
                        <TableHead className="h-7 text-center">PARAM</TableHead>
                        <TableHead className="h-7 p-0 text-center">
                          VALUE
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="p-0">
                      <TableCell className="truncate p-0 text-center text-sm text-foreground sm:px-3">
                        {data.node.links.map((link) => {
                          return (
                            <div> {link.name} </div>
                          )
                        })}
                      </TableCell>
                      <TableCell className="truncate p-0 text-center text-sm text-foreground sm:px-3">
                        {data.node.links.map((link) => {
                          return (
                            <select> {link.to} </select>
                          )
                        })}
                      </TableCell>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div> */}
          </div>
        </>
        <DialogFooter>
          <HelpBtn />
          <Button
            className="mt-3"
            onClick={handleClick}
            type="submit"
          >
            Save Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
