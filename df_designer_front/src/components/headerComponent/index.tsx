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
  const { builded, setBuilded, connectionStatus, setConnectionStatus } = useContext(buildContext)
  const [buildPending, setBuildPending] = useState(false)

  const buildBotHandler = async () => {
    if (!builded) {
      setBuildPending(true)
      setBuilded(false)
      try {
        setTimeout(async () => {
          const buildStatus = await buildBotScript()
          if (!buildStatus) {
            setErrorData({ title: 'Build failed!' })
            throw Error('Build failed')
          } else {
            setBuilded(true)
            setSuccessData({ title: 'Bot was successfully builded!' })
          }
          setBuildPending(false)
        }, 2000);
      } catch (error) {
        console.log(error)
      }
    } else if (builded) {
      setBuilded(false)
      setConnectionStatus('broken')
    }
  }

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



  const nodesPlacementHandler = (bool: boolean) => {
    setNodesPlacement(bool)
    setFlowMode(bool)
  }

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
          <ShadTooltip side="bottom" content="Build">
            <button onClick={buildBotHandler} className={`extra-side-bar-save-disable relative flex flex-col items-center justify-center`}>
              {!buildPending && <Wrench className="side-bar-button-size" />}
              {buildPending && <BuildLoaderIcon className="side-bar-button-size build-loader" />}
              {builded && <BuildedCheckIcon className="side-bar-button-size builded-check" />}
              {!builded && connectionStatus === 'closed' && <Plus stroke="#f00" className="side-bar-button-size builded-check rotate-45" />}
              {connectionStatus !== 'closed' && connectionStatus !== 'not open' && <span style={{ backgroundColor: connectionStatus === 'alive' ? '#0C9' : '#f00' }} className="absolute rounded-full -top-0 -left-0 w-2 h-2" />}
              {/* <ChatIcon opacity="0.7" className="side-bar-button-size" fill={dark ? 'white' : 'black'} /> */}
            </button>
          </ShadTooltip>
        </div>
      </div>
    </div>
  );
}
