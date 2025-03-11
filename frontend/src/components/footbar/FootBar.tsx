import { Button, Popover, PopoverTrigger, Tab, Tabs, useDisclosure } from "@nextui-org/react"
import classNames from "classnames"
import { BellRing, EditIcon, Rocket, Settings } from "lucide-react"
import { Key, memo, useCallback, useContext, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { MetaContext } from "../../contexts/metaContext"
import { NotificationsContext } from "../../contexts/notificationsContext"
import { PageType, workspaceContext } from "../../contexts/workspaceContext"
import MonitorIcon from "../../icons/buildmenu/MonitorIcon"
import LocalStorageIcon from "../../icons/footbar/LocalStorageIcon"
import { Logo } from "../../icons/Logo"
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
  const { currentTab, setCurrentTab } = useContext(workspaceContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { notifications, notification } = useContext(NotificationsContext)

  const openNotifications = () => {
    setIsNotificationsOpen((prev) => !prev)
    notification.set((nots) => nots.map((n) => ({ ...n, isRead: true })))
  }

  const onSelectionChange = useCallback(
    (key: Key) => {
      const pageKey = key as PageType
      setCurrentTab(pageKey)
      setSearchParams({
        ...parseSearchParams(searchParams),
        page: pageKey,
      })
    },
    [searchParams, setSearchParams, setCurrentTab]
  )

  return (
    <div
      data-testid='footbar'
      className='h-12 px-2 bg-overlay border-t border-border absolute bottom-0 w-screen flex items-center justify-between'
    >
      <div className='absolute w-full flex items-center justify-center'>
        <Tabs
          onSelectionChange={onSelectionChange}
          defaultSelectedKey={currentTab}
          variant='light'
          className=''
          classNames={{
            cursor: "border border-foreground bg-background",
            tab: "w-32 h-9",
            panel: "p-0 m-0 w-0 h-0",
          }}
        >
          <Tab
            key={"edit"}
            title={
              <span className='flex items-center gap-2'>
                <EditIcon />
                Edit
              </span>
            }
          ></Tab>
          <Tab
            key={"deliver"}
            // isDisabled
            title={
              <span className='flex items-center gap-2'>
                <Rocket />
                Deliver
              </span>
            }
          ></Tab>
          <Tab
            key={"inspect"}
            title={
              <span className='flex items-center gap-2'>
                <MonitorIcon />
                Inspect
              </span>
            }
          ></Tab>
          <Tab
            key={"settings"}
            title={
              <span className='flex items-center gap-2'>
                <Settings />
                Settings
              </span>
            }
          ></Tab>
        </Tabs>
      </div>
      <Link
        data-testid='logo'
        to={"/app/home"}
        className='flex items-center gap-1 z-10 cursor-pointer'
      >
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
          )}
        >
          <LocalStorageIcon className='local-storage-button-hover:stroke-0' />
          Local storage
        </Button>
        <Popover
          placement='top-end'
          offset={30}
          isOpen={isNotificationsOpen}
          onOpenChange={openNotifications}
        >
          <PopoverTrigger>
            <Button
              isIconOnly
              className='rounded-small h-9 flex items-center bg-transparent justify-center border border-transparent hover:bg-background hover:border-foreground'
            >
              {notifications.filter((nt) => !nt.isRead).length > 0 && (
                <span className='absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center'>
                  {notifications.filter((nt) => !nt.isRead).length}
                </span>
              )}
              <BellRing className='w-5 h-5' />
            </Button>
          </PopoverTrigger>
          <NotificationsWindow isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} />
        </Popover>
      </div>
      <LocalStorage isOpen={isLocalStorageOpen} onClose={onLocalStorageClose} />
    </div>
  )
})

export default FootBar
