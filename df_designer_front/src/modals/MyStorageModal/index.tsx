import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { NodeDataType } from "../../types/flow";
import { typesContext } from "../../contexts/typesContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { TabsContext } from "../../contexts/tabsContext";
import { SettingsIcon, Trash } from "lucide-react";
import { Button } from "../../components/ui/button";
import { HelpBtn } from "../../components/ui/helpbtn";
import { AppearanceIcon } from "../../icons/AppearanceIcon";
import { darkContext } from "../../contexts/darkContext";
import { LLM_cnd_icon } from "../../icons/LLMConditionIcon";
import { ThemeIcon } from "../../icons/ThemeIcon";
import { divide } from "lodash";
import { LanguageIcon } from "../../icons/LanguageIcon";
import { IndexingDirectoryIcon } from "../../icons/IndexingDirectoryIcon";
import { AccessTokensIcon } from "../../icons/AccessTokensIcon";
import ToggleShadComponent from "../../components/toggleShadComponent";
import { LightThemeIcon } from "../../icons/LightThemeIcon";
import { DarkThemeIcon } from "../../icons/DarkThemeIcon";
import { Select } from "@radix-ui/react-select";
import Dropdown from "../../components/dropdownComponent";
import { EnglishLangIcon } from "../../icons/EnLangIcon/Index";
import { RussianLangIcon } from "../../icons/RussianLangIcon";
import { MyStorageIcon } from "../../icons/MyStorageIcon";
import * as Tabs from "@radix-ui/react-tabs";
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import ComponentsIcon from "../../icons/MyStorageComponentsIcon";
import { MyStoragePresetsIcon } from "../../icons/MyStoragePresetsIcon";
import { Custom_cnd_icon } from "../../icons/CustomConditionIcon";
import AlertDelete from "../deleteModal";


export default function MyStorageModal({ dataFilter }: { dataFilter: any }) {

  console.log(dataFilter)
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { types } = useContext(typesContext);
  const { tabId, flows, saveFlow } = useContext(TabsContext)
  const { dark, setDark } = useContext(darkContext)

  const fill = dark ? "white" : "black"


  const [presets, setPresets] = useState(JSON.parse(localStorage.getItem('presets')) ?? {})

  const [deletedItem, setDeletedItem] = useState<any>()

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

  const deletePreset = (name: string) => {
    const filtered_presets = Object.entries(dataFilter.presets).filter((preset) => preset[0] !== name)
    const filtered_presets_localStorage = Object.entries(presets).filter((preset) => preset[0] !== name)
    const f = Object.fromEntries(filtered_presets)
    const f_localStorage = Object.fromEntries(filtered_presets_localStorage)
    localStorage.setItem('presets', JSON.stringify(f_localStorage))
    dataFilter.presets = f
    setPresets(f_localStorage)
  }

  const onDelete = () => {
    deletePreset(deletedItem.display_name)
    setDeletedItem(null)
  }

  // <button onClick={e => {
  //   if (confirm("Are you sure?")) {
  //     deletePreset(preset.display_name)
  //   }
  // }} className="bg-red-500 text-white p-2 rounded" >
  //   <Trash className="w-4 h-4" />
  // </button>

  return (
    <AlertDialog.Root>
      <Tabs.Root defaultValue="components">
        <Dialog open={true} onOpenChange={setModalOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className=" min-w-[840px] min-h-[480px] flex flex-col justify-between items-start ">
            <div className="flex flex-col items-start justify-start gap-4">
              <DialogHeader className=" flex flex-row items-center justify-start gap-8 ">
                <DialogTitle className="flex flex-row items-center gap-2 text-xl">
                  <MyStorageIcon fill={fill} />
                  My Storage
                </DialogTitle>
                <Tabs.List className="storage-modal-tab-list">
                  <Tabs.Trigger className="storage-modal-tab-trigger data-[state=active]:storage-modal-tab-trigger-active " value="components">
                    <ComponentsIcon />
                    Components
                  </Tabs.Trigger>
                  <Tabs.Trigger className="storage-modal-tab-trigger data-[state=active]:storage-modal-tab-trigger-active " value="conditions" >
                    <Custom_cnd_icon opacity="0.7" />
                    Conditions
                  </Tabs.Trigger>
                  <Tabs.Trigger className="storage-modal-tab-trigger data-[state=active]:storage-modal-tab-trigger-active " value="presets">
                    <MyStoragePresetsIcon />
                    Presets
                  </Tabs.Trigger>
                </Tabs.List>
              </DialogHeader>
              <div className="overflow-y-scroll max-h-[720px]">
                {/* <Tabs.Trigger value=""></Tabs.Trigger> */}
                <Tabs.Content value="components">
                  Components
                </Tabs.Content>
                <Tabs.Content value="conditions" >
                  Conditions
                </Tabs.Content>
                <Tabs.Content value="presets">
                  <div className="flex flex-col items-start justify-start gap-2 mt-2">
                    {Object.values(presets).map((preset: any) => {
                      return (
                        <div className="flex flex-row items-center justify-between gap-2 w-full" >
                          <div className="flex flex-row items-center justify-start gap-2">
                            <span className="w-4 h-4 block rounded " style={{ backgroundColor: preset.color }} ></span>
                            {preset.display_name}
                          </div>
                          <AlertDialog.Trigger
                            onClick={() => setDeletedItem(preset)}
                            className="bg-red-500 text-white p-2 rounded" >
                            <Trash className="w-4 h-4" />
                          </AlertDialog.Trigger>
                        </div>
                      )
                    })}
                  </div>
                </Tabs.Content>
              </div>
            </div>
            <DialogFooter className="flex flex-row items-center justify-between">
              <HelpBtn className="" />
              <Button className="mt-3" onClick={handleClick}>
                Close storage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs.Root>
      <AlertDelete onDelete={onDelete} />
    </AlertDialog.Root>
  );
}
