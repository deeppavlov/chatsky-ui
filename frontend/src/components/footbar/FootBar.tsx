import { Button, Popover, PopoverTrigger, Tab, Tabs, useDisclosure } from "@nextui-org/react"
import classNames from "classnames"
import { BellRing, EditIcon, Rocket, Settings } from "lucide-react"
import { Key, memo, useCallback, useContext, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { buildContext } from "../../contexts/buildContext"
import { MetaContext } from "../../contexts/metaContext"
import { notificationsContext } from "../../contexts/notificationsContext"
import { workspaceContext } from "../../contexts/workspaceContext"
import { Logo } from "../../icons/Logo"
import MonitorIcon from "../../icons/buildmenu/MonitorIcon"
import LocalStorageIcon from "../../icons/footbar/LocalStorageIcon"
import LocalStorage from "../../modals/LocalStorage/LocalStorage"
import { parseSearchParams } from "../../utils"
import { NotificationsWindow } from "../notifications/NotificationsWindow"

const FootBar = memo(() => {
  const {
    isOpen: isLocalStorageOpen,
    onOpen: onLocalStorageOpen,
    onClose: onLocalStorageClose,
  } = useDisclosure()

  const { version } = useContext(MetaContext)
  const { settingsPage, setSettingsPage } = useContext(workspaceContext)
  const { logsPage, setLogsPage } = useContext(buildContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { notifications } = useContext(notificationsContext)

  const onSelectionChange = useCallback(
    (key: Key) => {
      if (key === "Inspect") {
        setLogsPage(true)
        setSettingsPage(false)
        setSearchParams({
          ...parseSearchParams(searchParams),
          logs_page: "opened",
          settings: "closed",
        })
      } else if (key === "Settings") {
        setLogsPage(false)
        setSettingsPage(true)
        setSearchParams({
          ...parseSearchParams(searchParams),
          logs_page: "closed",
          settings: "opened",
        })
      } else {
        setSearchParams({
          ...parseSearchParams(searchParams),
          logs_page: "closed",
          settings: "closed",
        })
        setSettingsPage(false)
        setLogsPage(false)
      }
    },
    [searchParams, setLogsPage, setSearchParams, setSettingsPage]
  )

  const findDefaultSelectedKey = useCallback(() => {
    if (settingsPage) {
      return "Settings"
    } else if (logsPage) {
      return "Inspect"
    } else {
      return "Edit"
    }
  }, [logsPage, settingsPage])

  return (
    <div
      data-testid='footbar'
      className='h-12 px-2 bg-overlay border-t border-border absolute bottom-0 w-screen flex items-center justify-between'>
      <div className='absolute w-full flex items-center justify-center'>
        <Tabs
          onSelectionChange={onSelectionChange}
          defaultSelectedKey={findDefaultSelectedKey()}
          variant='light'
          className=''
          classNames={{
            cursor: "border border-foreground bg-background",
            tab: "w-32 h-9",
            panel: "p-0 m-0 w-0 h-0",
          }}>
          <Tab
            key={"Edit"}
            title={
              <span className='flex items-center gap-2'>
                <EditIcon />
                Edit
              </span>
            }></Tab>
          <Tab
            key={"Deliver"}
            isDisabled
            title={
              <span className='flex items-center gap-2'>
                <Rocket />
                Deliver
              </span>
            }></Tab>
          <Tab
            key={"Inspect"}
            title={
              <span className='flex items-center gap-2'>
                <MonitorIcon />
                Inspect
              </span>
            }>
          </Tab>
          <Tab
            key={"Settings"}
            title={
              <span className='flex items-center gap-2'>
                <Settings />
                Settings
              </span>
            }>
          </Tab>
        </Tabs>
      </div>
      <Link
        data-testid='logo'
        to={"/app/home"}
        className='flex items-center gap-1 z-10 cursor-pointer'>
        <Logo />
        <div className='flex items-end justify-start gap-1'>
          <span className='flex font-bold text-lg'>Chatsky UI</span>
          <span className='flex font-semibold text-neutral-400 text-sm'>v {version}</span>
        </div>
      </Link>
      <div className='flex items-end gap-0.5'>
        <Button
          isDisabled
          onClick={onLocalStorageOpen}
          className={classNames(
            "local-storage-button px-2 cursor-pointer rounded-small h-9 flex items-center bg-transparent justify-center gap-2 border border-transparent hover:bg-background hover:border-foreground hover:text-foreground",
            isLocalStorageOpen && "bg-background border-foreground"
          )}>
          <LocalStorageIcon className='local-storage-button-hover:stroke-0' />
          Local storage
        </Button>
        <Popover
          placement='top-end'
          offset={30}
          isOpen={isNotificationsOpen}
          onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger>
            <Button
              isIconOnly
              className='rounded-small h-9 flex items-center bg-transparent justify-center border border-transparent hover:bg-background hover:border-foreground'>
              {notifications.filter((nt) => ["error", "warning"].includes(nt.type)).length > 0 && (
                <span className='absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center'>
                  {notifications.filter((nt) => ["error", "warning"].includes(nt.type)).length}
                </span>
              )}
              <BellRing className='w-5 h-5' />
            </Button>
          </PopoverTrigger>
          <NotificationsWindow
            isOpen={isNotificationsOpen}
            setIsOpen={setIsNotificationsOpen}
          />
        </Popover>
      </div>
      <LocalStorage
        isOpen={isLocalStorageOpen}
        onClose={onLocalStorageClose}
      />
    </div>
  )
})

export default FootBar
