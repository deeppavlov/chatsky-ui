import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { FlowType, NodeDataType, NodeType } from "../../types/flow";
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
import { useNavigate } from "react-router-dom";
import { Checkbox } from "../../components/ui/checkbox";
import { FlowColorSVG } from "../../icons/FlowColorSVG";
import { GoToTargetIcon } from "../../icons/GoToTargetIcon";
import { darkContext } from "../../contexts/darkContext";
import { Link } from "../../icons/FormatTextIcons/Link";
import { EditLinkIcon } from "../../icons/EditLinkIcon";


export default function InputConditionsModal({ data, goToHandler }: { data: NodeDataType, goToHandler: Function }) {
  const { openPopUp } = useContext(PopUpContext)
  const [open, setOpen] = useState(true);
  const { dark } = useContext(darkContext)
  const { reactFlowInstance, setReactFlowInstance } =
    useContext(typesContext);
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
  const edges = reactFlowInstance.getEdges()
  const { closePopUp } = useContext(PopUpContext);
  // const navigate = useNavigate()
  const { tabId, flows, saveFlow } = useContext(TabsContext)
  const { types } = useContext(typesContext);
  const ref = useRef();
  const [enabled, setEnabled] = useState(null);
  const [quote, setQuote] = useState(false);
  const [inputLinks, setInputLinks] = useState(flows.filter((flow) => flow.data?.nodes?.find((node: NodeType) => node?.data?.node?.links?.find((link) => link.to == data.id))).map((flow) => {
    const sourceLinks = flow.data.nodes.filter((node: NodeType) => node.data.node.links?.find((link) => link.to == data.id))
    const p = sourceLinks.map((sourceLink) => flow.data.nodes.filter((node: NodeType) => node.id == edges.find((edge) => edge.target == sourceLink.id)?.source))
    const sourceNodes = sourceLinks.map((sourceLink: NodeType) => sourceLink.data.node.from_links)
    return { flow: flow.name, sourceLinks, sourceNodes }
  }))

  // if (nodeLength == 0) {
  //   closePopUp();
  // }

  const goToNodeHandler = (currFlow: FlowType, nodeID: string) => {
    // navigate(`/flow/${flows.find((flow) => currFlow.name == flow.name).id}`)
    // const width = window.innerWidth
    // const height = window.innerHeight
    const currNode: NodeType = currFlow.data.nodes.find((node) => node.data.id == nodeID)
    setTimeout(() => {
      const nodes = reactFlowInstance.getNodes()
      let node = nodes.find((node) => node.id == currNode.id)
      reactFlowInstance.fitBounds({ x: currNode.position.x, y: currNode.position.y, width: node.width, height: node.height })
      node.selected = true
    }, 50);
  }

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
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

  console.log(inputLinks)


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
          <span className="pr-2 flex flex-row items-center justify-center gap-2"> <EditLinkIcon fill={dark ? "white" : "black"} /> Links </span>
          <Badge variant="secondary">ID: {data.id}</Badge>
        </DialogTitle>
        <label htmlFor="">
          <span className="text-neutral-400 text-sm"> Connected to <span className="text-condition-default"> {data.node.display_name} </span> </span>
        </label>
        <div className="max-h-[640px] overflow-y-scroll">
          {inputLinks.map((inputLink) => (
            <div key={inputLink.flow} className="mb-4">
              <h5 className="font-bold mb-2 flex flex-row items-center gap-2">
                <FlowColorSVG fill={flows.find((flow) => flow.name == inputLink.flow).color} />
                {inputLink.flow}
              </h5>
              {inputLink.sourceLinks.map((sourceLink: NodeType, idx) => (
                <div key={sourceLink.id} className="bg-muted border-[1px] border-border rounded-xl">
                  <Table className="w-full">
                    <TableHeader className="w-full">
                      <TableRow className="">
                        <TableCell className="px-3 py-3"></TableCell>
                        <TableCell className="px-3 py-3 w-20"> Link ID </TableCell>
                        <TableCell className="px-3 py-3 w-52"> Node </TableCell>
                        <TableCell className="px-3 py-3 w-48"> Condition </TableCell>
                        <TableCell className="px-3 py-3"> Actions </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="w-full">
                      {inputLink.sourceNodes[idx].map((sourceNode, idx) => (
                        <TableRow key={`${sourceNode.condition}${idx}`}>
                          <TableCell className="px-3 py-3"> <Checkbox /> </TableCell>
                          <TableCell className="px-3 font-semibold py-3 w-20"> {sourceLink.id} </TableCell>
                          <TableCell className="px-3 py-3 w-52"> {flows.find((flow) => flow.name == inputLink.flow).data.nodes.find((node: NodeType) => node.data.id == sourceNode.node).data.node.display_name} </TableCell>
                          <TableCell className="px-3 py-3 w-48"> {sourceNode.condition}</TableCell>
                          <TableCell className="px-3"> <button className="w-max flex flex-row items-center justify-center" onClick={e => { closePopUp(); goToHandler(flows.find((flow) => flow.name == inputLink.flow), sourceNode.node) }}> <GoToTargetIcon fill={dark ? 'white' : "black"} /> </button> </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ))}
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
    </Dialog >
  );
}
