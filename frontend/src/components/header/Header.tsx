import { Button, Tooltip, useDisclosure } from "@nextui-org/react"
import classNames from "classnames"
import { useContext } from "react"
import { useLocation } from "react-router-dom"
import { flowContext } from "../../contexts/flowContext"
import { themeContext } from "../../contexts/themeContext"
import { workspaceContext } from "../../contexts/workspaceContext"
import GrabModeIcon from "../../icons/header/GrabModeIcon"
import GridModeIcon from "../../icons/header/GridModeIcon"
import ListViewIcon from "../../icons/header/ListViewIcon"
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
    managerMode,
    toggleManagerMode,
  } = useContext(workspaceContext)
  const { flows, tab } = useContext(flowContext)
  const flow = flows.find((flow) => flow.name === tab)
  const {
    isOpen: isSettingsModalOpen,
    onOpen: onOpenSettingsModal,
    onClose: onCloseSettingsModal,
  } = useDisclosure()

  return (
    <div
      data-testid='header'
      className='min-h-14 flex items-center justify-between w-screen z-10 bg-bg-secondary border-b border-border px-2 pr-4'>
      <div className='flex items-center gap-4 w-52'>
        <div className='flex items-center gap-1.5'>
          <Tooltip
            radius='sm'
            content={`Grab mode ${managerMode ? "on" : "off"}`}>
            <Button
              isIconOnly
              onClick={toggleManagerMode}
              className={classNames(
                "bg-overlay hover:bg-background border border-border rounded-small",
                !managerMode ? "bg-background border-border-darker" : ""
              )}>
              <GrabModeIcon />
            </Button>
          </Tooltip>
          <Tooltip
            radius='sm'
            content={`Free grid mode ${workspaceMode ? "on" : "off"}`}>
            <Button
              onClick={toggleWorkspaceMode}
              isIconOnly
              className={classNames(
                " bg-overlay hover:bg-background border border-border rounded-small",
                !workspaceMode ? "bg-background border-border-darker" : ""
              )}>
              <GridModeIcon />
            </Button>
          </Tooltip>
          <Tooltip
            radius='sm'
            content={`List mode ${nodesLayoutMode ? "on" : "off"}`}>
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
          </Tooltip>
        </div>
      </div>
      <div className='flex items-center'>
        {selectedNode && flow && location.pathname.includes("flow") && (
          <NodeInstruments flow={flow} />
        )}
      </div>
      <div className='flex items-center justify-start gap-1'>
        <BuildMenu />
        {/* <Button
          onClick={toggleTheme}
          isIconOnly
          className='header-service-btn'>
          {theme === "light" ? <Sun /> : <Moon />}
        </Button> */}
      </div>
    </div>
  )
}

export default Header
