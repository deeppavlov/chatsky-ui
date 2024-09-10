import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip } from "@nextui-org/react"
import classNames from "classnames"
import { Github, InfoIcon } from "lucide-react"
import { memo, useContext, useMemo } from "react"
import { Link, useLocation } from "react-router-dom"
import { flowContext } from "../../contexts/flowContext"
import { MetaContext } from "../../contexts/metaContext"
import { workspaceContext } from "../../contexts/workspaceContext"
import { Logo } from "../../icons/Logo"
import GrabModeIcon from "../../icons/header/GrabModeIcon"
import GridModeIcon from "../../icons/header/GridModeIcon"
import ListViewIcon from "../../icons/header/ListViewIcon"
import BuildMenu from "./BuildMenu"
import NodeInstruments from "./components/NodeInstruments"

const Header = memo(() => {
  const { version } = useContext(MetaContext)
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
  const flow = useMemo(() => flows.find((flow) => flow.name === tab), [flows, tab])

  return (
    <div
      data-testid='header'
      className='min-h-14 flex items-center justify-between w-screen z-10 bg-bg-secondary border-b border-border px-2 pr-4'>
      {location.pathname.includes("app/home") && (
        <Link
          data-testid='logo-header'
          to={"/app/home"}
          className='flex items-center gap-1 z-10 cursor-pointer'>
          <Logo />
          <div className='flex items-end justify-start gap-1'>
            <span className='flex font-bold text-lg'>Chatsky UI</span>
            {/* <span className='flex font-semibold text-neutral-400 text-sm'>v {version}</span> */}
          </div>
        </Link>
      )}
      {location.pathname.includes("flow") && (
        <div className='flex items-center gap-4 w-52'>
          <div className='flex items-center gap-1.5'>
            <Tooltip
              radius='sm'
              content={`Grab mode ${managerMode ? "on" : "off"}`}>
              <Button
                isIconOnly
                onClick={toggleManagerMode}
                className={classNames(
                  " bg-background hover:bg-overlay border border-border rounded-small",
                  managerMode ? "bg-overlay border-border-darker" : ""
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
                  " bg-background hover:bg-overlay border border-border rounded-small",
                  workspaceMode ? "bg-overlay border-border-darker" : ""
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
                  " bg-background hover:bg-overlay border border-border rounded-small",
                  nodesLayoutMode ? "bg-overlay border-border-darker" : ""
                )}>
                {/* {nodesLayoutMode ? "Canvas Mode" : "List mode"} */}
                <ListViewIcon />
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
      <div className='flex items-center'>
        {selectedNode && flow && location.pathname.includes("flow") && (
          <NodeInstruments flow={flow} />
        )}
      </div>
      <div className='flex items-center justify-start gap-1'>
        {location.pathname.includes("flow") && <BuildMenu />}
        {location.pathname.includes("home") && (
          <Popover
            placement='left-end'
            radius='sm'>
            <PopoverTrigger>
              <Button
                className='border-[1px]'
                variant='ghost'
                radius='sm'
                isIconOnly>
                <InfoIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <h4 className='text-base flex items-center justify-center gap-2'>
                <Logo className='w-4 h-4' />
                Chatsky UI
              </h4>
              <div className='w-full mt-2 [&>p]:text-[12px] flex flex-col items-start justify-start '>
                <p className='mb-1'>
                  <strong className='text-[14px]'>Version:</strong> {version}
                </p>
                <a
                  className='w-full flex items-center justify-center gap-1 rounded-lg border p-1 border-border transition-colors hover:border-node-selected'
                  href='https://github.com/deeppavlov/chatsky-ui'>
                  <Github className='w-4 h-4' />
                  <p className='text-[12px]'>GitHub</p>
                </a>
                <a
                  className='w-full flex items-center justify-center gap-1 rounded-lg border p-1 border-border transition-colors hover:border-node-selected mt-1 mb-1'
                  href='https://deeppavlov.ai'>
                  <p className='text-[12px]'>DeepPavlov.ai</p>
                </a>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
})

export default Header
