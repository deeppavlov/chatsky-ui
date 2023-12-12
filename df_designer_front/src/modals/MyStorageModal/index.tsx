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


export default function MyStorageModal({ dataFilter }: { dataFilter: any }) {

  console.log(dataFilter)
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { types } = useContext(typesContext);
  const { tabId, flows, saveFlow } = useContext(TabsContext)
  const { dark, setDark } = useContext(darkContext)

  const fill = dark ? "white" : "black"


  const [presets, setPresets] = useState(JSON.parse(localStorage.getItem('presets')) ?? {})

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

  return (
      <Tabs.Root defaultValue="components">
        <Dialog open={true} onOpenChange={setModalOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className=" min-w-[640px] ">
            <DialogHeader>
              <DialogTitle className="flex flex-row items-center gap-2 text-2xl">
                <MyStorageIcon fill={fill} />
                My Storage
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-scroll max-h-[720px]">
              <Tabs.List className="storage-modal-tab-list">
                <Tabs.Trigger className="storage-modal-tab-trigger" value="components">My Components</Tabs.Trigger>
                <Tabs.Trigger className="storage-modal-tab-trigger" value="presets">My Presets</Tabs.Trigger>
              </Tabs.List>
              {/* <Tabs.Trigger value=""></Tabs.Trigger> */}
              <Tabs.Content value="components">
                My components
              </Tabs.Content>
              <Tabs.Content value="presets">
                <div className="flex flex-col items-start justify-start gap-2 mt-2">
                  {Object.values(presets).map((preset: any) => {
                    return (
                      <div className="flex flex-row items-center justify-between w-full" >
                        <div className="flex flex-row items-center justify-start gap-2">
                          <span className="w-4 h-4 block rounded " style={{ backgroundColor: preset.color }} ></span>
                          {preset.display_name}
                        </div>
                        <button onClick={e => {
                          if (confirm("Are you sure?")) {
                            deletePreset(preset.display_name)
                          }
                        }} className="bg-red-500 text-white p-2 rounded" > <Trash className="w-4 h-4" /> </button>
                      </div>
                    )
                  })}
                </div>
              </Tabs.Content>
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
  );
}
