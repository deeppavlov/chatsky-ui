import { useContext, useRef, useState } from "react";
import { alertContext } from "../../contexts/alertContext";
import { PopUpContext } from "../../contexts/popUpContext";
import { TabsContext } from "../../contexts/tabsContext";
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
import { SETTINGS_DIALOG_SUBTITLE } from "../../constants";
import EditFlowSettings from "../../components/EditFlowSettingsComponent";
import { SeparatorVertical, Settings2 } from "lucide-react";
import { updateFlowInDatabase } from "../../controllers/API";
import { FlowColorSVG } from "../../icons/FlowColorSVG";
import { CheckSVG } from "../../icons/CheckSVG";
import { Link } from "react-router-dom";
import { darkContext } from "../../contexts/darkContext";
import { Separator } from "../../components/ui/separator";
import { typesContext } from "../../contexts/typesContext";

export default function FlowSettingsModal() {
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const { reactFlowInstance } = useContext(typesContext)
  const { dark } = useContext(darkContext)
  const ref = useRef();
  const { flows, tabId, setTabId, updateFlow, setTabsState, saveFlow } =
    useContext(TabsContext);
  const maxLength = 50;
  const [name, setName] = useState(flows.find((f) => f.id === tabId).name);
  const [description, setDescription] = useState(
    flows.find((f) => f.id === tabId).description,
  );
  const [color, setColor] = useState(flows.find((f) => f.id === tabId).color ? flows.find((f) => f.id === tabId).color : '')
  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      setTimeout(() => {
        closePopUp();
      }, 20);
    }
  }
  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    if (flows.find((f) => (f.name == name && f.id != tabId))) {
      setErrorData({ title: "Flow with same name already exists!" })
      return -1
    }
    savedFlow.name = name;
    savedFlow.description = description;
    savedFlow.color = color
    saveFlow(savedFlow);
    setSuccessData({ title: "Changes saved successfully" });
    closePopUp();
  }
  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className=" flex flex-row items-start justify-start lg:min-w-[780px] ">
        <div className=" flex flex-col items-start justify-start w-48 h-full ">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="pr-2"> Flow settings </span>
              <Settings2 className="mr-2 h-4 w-4 " />
            </DialogTitle>
          </DialogHeader>
          <div className=" mt-4 w-full ">
            {flows.map((flow, i) => {
              const active = (flow.id == tabId)
              return (
                <div key={flow.id} className="relative h-max w-full ">
                  <div className="block relative w-full">
                    <div
                      key={flow.id}
                      // to={`/flow/${flow.id}`}
                      onClick={e => {
                        // setTabId(flow.id)
                      }}
                      className={`w-full ${flow.id == tabId && 'bg-muted'} ${flow.id != 'GLOBAL' ? 'pl-4' : 'pl-1'} py-1.5 px-3 flex flex-row items-center justify-between text-sm bg-background rounded-lg `}>
                      <div className={`flex flex-row items-center relative `}>
                        {flow.id !== "GLOBAL" && i !== flows.length - 1 && <span className="block absolute w-1 h-[1px] bg-neutral-300"></span>}
                        {i === flows.length - 1 && (
                          <svg className="-rotate-90 absolute -left-[1.5px] top-[7px] " xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                            <path d="M0.5 5C0.5 5.27614 0.723858 5.5 1 5.5C1.27614 5.5 1.5 5.27614 1.5 5H0.5ZM5 1.5H5.5V0.5H5V1.5ZM1.5 5V3H0.5V5H1.5ZM3 1.5H5V0.5H3V1.5ZM1.5 3C1.5 2.17157 2.17157 1.5 3 1.5V0.5C1.61929 0.5 0.5 1.61929 0.5 3H1.5Z" fill="#D4D4D4" />
                          </svg>
                        )}
                        <FlowColorSVG fill={flow.color} />
                        <span className={`ml-3 ${flow.id === 'GLOBAL' && 'text-neutral-500'} `}> {flow.name} </span>
                      </div>
                      <div className="flex flex-row gap-2">
                        {active && <CheckSVG fill={dark ? "white" : "black"} />}
                      </div>
                    </div>
                  </div>
                  {flow.id == "GLOBAL" && (
                    <span style={{ height: `${flows.length * 36 - 55}px`, zIndex: 99 }} className={`block absolute w-[1px] bg-neutral-300 z-10 left-[15px] rounded-lg `}> </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        {/* <span className="min-h-[320px] max-h-full mx-2.5 w-[1px] bg-border rounded-lg block"></span> */}
        <div className=" w-full h-full flex-col flex justify-between border-l border-border pl-6 ">
          <EditFlowSettings
            name={name}
            description={description}
            flows={flows}
            tabId={tabId}
            setName={setName}
            setDescription={setDescription}
            setColor={setColor}
            updateFlow={updateFlow}
          />

          <div className=" flex flex-row items-center justify-end mt-8 ">
            <Button onClick={handleClick} type="submit">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
