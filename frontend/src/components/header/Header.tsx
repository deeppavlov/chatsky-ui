import { NotificationsContext } from '@/contexts/notificationsContext'
import { undoRedoContext } from '@/contexts/undoRedoContext'
import Dropdown, { DropdownGroupType } from '@/UI/Dropdown/Dropdown'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@nextui-org/react'
import classNames from 'classnames'
import {
  ChevronDownIcon,
  Github,
  InfoIcon,
  Redo,
  Save,
  Undo,
} from 'lucide-react'
import { memo, useContext, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import { MetaContext } from '../../contexts/metaContext'
import { workspaceContext } from '../../contexts/workspaceContext'
import GrabModeIcon from '../../icons/header/GrabModeIcon'
import GridModeIcon from '../../icons/header/GridModeIcon'
import ListViewIcon from '../../icons/header/ListViewIcon'
import { Logo } from '../../icons/Logo'
import NodeInstruments from './components/NodeInstruments'

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
    currentTab,
  } = useContext(workspaceContext)
  const { flows, tab, saveFlows } = useContext(flowContext)
  const { undo, redo } = useContext(undoRedoContext)
  const { notification: n } = useContext(NotificationsContext)
  const flow = useMemo(
    () => flows.find((flow) => flow.name === tab),
    [flows, tab],
  )
  const dropdownItems: DropdownGroupType[] = useMemo(() => {
    return [
      {
        items: [
          {
            label: 'Undo',
            value: 'undo',
            icon: <Undo strokeWidth={1.5} />,
            onClick: undo,
          },
          {
            label: 'Redo',
            value: 'redo',
            icon: <Redo strokeWidth={1.5} />,
            onClick: redo,
          },
        ],
      },
      {
        items: [
          {
            label: 'Save skill',
            value: 'save',
            icon: <Save strokeWidth={1.5} />,
            onClick: () => {
              try {
                saveFlows(flows)
                n.add({
                  message: '',
                  title: 'Saved',
                  type: 'success',
                  timestamp: Date.now(),
                })
              } catch (error) {
                console.log(error)
              }
            },
          },
        ],
      },
    ]
  }, [flows])

  return (
    <div
      data-testid='header'
      className='z-10 flex min-h-14 w-screen items-center justify-between border-b border-border bg-bg-secondary px-2 pr-4'
    >
      {location.pathname.includes('app/home') && (
        <Link
          data-testid='logo-header'
          to={'/app/home'}
          className='z-10 flex cursor-pointer items-center gap-1'
        >
          <Logo />
          <div className='flex items-end justify-start gap-1'>
            <span className='flex text-lg font-bold'>Chatsky UI</span>
          </div>
        </Link>
      )}
      {location.pathname.includes('flow') && (
        <div className='flex items-center gap-1.5'>
          <div>
            <Dropdown
              groups={dropdownItems}
              onSelect={console.log}
              triggerContent={
                <div className='flex h-10 w-max cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 transition-colors duration-150 hover:bg-overlay group-data-[state=open]:bg-bg-secondary group-data-[state=open]:[&>svg]:rotate-180'>
                  <p> Project menu </p>
                  <ChevronDownIcon className='stroke-1.5 size-5 transition-transform' />
                </div>
              }
            />
          </div>
          {currentTab === 'edit' && (
            <div className='flex items-center gap-1.5'>
              <Tooltip
                radius='sm'
                content={`Grab mode ${managerMode ? 'on' : 'off'}`}
              >
                <Button
                  isIconOnly
                  onClick={toggleManagerMode}
                  className={classNames(
                    'rounded-small border border-border bg-background hover:bg-overlay',
                    managerMode ? 'border-border-darker bg-overlay' : '',
                  )}
                >
                  <GrabModeIcon />
                </Button>
              </Tooltip>
              <Tooltip
                radius='sm'
                content={`Free grid mode ${workspaceMode ? 'on' : 'off'}`}
              >
                <Button
                  onClick={toggleWorkspaceMode}
                  isIconOnly
                  className={classNames(
                    'rounded-small border border-border bg-background hover:bg-overlay',
                    workspaceMode ? 'border-border-darker bg-overlay' : '',
                  )}
                >
                  <GridModeIcon />
                </Button>
              </Tooltip>
              <Tooltip
                radius='sm'
                content={`List mode ${nodesLayoutMode ? 'on' : 'off'}`}
              >
                <Button
                  onClick={toggleNodesLayoutMode}
                  isIconOnly
                  className={classNames(
                    'rounded-small border border-border bg-background hover:bg-overlay',
                    nodesLayoutMode ? 'border-border-darker bg-overlay' : '',
                  )}
                >
                  <ListViewIcon />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      )}
      <div className='flex items-center'>
        {selectedNode &&
          flow &&
          location.pathname.includes('flow') &&
          currentTab === 'edit' && <NodeInstruments flow={flow} />}
      </div>
      <div className='flex items-center justify-start gap-1'>
        {location.pathname.includes('home') && (
          <Popover placement='left-end' radius='sm'>
            <PopoverTrigger>
              <Button
                className='border-[1px]'
                variant='ghost'
                radius='sm'
                isIconOnly
              >
                <InfoIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <h4 className='flex items-center justify-center gap-2 text-base'>
                <Logo className='h-4 w-4' />
                Chatsky UI
              </h4>
              <div className='mt-2 flex w-full flex-col items-start justify-start [&>p]:text-[12px]'>
                <p className='mb-1'>
                  <strong className='text-[14px]'>Version:</strong> {version}
                </p>
                <a
                  className='flex w-full items-center justify-center gap-1 rounded-lg border border-border p-1 transition-colors hover:border-node-selected'
                  href='https://github.com/deeppavlov/chatsky-ui'
                >
                  <Github className='h-4 w-4' />
                  <p className='text-[12px]'>GitHub</p>
                </a>
                <a
                  className='mb-1 mt-1 flex w-full items-center justify-center gap-1 rounded-lg border border-border p-1 transition-colors hover:border-node-selected'
                  href='https://deeppavlov.ai'
                >
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
