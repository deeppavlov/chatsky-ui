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
  const [name, setName] = useState(flows.find((f) => f.id === tabId).name);
  const [description, setDescription] = useState(
    flows.find((f) => f.id === tabId).description,
  );
  const [color, setColor] = useState(flows.find((f) => f.id === tabId).color ? flows.find((f) => f.id === tabId).color : '')

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
          name={name}
          description={description}
          flows={flows}
          tabId={tabId}
          setName={setName}
          setDescription={setDescription}
          updateFlow={updateFlow}
          setColor={setColor}
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
                  flows.find((f) => f.id === tabId),
                  name,
                  description
                );
              else
                downloadFlow(
                  removeApiKeys(flows.find((f) => f.id === tabId)),
                  name,
                  description
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
