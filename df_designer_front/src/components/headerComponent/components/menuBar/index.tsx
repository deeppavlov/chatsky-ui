import { useContext } from "react";
import { TabsContext } from "../../../../contexts/tabsContext";
import { PopUpContext } from "../../../../contexts/popUpContext";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  Undo,
  Redo,
  Settings2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../../ui/dropdown-menu";

import { alertContext } from "../../../../contexts/alertContext";
import { Link, useNavigate } from "react-router-dom";
import { undoRedoContext } from "../../../../contexts/undoRedoContext";
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import { Button } from "../../../ui/button";
import { XIcon } from "../../../../icons/XIcon/XIcon";

export const MenuBar = ({ flows, tabId }) => {
  const { updateFlow, setTabId, addFlow, removeFlow } = useContext(TabsContext);
  const { setErrorData } = useContext(alertContext);
  const { openPopUp } = useContext(PopUpContext);
  const { undo, redo } = useContext(undoRedoContext);


  const navigate = useNavigate();

  function handleAddFlow() {
    try {
      addFlow(null, true).then((id) => {
        navigate("/flow/" + id);
      });
      // saveFlowStyleInDataBase();
    } catch (err) {
      setErrorData(err);
    }
  }
  let current_flow = flows.find((flow) => flow.id === tabId);

  return (
    <div className="round-button-div">
      <Link to="/">
        <ChevronLeft className="w-4" />
      </Link>
      <div className="header-menu-bar">
        <span className="w-max header-menu-bar-fix">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="header-menu-bar-display border-0"
                variant="primary"
                size="sm"
              >
                <div className="header-menu-flow-name">{current_flow.name}</div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  undo();
                }}
                className="cursor-pointer"
              >
                <Undo className="header-menu-options " />
                Undo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  redo();
                }}
                className="cursor-pointer"
              >
                <Redo className="header-menu-options " />
                Redo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (tabId !== "GLOBAL") {
                    openPopUp(<FlowSettingsModal />);
                  } else {
                    setErrorData({title: "Oops!", list: ["You can't change GLOBAL flow settings!"]})
                  }
                }}
                className="cursor-pointer"
              >
                <Settings2 className="header-menu-options " />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </div>
    </div>
  );
};

export default MenuBar;
