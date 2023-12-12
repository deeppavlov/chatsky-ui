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
import { Check, PlusCircle, Settings2 } from "lucide-react";
import { updateFlowInDatabase } from "../../controllers/API";
import { FlowType } from "../../types/flow";
import { useNavigate } from "react-router-dom";
import InputComponent from "../../components/inputComponent";
import { NewPresetIcon } from "../../icons/NewPresetIcon";
import { darkContext } from "../../contexts/darkContext";
import { flow_colors } from "../../utils";

export default function AddPresetModal({ lastSelection }: { lastSelection: { nodes: any[], edges: any[] } }) {

  console.log(lastSelection)
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const { dark } = useContext(darkContext)
  const ref = useRef();
  const { flows, tabId, updateFlow, setTabsState, saveFlow, addFlow } =
    useContext(TabsContext);
  const maxLength = 50;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('')
  const [activeColor, setActiveColor] = useState('')

  const handleClick = () => {
    if (name && activeColor && lastSelection.nodes.length) {
      const preset = {
        ...lastSelection,
        color: activeColor,
        display_name: name,
        base_classes: ['samples']
      }

      const presets = localStorage.getItem('presets') ? JSON.parse(localStorage.getItem('presets')) : {}
      presets[name] = preset
      localStorage.setItem('presets', JSON.stringify(presets))
      closePopUp()
    } else {
      setErrorData({title: "Something went wrong! Please, fill in all fields!"})
    }
  }

  // const navigate = useNavigate()

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      setTimeout(() => {
        closePopUp();
      }, 20);
    }
  }


  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="lg:max-w-[720px]">
        <DialogHeader className="mb-3">
          <DialogTitle className="flex items-center">
            <NewPresetIcon fill={dark && "white"} className="mr-2 " />
            <span className=""> New Preset </span>
          </DialogTitle>
          <DialogDescription> Add your custom preset  </DialogDescription>
        </DialogHeader>
        <div>
          <label htmlFor="" className="text-sm block mb-2 "> Preset name </label>
          <InputComponent placeholder="Type name of your preset" value={name} onChange={setName} password={false} />
        </div>
        <div className="flex flex-row gap-4 mt-3">
          {flow_colors.map((color) => {
            return (
              <button key={color} onClick={e => { setActiveColor(color); }} style={{ backgroundColor: color }} className={` flex items-center justify-center w-10 h-10  border  ${activeColor == color && 'border-white scale-110'} rounded-full `}>
                {activeColor === color && <Check stroke="white" />}
              </button>
            )
          })}
        </div>
        <div className="flex flex-row items-center justify-end w-full">
          <Button onClick={handleClick} type="submit">
            Create preset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
