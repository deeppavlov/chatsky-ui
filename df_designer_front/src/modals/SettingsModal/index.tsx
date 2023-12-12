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
import { SettingsIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { HelpBtn } from "../../components/ui/helpbtn";
import { AppearanceIcon } from "../../icons/AppearanceIcon";
import { darkContext } from "../../contexts/darkContext";
import { LLM_cnd_icon } from "../../icons/LLMConditionIcon";
import { ThemeIcon } from "../../icons/ThemeIcon";
import { SettingsBlock } from "./components/SettingsBlock";
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


export default function SettingsModal() {
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { types } = useContext(typesContext);
  const { tabId, flows, saveFlow } = useContext(TabsContext)
  const { dark, setDark } = useContext(darkContext)

  const fill = dark ? "white" : "black"

  const langOptions = [
    { name: 'English', Icon: EnglishLangIcon },
    { name: 'Russian (soon...)', Icon: RussianLangIcon }
  ]

  const langOptionsJSX = langOptions.map((option: { name: string, Icon: Function }) => (
    <span className="flex flex-row items-center gap-2">
      {option.name}
      <option.Icon />
    </span>
  ))

  const [language, setLanguage] = useState(langOptionsJSX[0])

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

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className=" min-w-[640px] ">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2 text-2xl">
            <SettingsIcon />
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-scroll max-h-[720px]">
          <SettingsBlock
            Icon={AppearanceIcon}
            settings={[
              {
                title: "Theme",
                description: "This directory will contain files for indexing transitions, responses, etc.",
                Icon: ThemeIcon,
                children:
                  <div>
                    <label className="flex flex-row items-center gap-1" htmlFor="">
                      <span className={`${dark && 'text-neutral-400'}  flex flex-row items-center gap-1`}>
                        <LightThemeIcon fill={dark ? "grey" : "black"} />
                        Light
                      </span>
                      <ToggleShadComponent
                        className="mt-1 ml-1.5"
                        enabled={dark ? true : false}
                        setEnabled={(e) => { setDark(prev => !prev) }
                        }
                        disabled={false}
                        size="small" />
                      <span className={`${!dark && 'text-neutral-400'} flex flex-row items-center gap-1`}>
                        <DarkThemeIcon fill={dark ? "white" : "grey"} />
                        Dark
                      </span>
                    </label>
                  </div>
              },
              {
                title: "Language",
                description: "Your language settings.",
                Icon: LanguageIcon,
                children:
                  <div>
                    <Dropdown options={langOptionsJSX} value={language} onSelect={e => { setLanguage(e) }} />
                  </div>
              },
            ]}
            title="Appearance" />
          <SettingsBlock
            Icon={LLM_cnd_icon}
            title="Advanced"
            settings={[
              {
                title: "Indexing directory",
                description: "This directory will contain files for indexing transitions, responses, etc.",
                Icon: IndexingDirectoryIcon,
                children:
                  <div className="text-sm mt-1 bg-foreground text-background w-max py-0.5 px-3 rounded-lg">
                    In progress...
                  </div>
              },
              {
                title: "Personal access tokens",
                description: "Connect any LLM providers or services via API access tokens",
                Icon: AccessTokensIcon,
                children:
                  <div className="text-sm mt-1 bg-foreground text-background w-max py-1 px-3 rounded-lg">
                    In progress...
                  </div>
              },
            ]} />
        </div>
        <DialogFooter className="flex flex-row items-center justify-between">
          <HelpBtn className="" />
          <Button className="mt-3" onClick={handleClick}>
            Save settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
