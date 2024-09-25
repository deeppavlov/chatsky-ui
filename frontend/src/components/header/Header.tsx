import Code from "@/UI/Code"
import Dropdown, { DropdownGroupType } from "@/UI/Dropdown/Dropdown"
import { NotificationsContext } from "@/contexts/notificationsContext"
import { PopUpContext } from "@/contexts/popUpContext"
import { undoRedoContext } from "@/contexts/undoRedoContext"
import TelegramIcon from "@/icons/TelegramIcon"
import LaunchModal from "@/modals/LaunchModal"
import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip } from "@nextui-org/react"
import classNames from "classnames"
import { ChevronDownIcon, Github, InfoIcon, Link2, Redo, Save, Undo } from "lucide-react"
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
  const { openPopUp } = useContext(PopUpContext)
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
  const { flows, tab, saveFlows } = useContext(flowContext)
  const { undo, redo } = useContext(undoRedoContext)
  const { notification: n } = useContext(NotificationsContext)
  const flow = useMemo(() => flows.find((flow) => flow.name === tab), [flows, tab])
  const dropdownItems: DropdownGroupType[] = useMemo(() => {
    return [
      {
        items: [
          {
            label: "Launch in Telegram",
            value: "launch_telegram",
            className: "border !border-foreground font-semibold",
            icon: <TelegramIcon />,
            onClick: () => {
              openPopUp(
                <LaunchModal
                  id='telegram-launch-modal'
                  title={
                    <div className='flex items-center gap-1'>
                      <Link2 /> Bot setup
                    </div>
                  }
                  interface_description={
                    <div>
                      <p className='font-semibold'>Short startup tutorial:</p>
                      <ul className='*:text-sm'>
                        <li className='mt-2'>1. Open 'BotFather' bot in Telegram</li>
                        <li>
                          2. Enter <Code>/start</Code> command and then select <Code>/newbot</Code> in the opening message
                        </li>
                        <li>3. Enter your new bot's name</li>
                        <li>
                          4. After the bot is configured, copy its HTTP API key and paste it in the
                          form below
                        </li>
                      </ul>
                    </div>
                  }
                />,
                "telegram-launch-modal"
              )
            },
          },
          {
            label: "Undo",
            value: "undo",
            icon: <Undo strokeWidth={1.5} />,
            onClick: undo,
          },
          {
            label: "Redo",
            value: "redo",
            icon: <Redo strokeWidth={1.5} />,
            onClick: redo,
          },
        ],
      },
      {
        items: [
          {
            label: "Save skill",
            value: "save",
            icon: <Save strokeWidth={1.5} />,
            onClick: () => {
              try {
                saveFlows(flows)
                n.add({ message: "", title: "Saved", type: "success", timestamp: Date.now() })
              } catch (error) {
                console.log(error)
              }
            },
          },
        ]
      }
    ]
  }, [flows])

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
          </div>
        </Link>
      )}
      {location.pathname.includes("flow") && (
        <div className='flex items-center gap-1.5'>
          <div>
            <Dropdown
              groups={dropdownItems}
              onSelect={console.log}
              triggerContent={
                <div className='w-max px-3 h-10 flex items-center gap-2 bg-background group-data-[state=open]:bg-bg-secondary group-data-[state=open]:[&>svg]:rotate-180 rounded-lg border border-border cursor-pointer transition-colors duration-150 hover:bg-overlay'>
                  <p> Project menu </p>
                  <ChevronDownIcon className='size-5 stroke-1.5 transition-transform' />
                </div>
              }
            />
          </div>
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
