import React, { useContext } from "react"
import { Logo } from "../../icons/Logo"
import { Button, Tooltip, useDisclosure } from "@nextui-org/react"
import { BellRing, Moon, Settings, Sun } from "lucide-react"
import { themeContext } from "../../contexts/themeContext"
import BuildMenu from "./BuildMenu"
import { Link } from "react-router-dom"
import SettingsModal from "../../modals/SettingsModal/SettingsModal"
import { workspaceContext } from "../../contexts/workspaceContext"
import GridModeIcon from "../../icons/header/GridModeIcon"
import ListViewIcon from "../../icons/header/ListViewIcon"
import GrabModeIcon from "../../icons/header/GrabModeIcon"
import classNames from "classnames"
import { flowContext } from "../../contexts/flowContext"
import { NodeDataType, NodeType } from "../../types/NodeTypes"
import { Node, useReactFlow } from "reactflow"

const Header = () => {
  const { toggleTheme, theme } = useContext(themeContext)
  const {
    toggleWorkspaceMode,
    workspaceMode,
    toggleNodesLayoutMode,
    nodesLayoutMode,
    selectedNode,
    handleNodeFlags
  } = useContext(workspaceContext)
  const { flows, tab, updateFlow } = useContext(flowContext)
  const { setNodes } = useReactFlow()
  const flow = flows.find((flow) => flow.name === tab)
  const selectedNodeData: NodeDataType =
    flow?.data.nodes.find((node) => node.id === selectedNode)?.data ?? null
  const {
    isOpen: isSettingsModalOpen,
    onOpen: onOpenSettingsModal,
    onClose: onCloseSettingsModal,
  } = useDisclosure()
  

  return (
    <div className='min-h-14 flex items-center justify-between w-screen z-10 bg-bg-secondary border-b border-border px-2 pr-4'>
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
        {selectedNode && (
          <div className='flex items-center gap-1'>
            <Tooltip
              key={"header-button-set-start"}
              content='Select node as Start'
              radius='sm'>
              <Button
                onClick={e => handleNodeFlags(e, setNodes)}
                isIconOnly
                name='start'
                className={classNames(
                  "rounded-small bg-background border border-border hover:bg-overlay hover:border-border-darker",
                  selectedNodeData?.flags?.includes("start") && "bg-success hover:bg-success-50"
                )}>
                S
              </Button>
            </Tooltip>
            <Tooltip
              key={"header-button-set-fallback"}
              content='Select node as Fallback'
              radius='sm'>
              <Button
                onClick={e => handleNodeFlags(e, setNodes)}
                isIconOnly
                name='fallback'
                className={classNames(
                  "rounded-small bg-background border border-border hover:bg-overlay hover:border-border-darker",
                  selectedNodeData?.flags?.includes("fallback") && "bg-danger hover:bg-fallback-50"
                )}>
                F
              </Button>
            </Tooltip>
            <Tooltip
              key={"header-button-delete"}
              content='Delete node'
              color='danger'
              radius='sm'>
              <Button
                isIconOnly
                className='rounded-small bg-background border border-border hover:bg-danger hover:border-border-darker'>
                D
              </Button>
            </Tooltip>
          </div>
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
