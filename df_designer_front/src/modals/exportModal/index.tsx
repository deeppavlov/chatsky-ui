import { useContext, useEffect, useRef, useState } from "react";
import { alertContext } from "../../contexts/alertContext";
import { PopUpContext } from "../../contexts/popUpContext";
import { TabsContext } from "../../contexts/tabsContext";
import { removeApiKeys } from "../../utils";
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
import { Checkbox } from "../../components/ui/checkbox";
import { EXPORT_DIALOG_SUBTITLE } from "../../constants";
import { Download } from "lucide-react";
import EditFlowSettings from "../../components/EditFlowSettingsComponent";
import { FlowType } from "../../types/flow";

export default function ExportModal() {
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const ref = useRef();
  const { setErrorData } = useContext(alertContext);
  const { flows, tabId, updateFlow, downloadFlow, saveFlow } =
    useContext(TabsContext);
  const [isMaxLength, setIsMaxLength] = useState(false);
  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      setTimeout(() => {
        closePopUp();
      }, 300);
    }
  }


  const [checked, setChecked] = useState(false);

  const [flow, setFlow] = useState<FlowType>(flows.find((f) => f.id === tabId))

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="h-[420px] lg:max-w-[600px] ">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="pr-2">Export</span>
            <Download
              strokeWidth={1.5}
              className="h-6 w-6 pl-1 text-foreground"
              aria-hidden="true"
            />
          </DialogTitle>
          <DialogDescription>{EXPORT_DIALOG_SUBTITLE}</DialogDescription>
        </DialogHeader>

        <EditFlowSettings
          currentFlow={flow}
          setCurrentFlow={setFlow}
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            onCheckedChange={(event: boolean) => {
              setChecked(event);
            }}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Save with my API keys
          </label>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              if (checked)
                downloadFlow(
                  flow,
                  flow.name,
                  flow.description
                );
              else
                downloadFlow(
                  removeApiKeys(flow),
                  flow.name,
                  flow.description
                );

              closePopUp();
            }}
            type="submit"
          >
            Download Flow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
