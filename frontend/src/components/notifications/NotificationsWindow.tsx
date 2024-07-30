import { Button, PopoverContent, Tooltip } from "@nextui-org/react"
import { Trash } from "lucide-react"
import { useContext } from "react"
import { notificationsContext } from "../../contexts/notificationsContext"
import NotificationComponent from "./components/NotificationComponent"

type NotificationsWindowProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const NotificationsWindow = ({ isOpen, setIsOpen }: NotificationsWindowProps) => {
  const { notifications, notification } = useContext(notificationsContext)

  const clearNotificationsHandler = () => {
    notification.clear()
    setIsOpen(false)
  }

  return (
    <PopoverContent className='w-[480px] px-4 pt-3 pb-4'>
      <div className='w-full flex items-center justify-between mb-2'>
        <h1 className='text-medium font-medium'>Notifications</h1>
        <Tooltip
          content='Clear notifications'
          radius='sm'>
          <Button
            onClick={clearNotificationsHandler}
            variant='light'
            size='sm'
            isIconOnly>
            <Trash />
          </Button>
        </Tooltip>
      </div>
      <div className='grid gap-3 w-full max-h-[50vh] overflow-x-hidden overflow-y-scroll scrollbar-hide'>
        {notifications.sort((a, b) => b.timestamp - a.timestamp).map((notification) => (
          <NotificationComponent
            key={notification.timestamp}
            notification={notification}
          />
        ))}
      </div>
    </PopoverContent>
  )
}
