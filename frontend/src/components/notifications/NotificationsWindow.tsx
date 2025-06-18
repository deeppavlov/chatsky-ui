import Switch from '@/UI/Switch'
import { Tooltip } from '@/UI/Tooltip'
import {
  Button,
  PopoverContent,
  Select,
  SelectItem,
  SelectSection,
} from '@nextui-org/react'
import {
  AlertOctagon,
  AlertTriangle,
  BugIcon,
  CheckCircle2,
  InfoIcon,
  Trash,
} from 'lucide-react'
import { useContext, useState } from 'react'
import { NotificationsContext } from '../../contexts/notificationsContext'
import NotificationComponent from './components/NotificationComponent'

type NotificationsWindowProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const NotificationsWindow = ({
  setIsOpen,
}: NotificationsWindowProps) => {
  const { notifications, notification, setPopupsDisabled, popupsDisabled } =
    useContext(NotificationsContext)
  const [notificationFilter, setNotificationFilter] = useState<string[]>([])

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '') {
      setNotificationFilter([])
    } else {
      setNotificationFilter([...e.target.value.split(',')])
    }
  }

  const renderNotifications = () => {
    const filtered_notifications = notifications.filter(
      (not) =>
        notificationFilter.includes(not.type) ||
        notificationFilter.length === 0,
    )

    const time_sorted_notifications = filtered_notifications.sort(
      (a, b) => a.timestamp - b.timestamp,
    )
    const stack_checked_notifications = time_sorted_notifications.map(
      (not, idx, nots) => {
        const stack = not.stack + 1
        const next_not = nots[idx + 1]
        if (
          next_not &&
          not &&
          next_not.title === not.title &&
          not.stack !== 0
        ) {
          next_not.stack = stack
          not.stack = 0
        }
        return not
      },
    )
    const stack_filtered_notifications = stack_checked_notifications.filter(
      (not) => not.stack > 0,
    )
    if (stack_filtered_notifications.length === 0) {
      return (
        <>
          <p className='text-sm text-neutral-400'>No notifications yet</p>
        </>
      )
    }
    return stack_filtered_notifications
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((notification) => (
        <NotificationComponent
          key={notification.timestamp}
          notification={notification}
        />
      ))
  }

  const clearNotificationsHandler = () => {
    notification.clear()
    setIsOpen(false)
  }

  return (
    <PopoverContent className='w-[480px] px-4 pb-4 pt-3'>
      <div className='mb-2 flex w-full items-center justify-between'>
        <div className='flex items-center justify-start gap-3'>
          <Tooltip
            sideOffset={8}
            content={popupsDisabled ? 'Enable pop-ups' : 'Disable pop-ups'}
          >
            <Switch
              onChange={() => {
                setPopupsDisabled((prev) => !prev)
              }}
              checked={!popupsDisabled}
            />
          </Tooltip>
          <h1 className='text-medium font-medium'>Notifications</h1>
        </div>
        <div className='flex w-2/5 items-center justify-end gap-2'>
          <Select
            classNames={{
              trigger: 'min-h-8 h-8 border-[1px]',
            }}
            size='sm'
            selectionMode='multiple'
            variant='bordered'
            selectedKeys={notificationFilter}
            label=''
            aria-label='Notification filter'
            labelPlacement='inside'
            placeholder='Filter'
            radius='sm'
            onChange={handleSelectionChange}
          >
            <SelectSection
              aria-label='Notification filter base group'
              title={'Base'}
            >
              <SelectItem
                startContent={
                  <AlertOctagon className='h-4 w-4 stroke-red-500' />
                }
                key={'error'}
                aria-label='Error filter'
              >
                Error
              </SelectItem>
              <SelectItem
                startContent={
                  <AlertTriangle className='h-4 w-4 stroke-yellow-500' />
                }
                aria-label='Warning filter'
                key={'warning'}
              >
                Warning
              </SelectItem>
              <SelectItem
                startContent={<InfoIcon className='h-4 w-4 stroke-blue-500' />}
                aria-label='Info filter'
                key={'info'}
              >
                Info
              </SelectItem>
              <SelectItem
                startContent={
                  <CheckCircle2 className='h-4 w-4 stroke-green-500' />
                }
                aria-label='Success filter'
                key={'success'}
              >
                Success
              </SelectItem>
            </SelectSection>
            <SelectSection
              aria-label='Notification filter debug group'
              title={'Debug'}
            >
              <SelectItem
                startContent={
                  <BugIcon className='h-4 w-4 stroke-neutral-500' />
                }
                aria-label='Debug filter'
                key={'debug'}
              >
                Debug
              </SelectItem>
            </SelectSection>
          </Select>
          <Tooltip
            align='end'
            alignOffset={-16}
            sideOffset={8}
            content='Clear notifications'
          >
            <Button
              onClick={clearNotificationsHandler}
              variant='light'
              size='sm'
              isIconOnly
            >
              <Trash />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className='flex h-[50vh] max-h-[50vh] w-full flex-col items-start justify-start gap-3 overflow-x-hidden overflow-y-scroll scrollbar-hide'>
        {renderNotifications()}
      </div>
    </PopoverContent>
  )
}
