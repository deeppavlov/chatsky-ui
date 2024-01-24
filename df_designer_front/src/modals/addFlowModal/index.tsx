import { useContext, useRef, useState } from "react";
import { alertContext } from "../../contexts/alertContext";
import { PopUpContext } from "../../contexts/popUpContext";
import { TabsContext } from "../../contexts/tabsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import EditFlowSettings from "../../components/EditFlowSettingsComponent";
import { PlusCircle } from "lucide-react";
import { FlowType } from "../../types/flow";
import { useNavigate } from "react-router-dom";

export default function AddFlowModal() {
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { setErrorData } = useContext(alertContext);
  const ref = useRef();
  const { flows, tabId, addFlow } =
    useContext(TabsContext);
  const maxLength = 50;

  const [flow, setFlow] = useState<FlowType>({
      name: '',
      description: '',
      color: '',
      data: null,
      id: ''
    })

  // const navigate = useNavigate()

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      setTimeout(() => {
        closePopUp();
      }, 20);
    }
  }

  function handleAddFlow() {
    if (flows.find((f) => (f.name == flow.name && f.id != tabId))) {
      setErrorData({ title: "Flow with same name already exists!" })
      return -1
    }
    try {
      addFlow(null, true, flow).then((id) => {
        // navigate("/flow/" + id);
      });
      // console.log(flows)
      // saveFlowStyleInDataBase();
    } catch (err) {
      setErrorData(err);
    } finally {
      closePopUp()
    }
  }

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="lg:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4 " />
            <span className=""> Add Flow </span>
          </DialogTitle>
          {/* <DialogDescription>  </DialogDescription> */}
        </DialogHeader>

        <EditFlowSettings
          currentFlow={flow}
          setCurrentFlow={setFlow}
        />

        <div className="flex flex-row items-center justify-end w-full">
          <Button onClick={handleAddFlow} type="submit">
            Create flow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
