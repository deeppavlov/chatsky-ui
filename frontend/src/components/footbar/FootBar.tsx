import { Tabs, TabsList, TabsTrigger } from '@/UI/Tabs'
import {
  Button,
  Popover,
  PopoverTrigger,
  useDisclosure,
} from '@nextui-org/react'
import classNames from 'classnames'
import { BellRing, EditIcon, Rocket, Settings } from 'lucide-react'
import { Key, memo, useCallback, useContext, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MetaContext } from '../../contexts/metaContext'
import { NotificationsContext } from '../../contexts/notificationsContext'
import { PageType } from '../../contexts/workspaceContext'
import MonitorIcon from '../../icons/buildmenu/MonitorIcon'
import LocalStorageIcon from '../../icons/footbar/LocalStorageIcon'
import { Logo } from '../../icons/Logo'
import LocalStorage from '../../modals/LocalStorage/LocalStorage'
import { parseSearchParams } from '../../utils'
import { NotificationsWindow } from '../notifications/NotificationsWindow'

const FootBar = memo(() => {
  const {
    isOpen: isLocalStorageOpen,
    onOpen: onLocalStorageOpen,
    onClose: onLocalStorageClose,
  } = useDisclosure()

  const { version } = useContext(MetaContext)
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
      setSearchParams({
        ...parseSearchParams(searchParams),
        page: pageKey,
      })
    },
    [searchParams, setSearchParams],
  )

  return (
    <div
      data-testid='footbar'
      className='absolute bottom-0 flex h-12 w-screen items-center justify-between border-t border-border bg-overlay px-2'
    >
      <div className='absolute flex w-full items-center justify-center'>
        <Tabs
          value={searchParams.get('page') || 'edit'}
          onValueChange={onSelectionChange}
        >
          <TabsList className='relative'>
            <TabsTrigger className='h-9 w-32 px-3' value='edit'>
              <EditIcon />
              Edit
            </TabsTrigger>
            <TabsTrigger className='h-9 w-32 px-3' value='deliver'>
              <Rocket />
              Deliver
            </TabsTrigger>
            <TabsTrigger className='h-9 w-32 px-3' value='inspect'>
              <MonitorIcon />
              Inspect
            </TabsTrigger>
            <TabsTrigger className='h-9 w-32 px-3' value='settings'>
              <Settings />
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Link
        data-testid='logo'
        to={'/app/home'}
        className='z-10 flex cursor-pointer items-center gap-1'
      >
        <Logo />
        <div className='flex items-end justify-start gap-1'>
          <span className='flex text-lg font-bold'>Chatsky UI</span>
          <span className='flex text-sm font-semibold text-neutral-400'>
            v {version}
          </span>
        </div>
      </Link>
      <div className='flex items-end gap-0.5'>
        <Button
          isDisabled
          onClick={onLocalStorageOpen}
          className={classNames(
            'local-storage-button flex h-9 cursor-pointer items-center justify-center gap-2 rounded-small border border-transparent bg-transparent px-2 hover:border-foreground hover:bg-background hover:text-foreground',
            isLocalStorageOpen && 'border-foreground bg-background',
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
              className='flex h-9 items-center justify-center rounded-small border border-transparent bg-transparent hover:border-foreground hover:bg-background'
            >
              {notifications.filter((nt) => !nt.isRead).length > 0 && (
                <span className='absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                  {notifications.filter((nt) => !nt.isRead).length}
                </span>
              )}
              <BellRing className='h-5 w-5' />
            </Button>
          </PopoverTrigger>
          <NotificationsWindow
            isOpen={isNotificationsOpen}
            setIsOpen={setIsNotificationsOpen}
          />
        </Popover>
      </div>
      <LocalStorage isOpen={isLocalStorageOpen} onClose={onLocalStorageClose} />
    </div>
  )
})

export default FootBar
