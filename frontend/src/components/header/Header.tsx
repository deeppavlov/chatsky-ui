import { Button, useDisclosure } from "@nextui-org/react"
import classNames from "classnames"
import { BellRing, Moon, Settings, Sun } from "lucide-react"
import { useContext } from "react"
import { useLocation } from "react-router-dom"
import { flowContext } from "../../contexts/flowContext"
import { themeContext } from "../../contexts/themeContext"
import { workspaceContext } from "../../contexts/workspaceContext"
import GrabModeIcon from "../../icons/header/GrabModeIcon"
import GridModeIcon from "../../icons/header/GridModeIcon"
import ListViewIcon from "../../icons/header/ListViewIcon"
import SettingsModal from "../../modals/SettingsModal/SettingsModal"
import BuildMenu from "./BuildMenu"
import NodeInstruments from "./components/NodeInstruments"

const Header = () => {
  const { toggleTheme, theme } = useContext(themeContext)
  const location = useLocation()
  const {
    toggleWorkspaceMode,
    workspaceMode,
    toggleNodesLayoutMode,
    nodesLayoutMode,
    selectedNode,
  } = useContext(workspaceContext)
  const { flows, tab } = useContext(flowContext)
  const flow = flows.find((flow) => flow.name === tab)
  const {
    isOpen: isSettingsModalOpen,
    onOpen: onOpenSettingsModal,
    onClose: onCloseSettingsModal,
  } = useDisclosure()
  

  return (
    <div data-testid="header" className='min-h-14 flex items-center justify-between w-screen z-10 bg-bg-secondary border-b border-border px-2 pr-4'>
      <div className='flex items-center gap-4 w-52'>
        <div className='flex items-center gap-1.5'>
          <Button
            isIconOnly
            className={classNames(
              " bg-overlay hover:bg-background border border-border rounded-small"
            )}>
            <GrabModeIcon />
          </Button>
          <Button
            onClick={toggleWorkspaceMode}
            isIconOnly
            className={classNames(
              " bg-overlay hover:bg-background border border-border rounded-small",
              !workspaceMode ? "bg-background border-border-darker" : ""
            )}>
            {/* {workspaceMode ? "Free mode" : "Fix mode"} */}
            <GridModeIcon />
          </Button>
          <Button
            onClick={toggleNodesLayoutMode}
            isIconOnly
            className={classNames(
              " bg-overlay hover:bg-background border border-border rounded-small",
              !nodesLayoutMode ? "bg-background border-border-darker" : ""
            )}>
            {/* {nodesLayoutMode ? "Canvas Mode" : "List mode"} */}
            <ListViewIcon />
          </Button>
        </div>
      </div>
      <div className='flex items-center'>
        {selectedNode && flow && location.pathname.includes('flow') && (
          <NodeInstruments flow={flow} />
        )}
      </div>
      <div className='flex items-center justify-start gap-1'>
        <BuildMenu />
        <Button
          onClick={onOpenSettingsModal}
          isIconOnly
          className='header-service-btn'>
          <Settings />
        </Button>
        <Button
          onClick={toggleTheme}
          isIconOnly
          className='header-service-btn'>
          {theme === "light" ? <Sun /> : <Moon />}
        </Button>
        <Button
          isIconOnly
          className='header-service-btn'>
          <BellRing />
        </Button>
      </div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={onCloseSettingsModal}
      />
    </div>
  )
}

export default Header
