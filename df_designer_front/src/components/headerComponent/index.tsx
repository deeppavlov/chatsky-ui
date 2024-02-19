import { Building, Cross, Home, MessageCircle, MoonIcon, Plus, SettingsIcon, SunIcon, Users2, Wrench, XIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import { Button } from "../ui/button";
import { TabsContext } from "../../contexts/tabsContext";
import AlertDropdown from "../../alerts/alertDropDown";
import { alertContext } from "../../contexts/alertContext";
import { darkContext } from "../../contexts/darkContext";
import { PopUpContext } from "../../contexts/popUpContext";
import { typesContext } from "../../contexts/typesContext";
import MenuBar from "./components/menuBar";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { USER_PROJECTS_HEADER } from "../../constants";
import { getRepoStars } from "../../controllers/API";
import { Separator } from "../ui/separator";
import { Bell } from "lucide-react";
import { ChatIcon } from "../../icons/ChatIcon/ChatIcon";
import { FlowType } from "../../types/flow";
import { NewLogo } from "../../icons/NewLogo";
import AddFlowModal from "../../modals/addFlowModal";
import SettingsModal from "../../modals/SettingsModal";
import { CursorIcon } from "../../icons/CursorIcon";
import { GrabberIcon } from "../../icons/GrabberIcon";
import { DoubleButton } from "../ui/double-button";
import { WorkSpaceModeIcon } from "../../icons/CanvaModeIcon";
import { NodesPlacementIcon } from "../../icons/NodesPlacementIcon";
import ShadTooltip from "../ShadTooltipComponent";
import { buildBotScript } from "../../controllers/API/build";
import BuildLoaderIcon from "../../icons/BuildLoaderIcon";
import BuildedCheckIcon from "../../icons/BuildedCheckIcon/BuildedCheckIcon";
import { buildContext } from "../../contexts/buildContext";
import { savedBuildType, savedRunType } from "../../types/entities";
import BuildButton from "../BuildMenuComponent/components/BuildButton";
import RunButton from "../BuildMenuComponent/components/RunButton";
import ConnectionStatusComponent from "../BuildMenuComponent/components/ConnectionStatusComponent";
import NewChatIcon from "../../icons/RunIcons/NewChatIcon";
import NewLogsIcon from "../../icons/RunIcons/NewLogsIcon";
import BuildMenu from "../BuildMenuComponent/BuildMenu";

export default function Header() {
  const { flows, addFlow, tabId, setTabId, removeFlow } = useContext(TabsContext);
  const { setDisableCopyPaste, disableCopyPaste, managerMode, setManagerMode, setFlowMode, flowMode } = useContext(TabsContext)
  const { openPopUp } = useContext(PopUpContext);
  const { templates } = useContext(typesContext);
  const { id } = useParams();
  const AlertWidth = 384;
  const { dark, setDark } = useContext(darkContext);
  const { notificationCenter, setNotificationCenter, setErrorData, setSuccessData } =
    useContext(alertContext);
  const location = useLocation();

  const [stars, setStars] = useState(null);
  const [workSpaceMode, setWorkSpaceMode] = useState(managerMode)
  const [nodesPlacement, setNodesPlacement] = useState(flowMode)

  const [buildMenu, setBuildMenu] = useState(false)
  

  const navigate = useNavigate()

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

  useEffect(() => {
    workSpaceModeHandler(managerMode)
  }, [managerMode])

  useEffect(() => {
    nodesPlacementHandler(flowMode)
  }, [flowMode])


  /**
   * 
   * @param bool =>
   * Nodes placement mode handler (Canva Mode or List Mode)
   */
  const nodesPlacementHandler = (bool: boolean) => {
    setNodesPlacement(bool)
    setFlowMode(bool)
  }


  /**
 * 
 * @param bool =>
 * WorkSpace mode handler (Edit Mode or Manager (no edit) Mode)
 */
  const workSpaceModeHandler = (bool: boolean) => {
    setWorkSpaceMode(bool)
    setManagerMode(bool)
  }

  // console.log(workSpaceMode, disableCopyPaste)

  const indexOfCurrFlow = flows.indexOf(flows.find(({ id }) => id == tabId))
  const currRefToDelete = (indexOfCurrFlow >= 0) ? (indexOfCurrFlow == 0 ? (flows.length > 1 ? `/flow/${flows[1].id}` : `/`) : `/flow/${flows[indexOfCurrFlow - 1].id}`) : `/`


  function deleteFlowOnTabHandler(flow: FlowType) {
    removeFlow(flow.id)
  }

  return (
    <div className="header-arrangement">
      <div className="header-start-display">
        <Link className="flex flex-row items-center justify-start font-semibold text-xl gap-2" to="/">
          <NewLogo />
          {window.location.pathname === '/' && "DF Designer"}
        </Link>
        {flows.findIndex((f) => tabId === f.id) !== -1 && tabId !== "" && (
          <MenuBar flows={flows} tabId={tabId} />
        )}
        {tabId !== '' && (
          <>
            <DoubleButton shadContent='Edit mode' setFunction={workSpaceModeHandler} isActive={workSpaceMode} First={CursorIcon} Second={GrabberIcon} />
            <DoubleButton shadContent='Node list' setFunction={nodesPlacementHandler} isActive={nodesPlacement} First={WorkSpaceModeIcon} Second={NodesPlacementIcon} />
          </>
        )}
        <div>

        </div>
      </div>

      <div className="header-end-division">
        <div className="header-end-display">
          <BuildMenu
            setBuildMenu={setBuildMenu}
            buildMenu={buildMenu}
          />
          <ShadTooltip side="bottom" content="Settings">
            <button onClick={e => openPopUp(<SettingsModal />)} className="extra-side-bar-save-disable">
              <SettingsIcon width={20} height={20} />
            </button>
          </ShadTooltip>
          <ShadTooltip side="bottom" content="Theme">
            <button
              className="extra-side-bar-save-disable"
              onClick={() => {
                setDark(!dark);
              }}
            >
              {dark ? (
                <SunIcon className="side-bar-button-size" />
              ) : (
                <MoonIcon className="side-bar-button-size" />
              )}
            </button>
          </ShadTooltip>
          <ShadTooltip side="bottom" content="Notifications" >
            <button
              className="extra-side-bar-save-disable relative"
              onClick={(event: React.MouseEvent<HTMLElement>) => {
                setNotificationCenter(false);
                const { top, left } = (
                  event.target as Element
                ).getBoundingClientRect();
                openPopUp(
                  <>
                    <div
                      className="absolute z-50"
                      style={{ top: top + 34, left: left - AlertWidth }}
                    >
                      <AlertDropdown />
                    </div>
                    <div className="header-notifications-box"></div>
                  </>
                );
              }}
            >
              {notificationCenter && (
                <div className="header-notifications"></div>
              )}
              <Bell className="side-bar-button-size" aria-hidden="true" />
            </button>
          </ShadTooltip>
        </div>
      </div>
    </div>
  );
}
